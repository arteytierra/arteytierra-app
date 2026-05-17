/**
 * Database types — placeholder.
 *
 * Regenerar con:
 *   pnpm db:types
 * que ejecuta:
 *   supabase gen types typescript --local > packages/types/src/database.ts
 *
 * Mientras tanto definimos un tipo mínimo para que el resto compile.
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  // Placeholder — se reemplaza con el output de supabase gen types
  [key: string]: unknown;
}
