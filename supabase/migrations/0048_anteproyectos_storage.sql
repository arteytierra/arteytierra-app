-- Archivos privados por usuario para cuadernos, croquis y referencias.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'anteproyectos',
  'anteproyectos',
  false,
  26214400,
  ARRAY[
    'image/jpeg', 'image/png', 'image/webp', 'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'video/mp4', 'video/webm'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;
DROP POLICY IF EXISTS "anteproyectos_archivos_select" ON storage.objects;
DROP POLICY IF EXISTS "anteproyectos_archivos_insert" ON storage.objects;
DROP POLICY IF EXISTS "anteproyectos_archivos_delete" ON storage.objects;
CREATE POLICY "anteproyectos_archivos_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'anteproyectos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "anteproyectos_archivos_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'anteproyectos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "anteproyectos_archivos_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'anteproyectos' AND (storage.foldername(name))[1] = auth.uid()::text);
