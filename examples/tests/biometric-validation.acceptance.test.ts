// EJEMPLO PRÁCTICO: Prueba de Aceptación para Validación Biométrica
// Este archivo muestra cómo implementar pruebas de aceptación que validan
// el flujo completo de validación biométrica desde la perspectiva del usuario

import request from 'supertest';
import { app } from '../../src/app';
import { DataSource } from 'typeorm';
import { User } from '../../src/interfaces/entity/user.entity';
import { Shift } from '../../src/interfaces/entity/shift.entity';
import { ShiftValidationBiometric } from '../../src/interfaces/entity/shift_validation_biometric.entity';

describe('Biometric Validation - Acceptance Tests', () => {
  let testDb: DataSource;
  let testUser: User;
  let testShift: Shift;

  beforeAll(async () => {
    // Configurar base de datos de prueba
    testDb = new DataSource({
      type: 'postgres',
      host: process.env.TEST_DB_HOST || 'localhost',
      port: parseInt(process.env.TEST_DB_PORT || '5432'),
      username: process.env.TEST_DB_USER || 'test',
      password: process.env.TEST_DB_PASSWORD || 'test',
      database: process.env.TEST_DB_NAME || 'test_acceptance_db',
      entities: ['src/interfaces/entity/*.entity.ts'],
      synchronize: true,
      dropSchema: true,
    });

    await testDb.initialize();
  });

  beforeEach(async () => {
    // Limpiar datos antes de cada test
    await testDb.getRepository(ShiftValidationBiometric).clear();
    await testDb.getRepository(User).clear();
    await testDb.getRepository(Shift).clear();

    // Crear datos de prueba base
    testUser = await testDb.getRepository(User).save({
      name: 'Juan Pérez',
      email: 'juan@security.com',
      biometric_data: 'valid_fingerprint_hash_12345',
      role: { id: 1 }
    });

    testShift = await testDb.getRepository(Shift).save({
      name: 'Turno Matutino',
      start_time: '07:00',
      end_time: '17:00'
    });
  });

  afterAll(async () => {
    await testDb.destroy();
  });

  describe('Historia de Usuario: Como guardia de seguridad, quiero validar mi identidad biométricamente al iniciar mi turno', () => {
    
    it('Escenario: Guardia válido inicia turno con datos biométricos correctos', async () => {
      // Given: Un guardia registrado con datos biométricos
      // (ya creado en beforeEach)

      // When: El guardia intenta validar su identidad al inicio del turno
      const response = await request(app)
        .post('/api/v1/shift-validation-biometric')
        .send({
          user_id: testUser.id,
          shift_id: testShift.id,
          biometric_data: 'valid_fingerprint_hash_12345',
          validation_type: 'start'
        });

      // Then: La validación debe ser exitosa
      expect(response.status).toBe(201);
      expect(response.body.message).toContain('Validación biométrica exitosa');
      expect(response.body.data.status).toBe('validated');
      expect(response.body.data.validation_time).toBeDefined();
      expect(response.body.data.user_id).toBe(testUser.id);
      expect(response.body.data.shift_id).toBe(testShift.id);

      // And: La validación debe quedar registrada en el sistema
      const validationRecord = await testDb.getRepository(ShiftValidationBiometric)
        .findOne({ where: { user_id: testUser.id, shift_id: testShift.id } });

      expect(validationRecord).not.toBeNull();
      expect(validationRecord?.status).toBe('validated');
    });

    it('Escenario: Guardia intenta validar con datos biométricos incorrectos', async () => {
      // Given: Un guardia registrado con datos biométricos específicos
      // (ya creado en beforeEach)

      // When: El guardia intenta validar con datos biométricos incorrectos
      const response = await request(app)
        .post('/api/v1/shift-validation-biometric')
        .send({
          user_id: testUser.id,
          shift_id: testShift.id,
          biometric_data: 'invalid_fingerprint_hash_99999',
          validation_type: 'start'
        });

      // Then: La validación debe fallar
      expect(response.status).toBe(401);
      expect(response.body.message).toContain('Datos biométricos inválidos');
      expect(response.body.error).toBe('BIOMETRIC_MISMATCH');

      // And: No debe crearse ningún registro de validación exitosa
      const validationRecord = await testDb.getRepository(ShiftValidationBiometric)
        .findOne({ where: { user_id: testUser.id, shift_id: testShift.id, status: 'validated' } });

      expect(validationRecord).toBeNull();
    });

    it('Escenario: Guardia no registrado intenta validar biométricamente', async () => {
      // Given: Un usuario que no existe en el sistema
      const nonExistentUserId = 9999;

      // When: Se intenta validar con un usuario inexistente
      const response = await request(app)
        .post('/api/v1/shift-validation-biometric')
        .send({
          user_id: nonExistentUserId,
          shift_id: testShift.id,
          biometric_data: 'any_fingerprint_hash',
          validation_type: 'start'
        });

      // Then: La validación debe fallar
      expect(response.status).toBe(404);
      expect(response.body.message).toContain('Usuario no encontrado');
      expect(response.body.error).toBe('USER_NOT_FOUND');
    });
  });

  describe('Historia de Usuario: Como guardia de seguridad, quiero finalizar mi turno con validación biométrica', () => {
    
    beforeEach(async () => {
      // Crear validación de inicio para poder finalizar
      await testDb.getRepository(ShiftValidationBiometric).save({
        user_id: testUser.id,
        shift_id: testShift.id,
        biometric_data: 'valid_fingerprint_hash_12345',
        validation_type: 'start',
        status: 'validated',
        validation_time: new Date()
      });
    });

    it('Escenario: Guardia finaliza turno correctamente', async () => {
      // Given: Un guardia que ya inició su turno con validación biométrica
      // (creado en beforeEach de este describe)

      // When: El guardia intenta finalizar su turno
      const response = await request(app)
        .post('/api/v1/shift-validation-biometric')
        .send({
          user_id: testUser.id,
          shift_id: testShift.id,
          biometric_data: 'valid_fingerprint_hash_12345',
          validation_type: 'end'
        });

      // Then: La finalización debe ser exitosa
      expect(response.status).toBe(201);
      expect(response.body.message).toContain('Turno finalizado correctamente');
      expect(response.body.data.status).toBe('validated');
      expect(response.body.data.validation_type).toBe('end');

      // And: Deben existir dos registros: inicio y fin del turno
      const validationRecords = await testDb.getRepository(ShiftValidationBiometric)
        .find({ where: { user_id: testUser.id, shift_id: testShift.id } });

      expect(validationRecords).toHaveLength(2);
      expect(validationRecords.some(r => r.validation_type === 'start')).toBe(true);
      expect(validationRecords.some(r => r.validation_type === 'end')).toBe(true);
    });

    it('Escenario: Guardia intenta finalizar turno sin haberlo iniciado', async () => {
      // Given: Un guardia que no ha iniciado turno
      const newUser = await testDb.getRepository(User).save({
        name: 'María García',
        email: 'maria@security.com',
        biometric_data: 'valid_fingerprint_hash_54321',
        role: { id: 1 }
      });

      // When: Intenta finalizar un turno sin haberlo iniciado
      const response = await request(app)
        .post('/api/v1/shift-validation-biometric')
        .send({
          user_id: newUser.id,
          shift_id: testShift.id,
          biometric_data: 'valid_fingerprint_hash_54321',
          validation_type: 'end'
        });

      // Then: La operación debe fallar
      expect(response.status).toBe(400);
      expect(response.body.message).toContain('No se puede finalizar un turno que no ha sido iniciado');
      expect(response.body.error).toBe('SHIFT_NOT_STARTED');
    });
  });

  describe('Historia de Usuario: Como supervisor, quiero ver el historial de validaciones biométricas', () => {
    
    beforeEach(async () => {
      // Crear varios registros de validación para diferentes usuarios
      const users = await testDb.getRepository(User).save([
        {
          name: 'Pedro Martínez',
          email: 'pedro@security.com',
          biometric_data: 'fingerprint_hash_001',
          role: { id: 1 }
        },
        {
          name: 'Ana López',
          email: 'ana@security.com',
          biometric_data: 'fingerprint_hash_002',
          role: { id: 1 }
        }
      ]);

      await testDb.getRepository(ShiftValidationBiometric).save([
        {
          user_id: users[0].id,
          shift_id: testShift.id,
          validation_type: 'start',
          status: 'validated',
          validation_time: new Date('2024-01-15T07:00:00Z')
        },
        {
          user_id: users[0].id,
          shift_id: testShift.id,
          validation_type: 'end',
          status: 'validated',
          validation_time: new Date('2024-01-15T17:00:00Z')
        },
        {
          user_id: users[1].id,
          shift_id: testShift.id,
          validation_type: 'start',
          status: 'validated',
          validation_time: new Date('2024-01-15T07:15:00Z')
        }
      ]);
    });

    it('Escenario: Supervisor consulta todas las validaciones del día', async () => {
      // Given: Múltiples validaciones biométricas registradas
      // (creadas en beforeEach)

      // When: El supervisor consulta las validaciones
      const response = await request(app)
        .get('/api/v1/shift-validation-biometric')
        .query({ 
          date: '2024-01-15',
          shift_id: testShift.id 
        });

      // Then: Debe obtener todas las validaciones
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(3);
      
      // And: Los datos deben incluir información del usuario y turno
      const validations = response.body.data;
      expect(validations[0]).toHaveProperty('user');
      expect(validations[0]).toHaveProperty('shift');
      expect(validations[0]).toHaveProperty('validation_time');
      expect(validations[0]).toHaveProperty('status');
    });

    it('Escenario: Supervisor filtra validaciones por usuario específico', async () => {
      // Given: Validaciones de múltiples usuarios
      // (creadas en beforeEach)

      // When: El supervisor filtra por un usuario específico
      const response = await request(app)
        .get('/api/v1/shift-validation-biometric')
        .query({ 
          user_id: testUser.id,
          date: '2024-01-15'
        });

      // Then: Debe obtener solo las validaciones de ese usuario
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThan(0);
      response.body.data.forEach((validation: any) => {
        expect(validation.user_id).toBe(testUser.id);
      });
    });
  });

  describe('Historia de Usuario: Como sistema, debo manejar casos de falla en el dispositivo biométrico', () => {
    
    it('Escenario: Dispositivo biométrico no responde', async () => {
      // Given: Un escenario donde el dispositivo biométrico falla
      // When: Se intenta una validación durante la falla
      const response = await request(app)
        .post('/api/v1/shift-validation-biometric')
        .send({
          user_id: testUser.id,
          shift_id: testShift.id,
          biometric_data: null, // Simular falla del dispositivo
          validation_type: 'start'
        });

      // Then: El sistema debe manejar la falla apropiadamente
      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Datos biométricos requeridos');
      expect(response.body.error).toBe('MISSING_BIOMETRIC_DATA');
    });

    it('Escenario: Validación manual de emergencia', async () => {
      // Given: Un escenario de emergencia donde se requiere validación manual
      // When: Se utiliza el endpoint de validación de emergencia
      const response = await request(app)
        .post('/api/v1/shift-validation-biometric/emergency')
        .send({
          user_id: testUser.id,
          shift_id: testShift.id,
          supervisor_id: 1,
          emergency_reason: 'Falla en dispositivo biométrico',
          validation_type: 'start'
        });

      // Then: La validación de emergencia debe ser procesada
      expect(response.status).toBe(201);
      expect(response.body.data.status).toBe('emergency_validated');
      expect(response.body.data.emergency_reason).toBeDefined();
      expect(response.body.data.supervisor_id).toBe(1);
    });
  });

  describe('Escenarios de Performance y Concurrencia', () => {
    
    it('Escenario: Múltiples guardias validan simultáneamente al inicio de turno', async () => {
      // Given: Múltiples guardias listos para iniciar turno
      const users = await testDb.getRepository(User).save([
        { name: 'Guardia 1', email: 'g1@test.com', biometric_data: 'hash1', role: { id: 1 } },
        { name: 'Guardia 2', email: 'g2@test.com', biometric_data: 'hash2', role: { id: 1 } },
        { name: 'Guardia 3', email: 'g3@test.com', biometric_data: 'hash3', role: { id: 1 } },
        { name: 'Guardia 4', email: 'g4@test.com', biometric_data: 'hash4', role: { id: 1 } },
        { name: 'Guardia 5', email: 'g5@test.com', biometric_data: 'hash5', role: { id: 1 } }
      ]);

      // When: Todos intentan validar simultáneamente
      const validationPromises = users.map((user, index) =>
        request(app)
          .post('/api/v1/shift-validation-biometric')
          .send({
            user_id: user.id,
            shift_id: testShift.id,
            biometric_data: `hash${index + 1}`,
            validation_type: 'start'
          })
      );

      const responses = await Promise.all(validationPromises);

      // Then: Todas las validaciones deben procesarse correctamente
      responses.forEach(response => {
        expect(response.status).toBe(201);
        expect(response.body.data.status).toBe('validated');
      });

      // And: Todas las validaciones deben estar registradas
      const validationCount = await testDb.getRepository(ShiftValidationBiometric)
        .count({ where: { shift_id: testShift.id, status: 'validated' } });

      expect(validationCount).toBe(5);
    });
  });
});