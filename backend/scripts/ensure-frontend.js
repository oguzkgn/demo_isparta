const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

if (process.env.NODE_ENV !== 'production') process.exit(0);

const distIndex = path.join(__dirname, '../frontend/dist/index.html');
if (fs.existsSync(distIndex)) {
  console.log('[Demo] Frontend build mevcut ✓');
  process.exit(0);
}

console.log('[Demo] Frontend build bulunamadı, oluşturuluyor...');
try {
  execSync('npm install --prefix ../frontend && npm run build --prefix ../frontend', {
    stdio: 'inherit',
    cwd: __dirname
  });
  console.log('[Demo] Frontend build tamamlandı ✓');
} catch (err) {
  console.error('[Demo] Frontend build hatası:', err.message);
  process.exit(1);
}
