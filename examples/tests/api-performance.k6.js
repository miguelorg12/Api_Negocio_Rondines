// EJEMPLO PRÁCTICO: Pruebas de Rendimiento con k6
// Este archivo muestra cómo implementar pruebas de rendimiento para los endpoints
// más críticos de la API Api_Negocio_Rondines usando k6

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Métricas personalizadas
const errorRate = new Rate('errors');
const checkpointRecordsTrend = new Trend('checkpoint_records_duration');
const biometricValidationTrend = new Trend('biometric_validation_duration');

// Configuración de la prueba de rendimiento
export let options = {
  stages: [
    // Warm-up
    { duration: '2m', target: 10 },
    
    // Carga normal
    { duration: '5m', target: 50 },
    
    // Incremento gradual
    { duration: '3m', target: 100 },
    
    // Carga alta sostenida
    { duration: '10m', target: 100 },
    
    // Pico de carga
    { duration: '2m', target: 200 },
    
    // Vuelta a carga normal
    { duration: '3m', target: 50 },
    
    // Cool-down
    { duration: '2m', target: 0 }
  ],
  
  thresholds: {
    // Requisitos de rendimiento
    http_req_duration: ['p(95)<1000'], // 95% de requests < 1s
    http_req_failed: ['rate<0.02'],    // Menos del 2% de errores
    errors: ['rate<0.02'],
    
    // Métricas específicas por endpoint
    checkpoint_records_duration: ['p(90)<500'],
    biometric_validation_duration: ['p(95)<800'],
  },
};

// Configuración base
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const API_VERSION = '/api/v1';

// Datos de prueba
const TEST_USERS = [
  { id: 1, token: 'test_token_1', biometric: 'fingerprint_hash_1' },
  { id: 2, token: 'test_token_2', biometric: 'fingerprint_hash_2' },
  { id: 3, token: 'test_token_3', biometric: 'fingerprint_hash_3' },
];

const TEST_PATROL_IDS = [1, 2, 3, 4, 5];
const TEST_SHIFT_IDS = [1, 2, 3];

function getRandomUser() {
  return TEST_USERS[Math.floor(Math.random() * TEST_USERS.length)];
}

function getRandomPatrolId() {
  return TEST_PATROL_IDS[Math.floor(Math.random() * TEST_PATROL_IDS.length)];
}

function getRandomShiftId() {
  return TEST_SHIFT_IDS[Math.floor(Math.random() * TEST_SHIFT_IDS.length)];
}

export default function () {
  const user = getRandomUser();
  
  // Headers comunes
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${user.token}`,
  };

  // Grupo de pruebas: Consulta de Checkpoint Records
  group('Checkpoint Records Performance', function () {
    
    // Test 1: Obtener todos los checkpoint records
    let response = http.get(`${BASE_URL}${API_VERSION}/checkpoint-records`, {
      headers: headers,
    });

    let success = check(response, {
      'checkpoint-records status 200': (r) => r.status === 200,
      'checkpoint-records response time < 500ms': (r) => r.timings.duration < 500,
      'checkpoint-records has data': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.data && Array.isArray(body.data);
        } catch (e) {
          return false;
        }
      },
    });

    if (!success) errorRate.add(1);
    checkpointRecordsTrend.add(response.timings.duration);

    // Test 2: Filtrar checkpoint records por estado
    response = http.get(`${BASE_URL}${API_VERSION}/checkpoint-records?status=pending`, {
      headers: headers,
    });

    check(response, {
      'filtered checkpoint-records status 200': (r) => r.status === 200,
      'filtered checkpoint-records response time < 300ms': (r) => r.timings.duration < 300,
    });

    // Test 3: Obtener checkpoint records por patrol_assignment_id
    const patrolAssignmentId = Math.floor(Math.random() * 100) + 1;
    response = http.get(`${BASE_URL}${API_VERSION}/checkpoint-records?patrol_assignment_id=${patrolAssignmentId}`, {
      headers: headers,
    });

    check(response, {
      'checkpoint-records by assignment status 200': (r) => r.status === 200,
    });
  });

  // Grupo de pruebas: Validación Biométrica
  group('Biometric Validation Performance', function () {
    
    const biometricData = {
      user_id: user.id,
      shift_id: getRandomShiftId(),
      biometric_data: user.biometric,
      validation_type: 'start'
    };

    let response = http.post(
      `${BASE_URL}${API_VERSION}/shift-validation-biometric`,
      JSON.stringify(biometricData),
      { headers: headers }
    );

    let success = check(response, {
      'biometric validation status ok': (r) => r.status === 201 || r.status === 400, // 400 puede ser válido si ya existe
      'biometric validation response time < 800ms': (r) => r.timings.duration < 800,
      'biometric validation has response': (r) => r.body.length > 0,
    });

    if (!success) errorRate.add(1);
    biometricValidationTrend.add(response.timings.duration);
  });

  // Grupo de pruebas: Gestión de Usuarios
  group('User Management Performance', function () {
    
    // Obtener todos los usuarios
    let response = http.get(`${BASE_URL}${API_VERSION}/users`, {
      headers: headers,
    });

    check(response, {
      'users list status 200': (r) => r.status === 200,
      'users list response time < 400ms': (r) => r.timings.duration < 400,
    });

    // Obtener usuario específico
    response = http.get(`${BASE_URL}${API_VERSION}/users/${user.id}`, {
      headers: headers,
    });

    check(response, {
      'user detail status 200': (r) => r.status === 200,
      'user detail response time < 200ms': (r) => r.timings.duration < 200,
    });
  });

  // Grupo de pruebas: Asignaciones de Patrulla
  group('Patrol Assignment Performance', function () {
    
    // Crear asignación de patrulla (operación más pesada)
    const assignmentData = {
      user_id: user.id,
      patrol_id: getRandomPatrolId(),
      shift_id: getRandomShiftId(),
      date: new Date().toISOString()
    };

    let response = http.post(
      `${BASE_URL}${API_VERSION}/patrol-assignments`,
      JSON.stringify(assignmentData),
      { headers: headers }
    );

    check(response, {
      'patrol assignment creation': (r) => r.status === 201 || r.status === 409, // 409 si ya existe
      'patrol assignment response time < 1000ms': (r) => r.timings.duration < 1000,
    });

    // Obtener asignaciones existentes
    response = http.get(`${BASE_URL}${API_VERSION}/patrol-assignments?user_id=${user.id}`, {
      headers: headers,
    });

    check(response, {
      'patrol assignments list status 200': (r) => r.status === 200,
      'patrol assignments list response time < 600ms': (r) => r.timings.duration < 600,
    });
  });

  // Grupo de pruebas: Operaciones de Red
  group('Network Operations Performance', function () {
    
    // Simular consulta de estado de red (endpoint que podría ser lento)
    let response = http.get(`${BASE_URL}${API_VERSION}/network/status`, {
      headers: headers,
    });

    check(response, {
      'network status response': (r) => r.status === 200 || r.status === 404,
      'network status response time < 2000ms': (r) => r.timings.duration < 2000,
    });
  });

  // Pausa aleatoria entre requests para simular comportamiento real
  sleep(Math.random() * 2 + 0.5); // Entre 0.5 y 2.5 segundos
}

// Función que se ejecuta al final de la prueba
export function handleSummary(data) {
  console.log('=== RESUMEN DE PRUEBAS DE RENDIMIENTO ===');
  console.log(`Requests totales: ${data.metrics.http_reqs.values.count}`);
  console.log(`Requests fallidos: ${data.metrics.http_req_failed.values.rate * 100}%`);
  console.log(`Duración promedio: ${data.metrics.http_req_duration.values.avg}ms`);
  console.log(`Duración p95: ${data.metrics.http_req_duration.values['p(95)']}ms`);
  console.log(`VUs máximo: ${data.metrics.vus_max.values.max}`);
  
  return {
    'performance-test-results.json': JSON.stringify(data, null, 2),
  };
}

// Configuraciones adicionales para diferentes tipos de pruebas
export const smokeTest = {
  vus: 1,
  duration: '1m',
};

export const loadTest = {
  stages: [
    { duration: '5m', target: 100 },
    { duration: '10m', target: 100 },
    { duration: '5m', target: 0 },
  ],
};

export const stressTest = {
  stages: [
    { duration: '2m', target: 100 },
    { duration: '5m', target: 200 },
    { duration: '2m', target: 300 },
    { duration: '5m', target: 300 },
    { duration: '2m', target: 400 },
    { duration: '5m', target: 400 },
    { duration: '10m', target: 0 },
  ],
};

export const spikeTest = {
  stages: [
    { duration: '1m', target: 10 },
    { duration: '30s', target: 500 },
    { duration: '1m', target: 10 },
    { duration: '30s', target: 500 },
    { duration: '1m', target: 10 },
  ],
};

/*
INSTRUCCIONES DE EJECUCIÓN:

1. Instalación de k6:
   curl https://github.com/grafana/k6/releases/download/v0.45.0/k6-v0.45.0-linux-amd64.tar.gz -L | tar xvz --strip-components 1

2. Ejecutar prueba completa:
   k6 run api-performance.k6.js

3. Ejecutar smoke test:
   k6 run --config smokeTest api-performance.k6.js

4. Ejecutar con configuración personalizada:
   k6 run --vus 50 --duration 5m api-performance.k6.js

5. Ejecutar con variables de entorno:
   BASE_URL=https://api.production.com k6 run api-performance.k6.js

6. Generar reporte HTML:
   k6 run --out json=results.json api-performance.k6.js
   k6 run --out html=report.html api-performance.k6.js

MÉTRICAS CLAVE A MONITOREAR:
- http_req_duration: Tiempo de respuesta de requests
- http_req_failed: Tasa de fallo de requests
- http_reqs: Número total de requests
- vus: Usuarios virtuales activos
- data_received/data_sent: Throughput de red

UMBRALES RECOMENDADOS PARA PRODUCCIÓN:
- P95 response time < 1000ms
- Error rate < 1%
- Throughput > 100 RPS
- Availability > 99.9%
*/