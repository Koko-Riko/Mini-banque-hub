
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Démarrage du processus de construction...');

// Vérifier si le dossier dist existe
if (!fs.existsSync(path.join(__dirname, '../dist'))) {
  console.log('Construction du projet React...');
  try {
    execSync('npm run build', { stdio: 'inherit' });
  } catch (error) {
    console.error('Erreur lors de la construction du projet React:', error);
    process.exit(1);
  }
}

// Construire l'application Electron
console.log('Construction de l\'installateur Electron...');
try {
  execSync('npx electron-builder build --win --config electron-builder.json', { stdio: 'inherit' });
  console.log('Construction terminée avec succès! L\'installateur se trouve dans le dossier "release".');
} catch (error) {
  console.error('Erreur lors de la construction de l\'installateur Electron:', error);
  process.exit(1);
}
