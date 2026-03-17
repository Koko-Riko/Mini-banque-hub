
import { createRoot } from 'react-dom/client'
import React from 'react'; // Import React explicite
import App from './App.tsx'
import './index.css'

// S'assurer que l'élément root existe
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

// Créer la racine React
createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
