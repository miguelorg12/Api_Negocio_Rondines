# 🔧 Solución de Problemas con Seeders

## Problema
En el servidor de Rocky Linux, el comando `npm run seed` no funciona correctamente porque hay archivos `.js` y `.ts` mezclados en la carpeta `src/utils/seeds/`, causando conflictos de resolución de módulos.

## Síntomas
- Error: "Usuario vielmasexo no encontrado"
- Los seeders no se ejecutan correctamente
- Archivos `.js` y `.ts` duplicados en la carpeta seeds

## Solución

### 1. Verificar el estado actual
```bash
npm run verify:seeders
```

### 2. Limpiar archivos duplicados
```bash
npm run clean:seeders
```

### 3. Ejecutar seeders limpios
```bash
npm run seed:clean
```

### 4. Si persisten problemas, ejecutar en orden:
```bash
# 1. Detener PM2
pm2 stop all
pm2 delete all

# 2. Limpiar y reconstruir
npm run build:clean

# 3. Verificar seeders
npm run verify:seeders

# 4. Limpiar duplicados
npm run clean:seeders

# 5. Ejecutar seeders
npm run seed

# 6. Reiniciar PM2
pm2 start dist/server.js --name apinegocio
pm2 save
```

## Comandos Disponibles

- `npm run verify:seeders` - Verifica que todos los archivos .ts existan
- `npm run clean:seeders` - Elimina archivos .js duplicados
- `npm run seed:clean` - Limpia y ejecuta seeders
- `npm run seed` - Ejecuta seeders normalmente

## Estructura Correcta
```
src/utils/seeds/
├── index.ts                    ✅
├── user.seed.ts               ✅
├── role.seed.ts               ✅
├── company.seed.ts            ✅
├── branch.seed.ts             ✅
├── client.seed.ts             ✅
├── guard.seed.ts              ✅
├── shift.seed.ts              ✅
├── patrol.seed.ts             ✅
├── patrol_assigment.seed.ts   ✅
├── incident.seed.ts           ✅
└── shift_validation_real_data.seed.ts ✅
```

## Notas Importantes
- Solo deben existir archivos `.ts` en `src/utils/seeds/`
- Los archivos `.js` en `src/` pueden causar conflictos
- El comando `npm run seed` usa `ts-node` para ejecutar archivos `.ts` directamente
- Si hay archivos `.js` duplicados, `ts-node` puede confundirse en la resolución de módulos 