# Instrucciones de Build para Producción

## Scripts Disponibles

### Desarrollo
```bash
npm run dev          # Ejecuta el servidor en modo desarrollo con hot reload
```

### Build
```bash
npm run build        # Compila el proyecto TypeScript a JavaScript
npm run build:clean  # Limpia el directorio dist y recompila
npm run build:prod   # Build optimizado para producción (limpia y compila)
```

### Producción
```bash
npm start            # Ejecuta la aplicación compilada
npm run start:prod   # Ejecuta en modo producción con NODE_ENV=production
npm run deploy       # Build y ejecuta en producción (build:prod + start:prod)
```

## Configuración para Producción

### 1. Variables de Entorno
Asegúrate de tener un archivo `.env` con las variables necesarias:
```env
PORT=3000
NODE_ENV=production
# Otras variables de configuración de base de datos, etc.
```

### 2. Dependencias
```bash
npm install --production  # Instala solo las dependencias de producción
```

### 3. Build para Producción
```bash
npm run build:prod
```

### 4. Ejecutar en Producción
```bash
npm run start:prod
```

## Estructura de Archivos Compilados

Después del build, se crea el directorio `dist/` con la siguiente estructura:
```
dist/
├── server.js          # Punto de entrada de la aplicación
├── app.js            # Configuración de Express
├── configs/          # Configuraciones
├── controllers/      # Controladores
├── services/         # Servicios
├── routes/           # Rutas
├── interfaces/       # Interfaces y entidades
└── utils/            # Utilidades
```

## Troubleshooting

### Error: Cannot find module '@configs/data-source'
- Asegúrate de que `module-alias` esté instalado
- Verifica que los alias estén configurados en `package.json`
- El import `"module-alias/register"` debe estar al inicio de `server.ts`

### Error: Cannot find module '../src/routes/user.route'
- Las importaciones deben usar rutas relativas desde `src/`
- Ejemplo: `import userRoutes from "./routes/user.route"`

### El servidor no inicia
- Verifica que el archivo `.env` esté presente
- Asegúrate de que la base de datos esté configurada correctamente
- Revisa los logs de error en la consola

## Comandos Útiles

```bash
# Verificar que el build funciona
npm run build && npm start

# Limpiar y recompilar
npm run build:clean

# Build y ejecutar en producción
npm run deploy

# Solo instalar dependencias de producción
npm ci --only=production
``` 