const fs = require('fs');
const path = require('path');

// Rutas de los archivos a limpiar
const filesToClean = [
  'src/utils/seeds/user.seed.js',
  'src/utils/seeds/role.seed.js',
  'src/utils/seeds/company.seed.js',
  'src/utils/seeds/branch.seed.js',
  'src/utils/seeds/client.seed.js',
  'src/utils/seeds/guard.seed.js',
  'src/utils/seeds/shift.seed.js',
  'src/utils/seeds/patrol.seed.js',
  'src/utils/seeds/patrol_assigment.seed.js',
  'src/utils/seeds/incident.seed.js',
  'src/utils/seeds/index.js',
  'src/app.js',
  'src/server.js'
];

console.log('🧹 Limpiando archivos .js duplicados...');

filesToClean.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log(`✅ Eliminado: ${filePath}`);
  } else {
    console.log(`⚠️  No encontrado: ${filePath}`);
  }
});

console.log('✅ Limpieza completada!');
console.log('💡 Ahora ejecuta: npm run seed'); 