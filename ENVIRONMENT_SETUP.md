# Configuración de Entornos

## Descripción

Este proyecto soporta múltiples entornos de ejecución: **Development**, **QA** y **Production**. Cada entorno tiene su propia configuración de base de datos, puertos y características específicas.

## Archivos de Configuración

### Estructura de archivos

```
├── env.development    # Configuración para desarrollo local
├── env.qa            # Configuración para ambiente de QA
├── env.production    # Configuración para producción
└── .env              # Archivo de respaldo (opcional)
```

### Variables por Entorno

#### Development (`env.development`)

```env
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_DATABASE=ronditrack_dev
LOG_LEVEL=debug
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
ENABLE_SWAGGER=true
ENABLE_LOGGING=true
```

#### QA (`env.qa`)

```env
NODE_ENV=qa
PORT=3001
DB_HOST=qa-db-server
DB_PORT=5432
DB_USERNAME=qa_user
DB_PASSWORD=qa_password
DB_DATABASE=ronditrack_qa
LOG_LEVEL=info
CORS_ORIGIN=https://qa.yourapp.com,http://localhost:3001
ENABLE_SWAGGER=true
ENABLE_LOGGING=true
```

#### Production (`env.production`)

```env
NODE_ENV=production
PORT=3000
DB_HOST=prod-db-server
DB_PORT=5432
DB_USERNAME=prod_user
DB_PASSWORD=prod_secure_password
DB_DATABASE=ronditrack_prod
LOG_LEVEL=error
CORS_ORIGIN=https://yourapp.com,https://www.yourapp.com
ENABLE_SWAGGER=false
ENABLE_LOGGING=true
```

## Scripts Disponibles

### Desarrollo

```bash
# Desarrollo local
npm run dev              # Ejecuta en modo development
npm run dev:qa           # Ejecuta en modo QA para testing

# Build para diferentes entornos
npm run build:dev        # Build para development
npm run build:qa         # Build para QA
npm run build:prod       # Build para producción

# Ejecutar aplicación compilada
npm run start:dev        # Ejecuta build de development
npm run start:qa         # Ejecuta build de QA
npm run start:prod       # Ejecuta build de producción

# Deploy completo (build + start)
npm run deploy:dev       # Build y ejecuta en development
npm run deploy:qa        # Build y ejecuta en QA
npm run deploy:prod      # Build y ejecuta en producción
```

## Características por Entorno

### Development

- ✅ **Sincronización automática de base de datos** (`synchronize: true`)
- ✅ **Logging detallado** (`LOG_LEVEL=debug`)
- ✅ **Swagger habilitado** (`ENABLE_SWAGGER=true`)
- ✅ **CORS abierto** para desarrollo local
- ✅ **Hot reload** con nodemon

### QA

- ✅ **Logging moderado** (`LOG_LEVEL=info`)
- ✅ **Swagger habilitado** para testing de API
- ✅ **CORS configurado** para dominio de QA
- ❌ **Sincronización automática deshabilitada**
- ❌ **Logging de base de datos deshabilitado**

### Production

- ✅ **Logging mínimo** (`LOG_LEVEL=error`)
- ❌ **Swagger deshabilitado** por seguridad
- ✅ **CORS restringido** a dominios específicos
- ❌ **Sincronización automática deshabilitada**
- ❌ **Logging de base de datos deshabilitado**

## Configuración de Base de Datos

### Development

- Base de datos local
- Sincronización automática habilitada
- Logging detallado

### QA

- Base de datos de testing
- Migraciones manuales
- Logging moderado

### Production

- Base de datos de producción
- Migraciones manuales
- Logging mínimo

## Variables de Entorno Requeridas

```env
# Obligatorias
NODE_ENV=development|qa|production
DB_HOST=localhost
DB_USERNAME=postgres
DB_PASSWORD=password
DB_DATABASE=ronditrack_dev

# Opcionales
PORT=3000
DB_PORT=5432
LOG_LEVEL=info
CORS_ORIGIN=*
ENABLE_SWAGGER=true
ENABLE_LOGGING=true
```

## Ejemplos de Uso

### 1. Desarrollo Local

```bash
# Copiar configuración de desarrollo
cp env.development .env

# Ejecutar en modo desarrollo
npm run dev
```

### 2. Testing en QA

```bash
# Configurar para QA
export NODE_ENV=qa

# Ejecutar en modo QA
npm run dev:qa
```

### 3. Deploy a Producción

```bash
# Build y deploy para producción
npm run deploy:prod
```

### 4. Testing de Build

```bash
# Probar build de QA
npm run build:qa
npm run start:qa

# Probar build de producción
npm run build:prod
npm run start:prod
```

## Troubleshooting

### Error: "Missing required environment variables"

- Verifica que el archivo `env.{NODE_ENV}` existe
- Asegúrate de que todas las variables requeridas estén definidas

### Error: "Could not load env.{NODE_ENV}"

- El archivo de configuración no existe
- Crea el archivo correspondiente o usa `.env` como respaldo

### Base de datos no conecta

- Verifica las credenciales en el archivo de configuración
- Asegúrate de que la base de datos esté ejecutándose
- Confirma que el puerto y host sean correctos

### Swagger no aparece

- En producción, Swagger está deshabilitado por seguridad
- En desarrollo/QA, verifica que `ENABLE_SWAGGER=true`

## Seguridad

### Variables Sensibles

- **Nunca** subas archivos `env.*` al repositorio
- Usa variables de entorno del sistema en producción
- Considera usar un gestor de secretos (AWS Secrets Manager, etc.)

### Configuración de Producción

- Deshabilita Swagger en producción
- Restringe CORS a dominios específicos
- Usa credenciales seguras para la base de datos
- Configura logging apropiado para producción
