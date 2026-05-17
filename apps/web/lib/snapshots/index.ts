import 'server-only';
import { createSupabaseAdminClient } from '@/lib/db/admin';
import { recordAudit } from '@/lib/audit';

/**
 * Snapshots de DB → NDJSON por tabla en Supabase Storage (bucket "backups").
 *
 * - `runSnapshot()` itera por la whitelist de tablas, exporta filas en pages
 *   de 5000 y sube cada tabla a `backups/{snapshot_id}/{table}.ndjson`.
 * - Idempotente por `snapshot_id`: si re-corre, sobreescribe.
 * - Pensado para correr semanal vía cron; o on-demand desde admin.
 */

// Tablas exportables. Excluye Auth (lo maneja Supabase), Storage objects, logs.
const TABLES: Array<{ schema: string; table: string }> = [
  { schema: 'app', table: 'profiles' },
  { schema: 'app', table: 'contacts' },
  { schema: 'app', table: 'audit_log' },
  { schema: 'shop', table: 'products' },
  { schema: 'shop', table: 'orders' },
  { schema: 'shop', table: 'order_items' },
  { schema: 'shop', table: 'coupons' },
  { schema: 'shop', table: 'coupon_redemptions' },
  { schema: 'edu', table: 'courses' },
  { schema: 'edu', table: 'enrollments' },
  { schema: 'edu', table: 'lessons' },
  { schema: 'edu', table: 'lesson_progress' },
  { schema: 'edu', table: 'certificates' },
  { schema: 'edu', table: 'threads' },
  { schema: 'edu', table: 'thread_replies' },
  { schema: 'book', table: 'reservations' },
  { schema: 'cms', table: 'posts' },
  { schema: 'fin', table: 'transactions' },
];

const BUCKET = 'backups';
const PAGE = 5000;

export async function runSnapshot(opts: { createdBy?: string | null; kind?: 'full' | 'manual' } = {}) {
  const admin = createSupabaseAdminClient();

  const { data: snap } = await admin
    .schema('app').from('db_snapshots')
    .insert({
      kind: opts.kind ?? 'full',
      status: 'running',
      created_by: opts.createdBy ?? null,
      tables: TABLES.map((t) => `${t.schema}.${t.table}`),
    })
    .select('id')
    .single();
  if (!snap) throw new Error('No pudimos crear el snapshot');

  const snapshotId = snap.id as string;
  const rowCounts: Record<string, number> = {};
  let totalBytes = 0;

  // Asegurar bucket (idempotente).
  await admin.storage.createBucket(BUCKET, { public: false }).catch(() => {});

  try {
    for (const t of TABLES) {
      let from = 0;
      const ndlines: string[] = [];
      // eslint-disable-next-line no-constant-condition
      while (true) {
        // Dynamic table name → casts para que TS no se queje de literales.
        const schema = admin.schema(t.schema as 'app');
        const q = (schema.from as (n: string) => ReturnType<typeof schema.from>)(t.table).select('*');
        const { data, error } = await q.range(from, from + PAGE - 1);
        if (error) throw new Error(`${t.schema}.${t.table}: ${error.message}`);
        if (!data || data.length === 0) break;
        for (const row of data) ndlines.push(JSON.stringify(row));
        from += data.length;
        if (data.length < PAGE) break;
      }
      const body = ndlines.join('\n');
      rowCounts[t.table] = ndlines.length;
      totalBytes += Buffer.byteLength(body, 'utf-8');

      const path = `${snapshotId}/${t.schema}.${t.table}.ndjson`;
      const { error: upErr } = await admin.storage
        .from(BUCKET)
        .upload(path, body, { contentType: 'application/x-ndjson', upsert: true });
      if (upErr) throw new Error(`upload ${path}: ${upErr.message}`);
    }

    await admin
      .schema('app').from('db_snapshots')
      .update({
        status: 'completed',
        finished_at: new Date().toISOString(),
        row_counts: rowCounts,
        total_bytes: totalBytes,
        storage_path: `${BUCKET}/${snapshotId}`,
      })
      .eq('id', snapshotId);

    void recordAudit({
      actorUserId: opts.createdBy ?? null,
      action: 'db.snapshot.completed',
      targetKind: 'db_snapshot',
      targetId: snapshotId,
      payload: { tables: Object.keys(rowCounts).length, total_bytes: totalBytes },
      severity: 'info',
    });

    return { id: snapshotId, ok: true, rowCounts, totalBytes };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await admin
      .schema('app').from('db_snapshots')
      .update({ status: 'failed', finished_at: new Date().toISOString(), error: msg })
      .eq('id', snapshotId);
    void recordAudit({
      actorUserId: opts.createdBy ?? null,
      action: 'db.snapshot.failed',
      targetKind: 'db_snapshot',
      targetId: snapshotId,
      payload: { error: msg },
      severity: 'critical',
    });
    return { id: snapshotId, ok: false, error: msg };
  }
}

/** Lista snapshots recientes con duración derivada. */
export async function listSnapshots(limit = 30) {
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .schema('app').from('db_snapshots_summary')
    .select('*')
    .order('started_at', { ascending: false })
    .limit(limit);
  return data ?? [];
}

/** Genera una URL firmada (1h) para descargar un archivo del snapshot. */
export async function getSnapshotFileUrl(snapshotId: string, file: string) {
  const admin = createSupabaseAdminClient();
  const path = `${snapshotId}/${file}`;
  const { data, error } = await admin.storage.from(BUCKET).createSignedUrl(path, 3600);
  if (error) return null;
  return data.signedUrl;
}

/** Lista archivos de un snapshot (para ofrecer descarga por tabla). */
export async function listSnapshotFiles(snapshotId: string) {
  const admin = createSupabaseAdminClient();
  const { data } = await admin.storage.from(BUCKET).list(snapshotId);
  return (data ?? []).map((f) => f.name);
}
