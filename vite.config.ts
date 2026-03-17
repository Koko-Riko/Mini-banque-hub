
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  base: './', // Essentiel pour Electron
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Configuration spécifique pour Electron
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
    // Disable native node-gyp for Electron in web preview mode
    commonjsOptions: {
      transformMixedEsModules: true,
    }
  },
  optimizeDeps: {
    exclude: ['electron', '@electron/node-gyp'],
  }
}));
