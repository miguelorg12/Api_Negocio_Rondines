// EJEMPLO PRÁCTICO: Configuración de Jest para el proyecto Api_Negocio_Rondines
// Este archivo muestra cómo configurar Jest para ejecutar las pruebas del proyecto

module.exports = {
  // Entorno de ejecución
  preset: 'ts-jest',
  testEnvironment: 'node',

  // Directorios de pruebas
  roots: ['<rootDir>/src', '<rootDir>/tests', '<rootDir>/examples/tests'],
  
  // Patrones de archivos de prueba
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/*.(test|spec).+(ts|tsx|js)'
  ],

  // Transformaciones
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },

  // Configuración de cobertura
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!src/**/*.d.ts',
    '!src/server.ts', // Excluir archivo de servidor
    '!src/migrations/**', // Excluir migraciones
    '!src/utils/seeds/**', // Excluir seeders
  ],

  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'clover'],

  // Umbrales de cobertura
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
    // Umbrales específicos para servicios críticos
    './src/services/user.service.ts': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },

  // Configuración de módulos
  moduleNameMapping: {
    '^@controllers/(.*)$': '<rootDir>/src/controllers/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@interfaces/(.*)$': '<rootDir>/src/interfaces/$1',
    '^@entities/(.*)$': '<rootDir>/src/interfaces/entity/$1',
    '^@dto/(.*)$': '<rootDir>/src/interfaces/dto/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@configs/(.*)$': '<rootDir>/src/configs/$1',
    '^@routes/(.*)$': '<rootDir>/src/routes/$1',
    '^@validators/(.*)$': '<rootDir>/src/utils/validators/$1',
  },

  // Configuración de setup
  setupFilesAfterEnv: ['<rootDir>/tests/setup/jest.setup.ts'],

  // Timeout para pruebas
  testTimeout: 30000, // 30 segundos para pruebas de integración

  // Configuración para pruebas de base de datos
  globalSetup: '<rootDir>/tests/setup/global-setup.ts',
  globalTeardown: '<rootDir>/tests/setup/global-teardown.ts',

  // Ignorar archivos
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/',
  ],

  // Configuración de mocks
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,

  // Para pruebas con TypeORM
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  // Configuración específica para diferentes tipos de pruebas
  projects: [
    {
      displayName: 'unit',
      testMatch: ['<rootDir>/tests/unit/**/*.test.ts'],
      testEnvironment: 'node',
    },
    {
      displayName: 'integration',
      testMatch: ['<rootDir>/tests/integration/**/*.test.ts'],
      testEnvironment: 'node',
      setupFilesAfterEnv: ['<rootDir>/tests/setup/integration.setup.ts'],
    },
    {
      displayName: 'acceptance',
      testMatch: ['<rootDir>/tests/acceptance/**/*.test.ts'],
      testEnvironment: 'node',
      setupFilesAfterEnv: ['<rootDir>/tests/setup/acceptance.setup.ts'],
    },
  ],

  // Reportes adicionales
  reporters: [
    'default',
    [
      'jest-html-reporters',
      {
        publicPath: './coverage/html-report',
        filename: 'report.html',
        expand: true,
      },
    ],
    [
      'jest-junit',
      {
        outputDirectory: './coverage',
        outputName: 'junit.xml',
      },
    ],
  ],

  // Variables de entorno para pruebas
  setupFiles: ['<rootDir>/tests/setup/env.setup.ts'],

  // Configuración de verbose para debugging
  verbose: true,

  // Para pruebas con bases de datos temporales
  maxWorkers: 1, // Ejecutar pruebas secuencialmente para evitar conflictos de BD

  // Configuración para CI/CD
  ci: true,
  forceExit: true,

  // Configuración de notificaciones (opcional)
  notify: false,
  notifyMode: 'failure-change',
};