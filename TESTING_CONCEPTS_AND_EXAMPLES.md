# Conceptos de Pruebas y Ejemplos Prácticos en Api_Negocio_Rondines

## 📋 Índice
1. [Pruebas Unitarias](#pruebas-unitarias)
2. [Pruebas de Aceptación](#pruebas-de-aceptación)
3. [Pruebas de Integración](#pruebas-de-integración)
4. [Pruebas de Regresión](#pruebas-de-regresión)
5. [Pruebas de Rendimiento](#pruebas-de-rendimiento)
6. [Pruebas de Esfuerzo](#pruebas-de-esfuerzo)
7. [Estado Actual del Proyecto](#estado-actual-del-proyecto)

---

## 🧪 Pruebas Unitarias

### Concepto
Las pruebas unitarias verifican el funcionamiento correcto de unidades individuales de código (funciones, métodos, clases) de forma aislada, utilizando mocks o stubs para dependencias externas.

### Características
- **Rápidas**: Se ejecutan en milisegundos
- **Aisladas**: No dependen de bases de datos, APIs externas, o archivos
- **Específicas**: Prueban una sola funcionalidad
- **Automatizadas**: Se ejecutan como parte del proceso de desarrollo

### Ejemplo en el Repositorio

**Archivo donde se podría aplicar**: `src/services/user.service.ts`

```typescript
// Ejemplo de prueba unitaria para UserService.create()
import { UserService } from '../src/services/user.service';
import { User } from '../src/entities/user.entity';

describe('UserService', () => {
  let userService: UserService;
  let mockUserRepository: jest.Mocked<Repository<User>>;

  beforeEach(() => {
    // Mock del repositorio
    mockUserRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
    } as any;
    
    userService = new UserService();
    // Inyectar mock
    (userService as any).userRepository = mockUserRepository;
  });

  describe('create', () => {
    it('should create a new user with valid data', async () => {
      // Arrange
      const userData = {
        name: 'Juan Pérez',
        email: 'juan@example.com',
        role_id: 1
      };
      
      const expectedUser = { id: 1, ...userData };
      mockUserRepository.create.mockReturnValue(expectedUser as User);
      mockUserRepository.save.mockResolvedValue(expectedUser as User);

      // Act
      const result = await userService.create(userData);

      // Assert
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        ...userData,
        role: { id: userData.role_id }
      });
      expect(mockUserRepository.save).toHaveBeenCalledWith(expectedUser);
      expect(result).toEqual(expectedUser);
    });
  });
});
```

---

## ✅ Pruebas de Aceptación

### Concepto
Las pruebas de aceptación validan que el sistema cumple con los requisitos de negocio desde la perspectiva del usuario final. Verifican escenarios completos de uso.

### Características
- **End-to-End**: Prueban flujos completos de trabajo
- **Orientadas al negocio**: Basadas en historias de usuario
- **Automatizables**: Usando herramientas como Cucumber, Cypress, o Supertest
- **Validación funcional**: Confirman que el software hace lo que debe hacer

### Ejemplo en el Repositorio

**Funcionalidad**: Sistema de asignación de patrullas y generación automática de checkpoint records

```typescript
// Ejemplo de prueba de aceptación para el flujo completo de asignación de patrulla
describe('Patrol Assignment Workflow - Acceptance Tests', () => {
  it('should create patrol assignment and generate checkpoint records automatically', async () => {
    // Given: Un usuario, patrulla y turno existen
    const user = await createTestUser();
    const patrol = await createTestPatrol();
    const shift = await createTestShift();
    
    // When: Se crea una asignación de patrulla
    const response = await request(app)
      .post('/api/v1/patrol-assignments')
      .send({
        user_id: user.id,
        patrol_id: patrol.id,
        shift_id: shift.id,
        date: '2024-01-15T00:00:00.000Z'
      })
      .expect(201);

    // Then: Se debe crear la asignación
    expect(response.body.message).toBe('Asignación creada correctamente');
    
    // And: Se deben generar automáticamente los checkpoint records
    const checkpointRecords = await request(app)
      .get(`/api/v1/checkpoint-records?patrol_assignment_id=${response.body.data.id}`)
      .expect(200);
    
    expect(checkpointRecords.body.data).toHaveLength(patrol.checkpoints.length);
    expect(checkpointRecords.body.data[0].status).toBe('pending');
    expect(checkpointRecords.body.data[0].check_time).toBeDefined();
  });
});
```

---

## 🔗 Pruebas de Integración

### Concepto
Las pruebas de integración verifican que diferentes módulos o servicios trabajen correctamente cuando se combinan. Prueban las interfaces entre componentes.

### Características
- **Interacción entre módulos**: Verifican comunicación entre servicios
- **Bases de datos reales**: Utilizan bases de datos de prueba
- **APIs externas**: Pueden incluir servicios externos (con cuidado)
- **Configuración específica**: Requieren entorno de pruebas

### Ejemplo en el Repositorio

**Funcionalidad**: Integración entre PatrolAssignmentService y CheckpointRecordService

```typescript
// Ejemplo de prueba de integración
describe('PatrolAssignment and CheckpointRecord Integration', () => {
  let testDb: DataSource;
  
  beforeAll(async () => {
    // Configurar base de datos de prueba
    testDb = await createTestDatabase();
  });

  it('should create checkpoint records when patrol assignment is created', async () => {
    // Arrange: Crear datos de prueba en la base de datos
    const user = await testDb.getRepository(User).save({
      name: 'Test Guard',
      email: 'guard@test.com'
    });
    
    const patrol = await testDb.getRepository(Patrol).save({
      name: 'Test Patrol'
    });
    
    // Crear puntos de ruta para la patrulla
    await testDb.getRepository(PatrolRoutePoint).save([
      { patrol_id: patrol.id, checkpoint_id: 1, order: 1 },
      { patrol_id: patrol.id, checkpoint_id: 2, order: 2 }
    ]);

    // Act: Crear asignación usando el servicio real
    const patrolAssignmentService = new PatrolAssignmentService();
    const assignment = await patrolAssignmentService.create({
      user_id: user.id,
      patrol_id: patrol.id,
      shift_id: 1,
      date: new Date()
    });

    // Assert: Verificar que se crearon los checkpoint records
    const checkpointRecords = await testDb.getRepository(CheckpointRecord)
      .find({ where: { patrol_assignment_id: assignment.id } });
    
    expect(checkpointRecords).toHaveLength(2);
    expect(checkpointRecords[0].status).toBe('pending');
    expect(checkpointRecords[1].status).toBe('pending');
  });

  afterAll(async () => {
    await testDb.destroy();
  });
});
```

---

## 🔄 Pruebas de Regresión

### Concepto
Las pruebas de regresión aseguran que las nuevas modificaciones del código no hayan roto funcionalidades existentes que previamente funcionaban correctamente.

### Características
- **Preventivas**: Detectan problemas antes de producción
- **Automatizadas**: Se ejecutan en CI/CD
- **Cobertura amplia**: Incluyen casos críticos del negocio
- **Versionado**: Se mantienen actualizadas con cada release

### Ejemplo en el Repositorio

**Funcionalidad**: Validación biométrica de turnos (feature crítica)

```typescript
// Ejemplo de suite de pruebas de regresión
describe('Biometric Validation - Regression Tests', () => {
  // Test que debe pasar siempre, sin importar cambios nuevos
  it('should validate shift start with correct biometric data', async () => {
    const testData = {
      user_id: 1,
      shift_id: 1,
      biometric_data: 'valid_fingerprint_hash',
      validation_type: 'start'
    };

    const response = await request(app)
      .post('/api/v1/shift-validation-biometric')
      .send(testData)
      .expect(201);

    expect(response.body.data.status).toBe('validated');
    expect(response.body.data.validation_time).toBeDefined();
  });

  it('should reject invalid biometric data', async () => {
    const testData = {
      user_id: 1,
      shift_id: 1,
      biometric_data: 'invalid_hash',
      validation_type: 'start'
    };

    const response = await request(app)
      .post('/api/v1/shift-validation-biometric')
      .send(testData)
      .expect(400);

    expect(response.body.message).toContain('Datos biométricos inválidos');
  });

  // Test de funcionalidad legacy que no debe romperse
  it('should maintain backwards compatibility with old validation format', async () => {
    const legacyData = {
      userId: 1, // Formato antiguo
      shiftId: 1,
      fingerprint: 'legacy_format_hash'
    };

    const response = await request(app)
      .post('/api/v1/shift-validation/legacy')
      .send(legacyData)
      .expect(200);

    expect(response.body.success).toBe(true);
  });
});
```

---

## ⚡ Pruebas de Rendimiento

### Concepto
Las pruebas de rendimiento evalúan la velocidad, estabilidad y escalabilidad del sistema bajo diferentes cargas de trabajo.

### Características
- **Métricas específicas**: Tiempo de respuesta, throughput, uso de recursos
- **Condiciones controladas**: Cargas de trabajo definidas
- **Herramientas especializadas**: JMeter, k6, Artillery
- **Límites aceptables**: SLA definidos

### Ejemplo en el Repositorio

**Funcionalidad**: Endpoint de consulta masiva de checkpoint records

```typescript
// Ejemplo usando k6 o similar
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 10 }, // Warm up
    { duration: '5m', target: 50 }, // Stay at 50 users
    { duration: '2m', target: 100 }, // Ramp up to 100 users
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% de requests < 500ms
    http_req_failed: ['rate<0.01'], // Menos del 1% de errores
  },
};

export default function () {
  // Test del endpoint más usado: obtener checkpoint records
  let response = http.get('http://localhost:3000/api/v1/checkpoint-records', {
    headers: { 
      'Authorization': 'Bearer test_token',
      'Content-Type': 'application/json'
    },
  });

  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
    'response has data': (r) => JSON.parse(r.body).data !== undefined,
  });

  sleep(1);
}
```

**Ejemplo con Artillery.js:**

```yaml
# artillery-test.yml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
  payload:
    path: 'test-users.csv'
    fields:
      - user_id
      - token

scenarios:
  - name: "Get checkpoint records performance test"
    weight: 70
    flow:
      - get:
          url: "/api/v1/checkpoint-records"
          headers:
            Authorization: "Bearer {{ token }}"
          capture:
            - json: "$.data.length"
              as: "record_count"
      - think: 2

  - name: "Create patrol assignment performance test"
    weight: 30
    flow:
      - post:
          url: "/api/v1/patrol-assignments"
          headers:
            Authorization: "Bearer {{ token }}"
            Content-Type: "application/json"
          json:
            user_id: "{{ user_id }}"
            patrol_id: 1
            shift_id: 1
            date: "2024-01-15T00:00:00.000Z"
```

---

## 💪 Pruebas de Esfuerzo (Stress Tests)

### Concepto
Las pruebas de esfuerzo determinan los límites del sistema aplicando cargas extremas hasta encontrar el punto de ruptura y evaluar cómo se comporta bajo condiciones adversas.

### Características
- **Cargas extremas**: Más allá de la capacidad normal
- **Punto de ruptura**: Encuentra los límites del sistema
- **Recuperación**: Evalúa cómo se recupera el sistema
- **Detección de memory leaks**: Problemas de gestión de recursos

### Ejemplo en el Repositorio

**Funcionalidad**: Sistema de validación biométrica bajo carga extrema

```typescript
// Ejemplo de prueba de esfuerzo
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '1m', target: 50 },   // Carga normal
    { duration: '3m', target: 200 },  // Incremento gradual
    { duration: '5m', target: 500 },  // Carga alta
    { duration: '3m', target: 1000 }, // Carga extrema - punto de ruptura
    { duration: '5m', target: 1000 }, // Mantener carga extrema
    { duration: '3m', target: 0 },    // Recuperación
  ],
  thresholds: {
    http_req_duration: ['p(99)<2000'], // 99% requests < 2s bajo estrés
    http_req_failed: ['rate<0.05'], // Máximo 5% de errores aceptable
  },
};

export default function () {
  let scenarios = [
    // Escenario 1: Validación biométrica masiva
    () => {
      let biometricData = {
        user_id: Math.floor(Math.random() * 100) + 1,
        shift_id: Math.floor(Math.random() * 3) + 1,
        biometric_data: `stress_test_${Math.random().toString(36)}`,
        validation_type: 'start'
      };

      let response = http.post(
        'http://localhost:3000/api/v1/shift-validation-biometric',
        JSON.stringify(biometricData),
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );

      check(response, {
        'biometric validation survives stress': (r) => r.status < 500,
      });
    },

    // Escenario 2: Creación masiva de asignaciones
    () => {
      let assignmentData = {
        user_id: Math.floor(Math.random() * 50) + 1,
        patrol_id: Math.floor(Math.random() * 10) + 1,
        shift_id: Math.floor(Math.random() * 3) + 1,
        date: new Date().toISOString()
      };

      let response = http.post(
        'http://localhost:3000/api/v1/patrol-assignments',
        JSON.stringify(assignmentData),
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );

      check(response, {
        'patrol assignment creation under stress': (r) => r.status < 500,
        'database handles concurrent writes': (r) => !r.body.includes('deadlock'),
      });
    },

    // Escenario 3: Consultas intensivas
    () => {
      let response = http.get(
        `http://localhost:3000/api/v1/checkpoint-records?limit=100&offset=${Math.floor(Math.random() * 1000)}`
      );

      check(response, {
        'queries survive under stress': (r) => r.status === 200,
        'response not empty under stress': (r) => r.body.length > 0,
      });
    }
  ];

  // Ejecutar escenario aleatorio
  let scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
  scenario();

  sleep(0.1); // Mínimo descanso para máximo estrés
}
```

---

## 📊 Estado Actual del Proyecto

### Infraestructura de Pruebas Existente

**❌ No implementado actualmente:**
- No hay framework de testing configurado
- El script de test en `package.json` muestra: `"Error: no test specified"`
- No existen archivos de prueba en el repositorio
- No hay configuración de CI/CD para pruebas

### Recomendaciones de Implementación

#### 1. **Configuración Básica de Testing**

```json
// Agregar al package.json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:integration": "jest --testPathPattern=integration",
    "test:unit": "jest --testPathPattern=unit"
  },
  "devDependencies": {
    "jest": "^29.0.0",
    "@types/jest": "^29.0.0",
    "ts-jest": "^29.0.0",
    "supertest": "^6.3.0",
    "@types/supertest": "^2.0.12"
  }
}
```

#### 2. **Estructura de Carpetas Sugerida**

```
/tests
  /unit
    /services
      - user.service.test.ts
      - patrol.service.test.ts
    /controllers
      - user.controller.test.ts
  /integration
    - patrol-assignment.integration.test.ts
  /acceptance
    - user-workflow.acceptance.test.ts
  /performance
    - api-load.k6.js
  /fixtures
    - test-data.ts
  /helpers
    - test-setup.ts
```

#### 3. **Prioridades de Implementación**

1. **Fase 1** - Pruebas Unitarias para servicios críticos:
   - UserService
   - PatrolAssignmentService  
   - CheckpointRecordService

2. **Fase 2** - Pruebas de Integración:
   - Flujo completo de asignación de patrullas
   - Validación biométrica

3. **Fase 3** - Pruebas de Aceptación:
   - Casos de uso principales del negocio

4. **Fase 4** - Pruebas de Rendimiento y Esfuerzo:
   - Endpoints más utilizados
   - Operaciones críticas del sistema

### Código Existente Analizado

#### Funcionalidades Identificadas para Testing:

1. **UserService** (`src/services/user.service.ts`)
   - ✅ Ideal para pruebas unitarias
   - ✅ Lógica de negocio bien definida
   - ✅ Dependencias inyectables

2. **PatrolAssignmentService** (referenciado en documentación)
   - ✅ Funcionalidad compleja perfecta para integración
   - ✅ Genera automáticamente CheckpointRecords
   - ✅ Caso de uso crítico del negocio

3. **Validación Biométrica** (`src/controllers/shift_validation_biometric.controller.ts`)
   - ✅ Funcionalidad de seguridad crítica
   - ✅ Ideal para pruebas de regresión
   - ✅ Requiere pruebas de rendimiento

4. **API Endpoints** (múltiples rutas en `/src/routes/`)
   - ✅ Perfectos para pruebas de aceptación
   - ✅ Candidatos para pruebas de carga
   - ✅ Puntos de entrada para stress testing

### Conclusión

El proyecto **Api_Negocio_Rondines** tiene una estructura sólida que facilitaría la implementación de todos los tipos de pruebas mencionados. La ausencia actual de pruebas representa una oportunidad de mejora significativa para garantizar la calidad y confiabilidad del sistema de gestión de seguridad.