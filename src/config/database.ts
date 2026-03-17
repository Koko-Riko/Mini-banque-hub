
export const dbConfig = {
  host: import.meta.env.VITE_DB_HOST || 'localhost',
  user: import.meta.env.VITE_DB_USER || 'root',
  password: import.meta.env.VITE_DB_PASSWORD || '',
  database: import.meta.env.VITE_DB_NAME || 'mini_banque',
  port: parseInt(import.meta.env.VITE_DB_PORT || '3306'),
}

// NOTE: Dans un environnement réel, vous auriez besoin 
// de configurer ces variables d'environnement dans un fichier .env
