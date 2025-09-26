// EJEMPLO PRÁCTICO: Prueba de Integración para PatrolAssignment
// Este archivo muestra cómo implementar pruebas de integración que verifican
// la correcta interacción entre PatrolAssignmentService y CheckpointRecordService

import { DataSource } from 'typeorm';
import request from 'supertest';
import { app } from '../../src/app';
import { User } from '../../src/interfaces/entity/user.entity';
import { Patrol } from '../../src/interfaces/entity/patrol.entity';
import { Shift } from '../../src/interfaces/entity/shift.entity';
import { PatrolAssignment } from '../../src/interfaces/entity/patrol_assignment.entity';
import { CheckpointRecord } from '../../src/interfaces/entity/checkpoint_record.entity';
import { PatrolRoutePoint } from '../../src/interfaces/entity/patrol_route_point.entity';
import { Checkpoint } from '../../src/interfaces/entity/checkpoint.entity';

describe('PatrolAssignment Integration Tests', () => {
  let testDb: DataSource;
  let testUser: User;
  let testPatrol: Patrol;
  let testShift: Shift;
  let testCheckpoints: Checkpoint[];

  beforeAll(async () => {
    // Configurar base de datos de prueba
    testDb = new DataSource({
      type: 'postgres',
      host: process.env.TEST_DB_HOST || 'localhost',
      port: parseInt(process.env.TEST_DB_PORT || '5432'),
      username: process.env.TEST_DB_USER || 'test',
      password: process.env.TEST_DB_PASSWORD || 'test',
      database: process.env.TEST_DB_NAME || 'test_db',
      entities: ['src/interfaces/entity/*.entity.ts'],
      synchronize: true,
      dropSchema: true,
    });

    await testDb.initialize();
  });

  beforeEach(async () => {
    // Limpiar y preparar datos de prueba
    await testDb.getRepository(CheckpointRecord).clear();
    await testDb.getRepository(PatrolAssignment).clear();
    await testDb.getRepository(PatrolRoutePoint).clear();
    await testDb.getRepository(User).clear();
    await testDb.getRepository(Patrol).clear();
    await testDb.getRepository(Shift).clear();
    await testDb.getRepository(Checkpoint).clear();

    // Crear datos de prueba
    testUser = await testDb.getRepository(User).save({
      name: 'Guardia Prueba',
      email: 'guardia@test.com',
      role: { id: 1 }
    });

    testShift = await testDb.getRepository(Shift).save({
      name: 'Turno Matutino',
      start_time: '07:00',
      end_time: '17:00'
    });

    testCheckpoints = await testDb.getRepository(Checkpoint).save([
      { name: 'Checkpoint 1', description: 'Entrada Principal' },
      { name: 'Checkpoint 2', description: 'Área de Parking' },
      { name: 'Checkpoint 3', description: 'Oficinas' }
    ]);

    testPatrol = await testDb.getRepository(Patrol).save({
      name: 'Patrulla de Prueba',
      description: 'Patrulla para testing'
    });

    // Crear puntos de ruta para la patrulla
    await testDb.getRepository(PatrolRoutePoint).save([
      { 
        patrol: testPatrol, 
        checkpoint: testCheckpoints[0], 
        order: 1 
      },
      { 
        patrol: testPatrol, 
        checkpoint: testCheckpoints[1], 
        order: 2 
      },
      { 
        patrol: testPatrol, 
        checkpoint: testCheckpoints[2], 
        order: 3 
      }
    ]);
  });

  afterAll(async () => {
    await testDb.destroy();
  });

  describe('POST /api/v1/patrol-assignments', () => {
    it('should create patrol assignment and generate checkpoint records automatically', async () => {
      // Arrange
      const assignmentData = {
        user_id: testUser.id,
        patrol_id: testPatrol.id,
        shift_id: testShift.id,
        date: '2024-01-15T00:00:00.000Z'
      };

      // Act - Crear asignación de patrulla
      const response = await request(app)
        .post('/api/v1/patrol-assignments')
        .send(assignmentData)
        .expect(201);

      // Assert - Verificar que se creó la asignación
      expect(response.body.message).toBe('Asignación creada correctamente');
      expect(response.body.data.id).toBeDefined();

      const assignmentId = response.body.data.id;

      // Verificar que se crearon los checkpoint records automáticamente
      const checkpointRecords = await testDb.getRepository(CheckpointRecord)
        .find({ 
          where: { patrol_assignment_id: assignmentId },
          order: { checkpoint_id: 'ASC' }
        });

      expect(checkpointRecords).toHaveLength(3);
      
      // Verificar que todos los checkpoint records tienen el estado inicial correcto
      checkpointRecords.forEach((record, index) => {
        expect(record.status).toBe('pending');
        expect(record.checkpoint_id).toBe(testCheckpoints[index].id);
        expect(record.check_time).toBeDefined();
        expect(record.real_check).toBeNull();
      });

      // Verificar que las horas están distribuidas correctamente
      const firstCheckTime = new Date(checkpointRecords[0].check_time);
      const lastCheckTime = new Date(checkpointRecords[2].check_time);
      
      expect(firstCheckTime).toBeLessThan(lastCheckTime);
      expect(firstCheckTime.getHours()).toBeGreaterThanOrEqual(7);
      expect(lastCheckTime.getHours()).toBeLessThanOrEqual(17);
    });

    it('should handle patrol assignment deletion and cascade delete checkpoint records', async () => {
      // Arrange - Crear asignación primero
      const assignmentData = {
        user_id: testUser.id,
        patrol_id: testPatrol.id,
        shift_id: testShift.id,
        date: '2024-01-15T00:00:00.000Z'
      };

      const createResponse = await request(app)
        .post('/api/v1/patrol-assignments')
        .send(assignmentData)
        .expect(201);

      const assignmentId = createResponse.body.data.id;

      // Verificar que existen checkpoint records
      let checkpointRecords = await testDb.getRepository(CheckpointRecord)
        .find({ where: { patrol_assignment_id: assignmentId } });
      expect(checkpointRecords).toHaveLength(3);

      // Act - Eliminar asignación
      await request(app)
        .delete(`/api/v1/patrol-assignments/${assignmentId}`)
        .expect(200);

      // Assert - Verificar que se eliminaron los checkpoint records
      checkpointRecords = await testDb.getRepository(CheckpointRecord)
        .find({ where: { patrol_assignment_id: assignmentId } });
      expect(checkpointRecords).toHaveLength(0);
    });

    it('should validate required fields and relationships', async () => {
      // Act & Assert - Datos incompletos
      await request(app)
        .post('/api/v1/patrol-assignments')
        .send({
          user_id: testUser.id,
          // patrol_id faltante
          shift_id: testShift.id,
          date: '2024-01-15T00:00:00.000Z'
        })
        .expect(422);

      // Act & Assert - Usuario inexistente
      await request(app)
        .post('/api/v1/patrol-assignments')
        .send({
          user_id: 9999,
          patrol_id: testPatrol.id,
          shift_id: testShift.id,
          date: '2024-01-15T00:00:00.000Z'
        })
        .expect(404);
    });
  });

  describe('Checkpoint Record Updates', () => {
    let assignmentId: number;

    beforeEach(async () => {
      // Crear asignación para cada test
      const assignmentData = {
        user_id: testUser.id,
        patrol_id: testPatrol.id,
        shift_id: testShift.id,
        date: '2024-01-15T00:00:00.000Z'
      };

      const response = await request(app)
        .post('/api/v1/patrol-assignments')
        .send(assignmentData);

      assignmentId = response.body.data.id;
    });

    it('should update checkpoint record status when guard checks in', async () => {
      // Arrange - Obtener el primer checkpoint record
      const checkpointRecords = await testDb.getRepository(CheckpointRecord)
        .find({ 
          where: { patrol_assignment_id: assignmentId },
          order: { checkpoint_id: 'ASC' }
        });

      const firstRecord = checkpointRecords[0];
      const checkInTime = new Date();

      // Act - Actualizar el checkpoint record
      const response = await request(app)
        .put(`/api/v1/checkpoint-records/${firstRecord.id}`)
        .send({
          status: 'completed',
          real_check: checkInTime.toISOString()
        })
        .expect(200);

      // Assert
      expect(response.body.data.status).toBe('completed');
      expect(response.body.data.real_check).toBeDefined();

      // Verificar en base de datos
      const updatedRecord = await testDb.getRepository(CheckpointRecord)
        .findOne({ where: { id: firstRecord.id } });

      expect(updatedRecord?.status).toBe('completed');
      expect(updatedRecord?.real_check).toBeDefined();
    });

    it('should mark checkpoint as late when checked after scheduled time', async () => {
      // Arrange
      const checkpointRecords = await testDb.getRepository(CheckpointRecord)
        .find({ 
          where: { patrol_assignment_id: assignmentId },
          order: { checkpoint_id: 'ASC' }
        });

      const record = checkpointRecords[0];
      const scheduledTime = new Date(record.check_time);
      const lateCheckTime = new Date(scheduledTime.getTime() + 60 * 60 * 1000); // 1 hora tarde

      // Act
      const response = await request(app)
        .put(`/api/v1/checkpoint-records/${record.id}`)
        .send({
          status: 'late',
          real_check: lateCheckTime.toISOString()
        })
        .expect(200);

      // Assert
      expect(response.body.data.status).toBe('late');
      expect(new Date(response.body.data.real_check)).toEqual(lateCheckTime);
    });
  });

  describe('Complex Integration Scenarios', () => {
    it('should handle multiple concurrent patrol assignments', async () => {
      // Arrange - Crear múltiples usuarios
      const users = await testDb.getRepository(User).save([
        { name: 'Guardia 1', email: 'guardia1@test.com', role: { id: 1 } },
        { name: 'Guardia 2', email: 'guardia2@test.com', role: { id: 1 } },
        { name: 'Guardia 3', email: 'guardia3@test.com', role: { id: 1 } }
      ]);

      // Act - Crear asignaciones concurrentes
      const assignmentPromises = users.map(user =>
        request(app)
          .post('/api/v1/patrol-assignments')
          .send({
            user_id: user.id,
            patrol_id: testPatrol.id,
            shift_id: testShift.id,
            date: '2024-01-15T00:00:00.000Z'
          })
      );

      const responses = await Promise.all(assignmentPromises);

      // Assert - Verificar que todas las asignaciones se crearon
      responses.forEach(response => {
        expect(response.status).toBe(201);
        expect(response.body.data.id).toBeDefined();
      });

      // Verificar que se crearon todos los checkpoint records
      const totalCheckpointRecords = await testDb.getRepository(CheckpointRecord)
        .count();

      expect(totalCheckpointRecords).toBe(9); // 3 usuarios × 3 checkpoints
    });
  });
});