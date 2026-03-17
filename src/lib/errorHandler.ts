/**
 * Error sanitization utility to prevent database schema exposure
 * Maps known error codes to safe, user-friendly messages
 */

const errorMappings: Record<string, string> = {
  // PostgreSQL error codes
  '23505': 'Cette entrée existe déjà',
  '23503': 'Référence invalide',
  '23502': 'Champs requis manquants',
  '23514': 'Valeur invalide',
  '42501': 'Permission refusée',
  '42P01': 'Ressource introuvable',
  '42703': 'Champ invalide',
  '22P02': 'Format de données invalide',
  '28P01': 'Identifiants incorrects',
  // Supabase/PostgREST error codes
  'PGRST116': 'Enregistrement non trouvé',
  'PGRST204': 'Aucune donnée trouvée',
  // Auth error patterns
  'invalid_credentials': 'Email ou mot de passe incorrect',
  'email_not_confirmed': 'Veuillez confirmer votre email',
  'user_banned': 'Compte désactivé',
  'invalid_grant': 'Session expirée',
};

// Keywords that indicate internal database details that should never be shown
const sensitivePatterns = [
  /constraint/i,
  /foreign key/i,
  /violates/i,
  /relation/i,
  /column/i,
  /table/i,
  /policy/i,
  /row-level security/i,
  /rls/i,
  /schema/i,
  /auth\.users/i,
  /public\./i,
];

/**
 * Sanitizes database errors before showing to users
 * - Maps known error codes to safe messages
 * - Filters out sensitive database structure information
 * - Logs full error for debugging (server-side only in production)
 */
export function sanitizeError(error: unknown): string {
  if (!error) {
    return 'Une erreur est survenue. Veuillez réessayer.';
  }

  // Log full error for debugging (visible in dev, should be server-side in prod)
  if (import.meta.env.DEV) {
    console.error('[DB_ERROR]', error);
  }

  // Handle error objects with code property
  const errorObj = error as { code?: string; error_code?: string; message?: string };
  const errorCode = errorObj?.code || errorObj?.error_code;
  
  // Check for mapped error codes
  if (errorCode && errorMappings[errorCode]) {
    return errorMappings[errorCode];
  }

  // Check for PGRST prefix errors
  if (errorCode?.startsWith('PGRST')) {
    return 'Erreur de base de données. Veuillez réessayer.';
  }

  // Get error message
  const message = errorObj?.message || String(error);

  // Check for sensitive patterns in the message
  const containsSensitiveInfo = sensitivePatterns.some(pattern => 
    pattern.test(message)
  );

  if (containsSensitiveInfo) {
    return 'Une erreur est survenue. Veuillez réessayer.';
  }

  // For auth-related safe messages, we can return them
  const safeAuthMessages = [
    'Email ou mot de passe incorrect',
    'Invalid login credentials',
    'User not found',
  ];

  if (safeAuthMessages.some(safeMsg => message.toLowerCase().includes(safeMsg.toLowerCase()))) {
    return 'Email ou mot de passe incorrect';
  }

  // Default safe message
  return 'Une erreur est survenue. Veuillez réessayer.';
}
