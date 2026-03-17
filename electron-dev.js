
const { spawn } = require('child_process');
const waitOn = require('wait-on');
const path = require('path');

// Démarrer le serveur de développement React
const reactProcess = spawn('npm', ['run', 'dev'], { 
  stdio: 'inherit', 
  shell: true 
});

// Attendre que le serveur React soit prêt
waitOn({ resources: ['http-get://localhost:8080'], timeout: 30000 }).then(() => {
  console.log('Le serveur de développement React est prêt, démarrage d\'Electron...');
  
  // Démarrer Electron
  const electronProcess = spawn('npx', ['electron', path.join(__dirname, 'electron/main.js')], {
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, NODE_ENV: 'development' }
  });
  
  // Gérer la fermeture
  electronProcess.on('close', (code) => {
    console.log(`Electron s'est fermé avec le code ${code}`);
    reactProcess.kill();
    process.exit(code);
  });
  
}).catch((err) => {
  console.error('Erreur lors du démarrage:', err);
  reactProcess.kill();
  process.exit(1);
});
