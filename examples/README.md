# Ejemplos Prácticos de Testing para Api_Negocio_Rondines

Este directorio contiene ejemplos prácticos de implementación de diferentes tipos de pruebas para el proyecto Api_Negocio_Rondines.

## 📁 Estructura de Archivos

```
examples/
├── tests/
│   ├── user.service.unit.test.ts                    # Ejemplo de pruebas unitarias
│   ├── patrol-assignment.integration.test.ts        # Ejemplo de pruebas de integración
│   ├── biometric-validation.acceptance.test.ts      # Ejemplo de pruebas de aceptación
│   └── api-performance.k6.js                        # Ejemplo de pruebas de rendimiento/esfuerzo
├── jest.config.js                                   # Configuración de Jest
├── package.json.example                             # Dependencias adicionales necesarias
└── README.md                                        # Este archivo
```

## 🚀 Cómo Implementar Testing en el Proyecto

### 1. Instalar Dependencias

```bash
# Dependencias principales de testing
npm install --save-dev jest @types/jest ts-jest supertest @types/supertest

# Dependencias adicionales para reportes
npm install --save-dev jest-html-reporters jest-junit

# Para linting y formatting
npm install --save-dev eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser prettier eslint-config-prettier eslint-plugin-prettier

# Para pruebas con bases de datos temporales
npm install --save-dev sqlite3 testcontainers
```

### 2. Configurar Jest

Copiar el archivo `jest.config.js` a la raíz del proyecto:

```bash
cp examples/jest.config.js ./jest.config.js
```

### 3. Actualizar package.json

Agregar los scripts de testing del archivo `package.json.example` a tu `package.json` actual.

### 4. Crear Estructura de Directorios

```bash
mkdir -p tests/{unit,integration,acceptance,setup}
mkdir -p tests/unit/{services,controllers}
```

### 5. Configurar Setup de Pruebas

Crear archivos de configuración:

```typescript
// tests/setup/jest.setup.ts
import 'reflect-metadata';

// Configuración global para todas las pruebas
beforeAll(async () => {
  // Configuración inicial
});

afterAll(async () => {
  // Limpieza final
});
```

## 📋 Ejemplos Incluidos

### 1. Pruebas Unitarias - `user.service.unit.test.ts`

**Qué prueba**: El servicio UserService de forma aislada usando mocks.

**Características**:
- Prueba cada método individualmente
- Usa mocks para dependencias (repositorios)
- Verifica comportamiento ante errores
- Rápida ejecución

**Ejecutar**:
```bash
npm run test:unit
```

### 2. Pruebas de Integración - `patrol-assignment.integration.test.ts`

**Qué prueba**: La interacción entre PatrolAssignmentService y CheckpointRecordService con base de datos real.

**Características**:
- Usa base de datos de prueba
- Prueba funcionalidades completas
- Verifica creación automática de checkpoint records
- Incluye limpieza de datos

**Ejecutar**:
```bash
npm run test:integration
```

### 3. Pruebas de Aceptación - `biometric-validation.acceptance.test.ts`

**Qué prueba**: Flujos completos de validación biométrica desde la perspectiva del usuario.

**Características**:
- Basada en historias de usuario
- Prueba end-to-end
- Incluye casos de error y emergencia
- Verifica comportamiento del negocio

**Ejecutar**:
```bash
npm run test:acceptance
```

### 4. Pruebas de Rendimiento - `api-performance.k6.js`

**Qué prueba**: Rendimiento y capacidad de carga de los endpoints críticos.

**Características**:
- Simula múltiples usuarios concurrentes
- Mide tiempos de respuesta
- Establece umbrales de rendimiento
- Incluye métricas personalizadas

**Ejecutar**:
```bash
# Instalar k6 primero
curl https://github.com/grafana/k6/releases/download/v0.45.0/k6-v0.45.0-linux-amd64.tar.gz -L | tar xvz --strip-components 1

# Ejecutar pruebas
npm run test:performance
npm run test:stress
npm run test:smoke
```

## 🔧 Configuración por Tipo de Prueba

### Variables de Entorno para Testing

```bash
# .env.test
NODE_ENV=test
DB_HOST=localhost
DB_PORT=5433
DB_USER=test_user
DB_PASSWORD=test_password
DB_NAME=test_api_negocio_db
JWT_SECRET=test_jwt_secret
```

### Base de Datos de Prueba

```typescript
// tests/setup/database.setup.ts
import { DataSource } from 'typeorm';

export const createTestDatabase = async (): Promise<DataSource> => {
  const testDb = new DataSource({
    type: 'postgres',
    host: process.env.TEST_DB_HOST || 'localhost',
    port: parseInt(process.env.TEST_DB_PORT || '5433'),
    username: process.env.TEST_DB_USER || 'test',
    password: process.env.TEST_DB_PASSWORD || 'test',
    database: process.env.TEST_DB_NAME || 'test_db',
    entities: ['src/interfaces/entity/*.entity.ts'],
    synchronize: true,
    dropSchema: true,
  });

  await testDb.initialize();
  return testDb;
};
```

## 📊 Ejecutar Todas las Pruebas

```bash
# Ejecutar todas las pruebas con cobertura
npm run test:coverage

# Ejecutar en modo CI/CD
npm run test:ci

# Ejecutar con watch mode durante desarrollo
npm run test:watch
```

## 📈 Reportes de Cobertura

Los reportes se generan en:
- `coverage/lcov-report/index.html` - Reporte HTML
- `coverage/coverage-final.json` - Datos de cobertura en JSON
- `coverage/junit.xml` - Reporte para CI/CD

## 🎯 Umbrales de Calidad Recomendados

### Cobertura de Código
- **Servicios críticos**: 80%+ cobertura
- **Controladores**: 70%+ cobertura
- **Global**: 70%+ cobertura

### Rendimiento
- **P95 response time**: < 1000ms
- **Error rate**: < 2%
- **Throughput**: > 100 RPS

### Reglas de Testing
1. **Cada servicio nuevo debe tener pruebas unitarias**
2. **Funcionalidades críticas requieren pruebas de integración**
3. **Cambios en APIs requieren pruebas de regresión**
4. **Nuevos endpoints deben incluirse en pruebas de rendimiento**

## 🚨 Consideraciones Importantes

### Para Implementación Real

1. **Configurar CI/CD**: Integrar pruebas en pipeline de despliegue
2. **Base de datos separada**: Usar BD de prueba independiente
3. **Datos de prueba**: Crear fixtures y seeders específicos para testing
4. **Mocks externos**: Mockear servicios de terceros (AWS S3, Firebase)
5. **Limpieza**: Asegurar limpieza de datos entre pruebas

### Herramientas Adicionales Recomendadas

- **Docker**: Para ambientes de prueba consistentes
- **TestContainers**: Para pruebas con bases de datos reales
- **Faker.js**: Para generar datos de prueba realistas
- **Nock**: Para mockear llamadas HTTP externas
- **Artillery**: Alternativa a k6 para pruebas de carga

## 📚 Recursos Adicionales

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [k6 Documentation](https://k6.io/docs/)
- [TypeORM Testing](https://typeorm.io/connection#using-connection-manager)
- [Express Testing with Supertest](https://github.com/visionmedia/supertest)

---

**Nota**: Estos ejemplos están diseñados específicamente para el proyecto Api_Negocio_Rondines y deben adaptarse según las necesidades específicas de tu implementación.