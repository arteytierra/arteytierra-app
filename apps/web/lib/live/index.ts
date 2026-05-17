import 'server-only';
import crypto from 'node:crypto';
import { createSupabaseAdminClient } from '@/lib/db/admin';
import { getCurrentUser, requireUser } from '@/lib/auth/session';

/**
 * Aulas virtuales (Jitsi por defecto). Si tu cuenta es JaaS (8x8), se firma
 * un JWT con la API key (JITSI_APP_ID + JITSI_PRIVATE_KEY como RS256). Si usás
 * Jitsi self-hosted con `jitsi-config` simple, basta con la URL pública.
 *
 * Para LiveKit, reemplazar `mintJitsiJwt` por `mintLiveKitToken` (HS256 con
 * api_key/secret). La estructura del payload es similar (room, identity, exp).
 */

export interface LiveSession {
  id: string;
  course_id: string | null;
  lesson_id: string | null;
  title: string;
  description: string | null;
  scheduled_at: string;
  duration_min: number;
  room: string;
  host_user_id: string | null;
  status: 'scheduled' | 'live' | 'ended' | 'cancelled';
  recording_enabled: boolean;
  recording_url: string | null;
}

const JITSI_DOMAIN = process.env.JITSI_DOMAIN ?? 'meet.jit.si';
const JITSI_APP_ID = process.env.JITSI_APP_ID; // tenant (JaaS) o app_id self-host
const JITSI_KEY_ID = process.env.JITSI_KEY_ID; // kid del key registrado en JaaS
const JITSI_PRIVATE_KEY = process.env.JITSI_PRIVATE_KEY; // PEM RS256

/**
 * Ventana de gracia para considerar una sesión activa: 15 min antes y hasta
 * `duration_min` después del scheduled_at.
 */
export function isSessionJoinable(s: Pick<LiveSession, 'scheduled_at' | 'duration_min' | 'status'>): boolean {
  if (s.status === 'cancelled' || s.status === 'ended') return false;
  const start = new Date(s.scheduled_at).getTime();
  const end = start + s.duration_min * 60_000;
  const earliest = start - 15 * 60_000;
  const now = Date.now();
  return now >= earliest && now <= end;
}

export async function getLiveSession(id: string): Promise<LiveSession | null> {
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from('live_sessions')
    .select('id, course_id, lesson_id, title, description, scheduled_at, duration_min, room, host_user_id, status, recording_enabled, recording_url')
    .eq('id', id)
    .maybeSingle();
  return (data as LiveSession | null) ?? null;
}

export async function listUpcomingLiveForUser(userId: string, limit = 20): Promise<LiveSession[]> {
  const admin = createSupabaseAdminClient();
  // Cursos en los que el user está enrolled
  const { data: enrollments } = await admin
    .from('enrollments')
    .select('course_id')
    .eq('user_id', userId);
  const courseIds = ((enrollments ?? []) as Array<{ course_id: string }>).map((e) => e.course_id);
  if (courseIds.length === 0) return [];

  const { data } = await admin
    .from('live_sessions')
    .select('id, course_id, lesson_id, title, description, scheduled_at, duration_min, room, host_user_id, status, recording_enabled, recording_url')
    .in('course_id', courseIds)
    .gte('scheduled_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .order('scheduled_at', { ascending: true })
    .limit(limit);
  return (data ?? []) as LiveSession[];
}

/**
 * Devuelve la URL para unirse a la sesión, con JWT si JaaS está configurado.
 * Chequea enrollment (si la sesión está atada a un curso) o staff.
 */
export async function getJoinPayload(sessionId: string): Promise<
  | { ok: true; url: string; isHost: boolean; session: LiveSession }
  | { ok: false; reason: 'login_required' | 'not_enrolled' | 'not_found' | 'not_joinable' }
> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, reason: 'login_required' };

  const session = await getLiveSession(sessionId);
  if (!session) return { ok: false, reason: 'not_found' };
  if (!isSessionJoinable(session)) return { ok: false, reason: 'not_joinable' };

  const isStaff = user.role === 'staff' || user.role === 'admin' || user.role === 'instructor';
  const isHost = user.id === session.host_user_id;

  // Authorization: staff/host bypass; alumno necesita enrollment activo.
  if (!isStaff && !isHost && session.course_id) {
    const admin = createSupabaseAdminClient();
    const { data: enroll } = await admin
      .from('enrollments')
      .select('id')
      .eq('user_id', user.id)
      .eq('course_id', session.course_id)
      .maybeSingle();
    if (!enroll) return { ok: false, reason: 'not_enrolled' };
  }

  // Registrar asistencia (idempotente por unique)
  const admin = createSupabaseAdminClient();
  await admin
    .from('live_attendance')
    .upsert({ session_id: session.id, user_id: user.id }, { onConflict: 'session_id,user_id' });

  const displayName = user.fullName ?? user.email.split('@')[0] ?? 'Participante';

  if (JITSI_APP_ID && JITSI_PRIVATE_KEY && JITSI_KEY_ID) {
    // JaaS — JWT firmado
    const jwt = mintJitsiJwt({
      room: session.room,
      userId: user.id,
      name: displayName,
      email: user.email,
      moderator: isHost || isStaff,
      ttlSec: session.duration_min * 60 + 30 * 60,
    });
    const url = `https://${JITSI_DOMAIN}/${JITSI_APP_ID}/${encodeURIComponent(session.room)}?jwt=${jwt}`;
    return { ok: true, url, isHost: isHost || isStaff, session };
  }

  // Self-host simple — pasamos el displayName por config-overwrite.
  const params = new URLSearchParams({ userInfo: JSON.stringify({ displayName, email: user.email }) });
  const url = `https://${JITSI_DOMAIN}/${encodeURIComponent(session.room)}#${params.toString()}`;
  return { ok: true, url, isHost: isHost || isStaff, session };
}

// ---------- JWT (RS256) ----------

function b64url(input: Buffer | string): string {
  return (typeof input === 'string' ? Buffer.from(input) : input)
    .toString('base64')
    .replace(/=+$/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function mintJitsiJwt(opts: {
  room: string;
  userId: string;
  name: string;
  email: string;
  moderator: boolean;
  ttlSec: number;
}): string {
  if (!JITSI_APP_ID || !JITSI_KEY_ID || !JITSI_PRIVATE_KEY) {
    throw new Error('JITSI JaaS no configurado');
  }
  const header = { alg: 'RS256', typ: 'JWT', kid: JITSI_KEY_ID };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    aud: 'jitsi',
    iss: 'chat',
    iat: now,
    nbf: now - 30,
    exp: now + opts.ttlSec,
    sub: JITSI_APP_ID,
    room: opts.room,
    context: {
      user: {
        id: opts.userId,
        name: opts.name,
        email: opts.email,
        moderator: opts.moderator ? 'true' : 'false',
      },
      features: { recording: opts.moderator ? 'true' : 'false', livestreaming: 'false' },
    },
  };
  const h = b64url(JSON.stringify(header));
  const p = b64url(JSON.stringify(payload));
  const data = `${h}.${p}`;
  const sig = crypto.sign('RSA-SHA256', Buffer.from(data), JITSI_PRIVATE_KEY).toString('base64')
    .replace(/=+$/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `${data}.${sig}`;
}

// ---------- iCal export ----------

function escIcs(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
}

function fmtIcsDate(iso: string): string {
  // YYYYMMDDTHHmmssZ
  return new Date(iso).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

export function buildIcalForSession(s: LiveSession, siteUrl: string): string {
  const start = fmtIcsDate(s.scheduled_at);
  const end = fmtIcsDate(new Date(new Date(s.scheduled_at).getTime() + s.duration_min * 60_000).toISOString());
  const url = `${siteUrl}/aula/${s.id}`;
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Arte y Tierra//Live Sessions//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${s.id}@arteytierra.org`,
    `DTSTAMP:${fmtIcsDate(new Date().toISOString())}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${escIcs(s.title)}`,
    `DESCRIPTION:${escIcs((s.description ?? '') + '\nUnirse: ' + url)}`,
    `URL:${url}`,
    'BEGIN:VALARM',
    'TRIGGER:-PT15M',
    'ACTION:DISPLAY',
    'DESCRIPTION:La clase empieza en 15 minutos',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

// ---------- Admin CRUD ----------

export async function listAllLiveSessions(filter: 'upcoming' | 'past' | 'all' = 'upcoming'): Promise<LiveSession[]> {
  await requireUser();
  const admin = createSupabaseAdminClient();
  let q = admin
    .from('live_sessions')
    .select('id, course_id, lesson_id, title, description, scheduled_at, duration_min, room, host_user_id, status, recording_enabled, recording_url')
    .order('scheduled_at', { ascending: filter === 'upcoming' });
  if (filter === 'upcoming') q = q.gte('scheduled_at', new Date(Date.now() - 60 * 60 * 1000).toISOString());
  else if (filter === 'past') q = q.lt('scheduled_at', new Date().toISOString());
  const { data } = await q.limit(200);
  return (data ?? []) as LiveSession[];
}

export async function upsertLiveSession(input: {
  id?: string | null;
  course_id?: string | null;
  lesson_id?: string | null;
  title: string;
  description?: string | null;
  scheduled_at: string;
  duration_min: number;
  host_user_id?: string | null;
  recording_enabled?: boolean;
}) {
  const user = await requireUser();
  const admin = createSupabaseAdminClient();
  const room = input.id
    ? (await admin.from('live_sessions').select('room').eq('id', input.id).single()).data?.room
    : `ay-${crypto.randomBytes(8).toString('hex')}`;
  if (!room) throw new Error('No se pudo obtener el room');

  const row = {
    course_id: input.course_id ?? null,
    lesson_id: input.lesson_id ?? null,
    title: input.title,
    description: input.description ?? null,
    scheduled_at: input.scheduled_at,
    duration_min: input.duration_min,
    host_user_id: input.host_user_id ?? user.id,
    recording_enabled: !!input.recording_enabled,
    room,
  };

  if (input.id) {
    const { error } = await admin.from('live_sessions').update(row).eq('id', input.id);
    if (error) throw new Error(error.message);
    return { id: input.id };
  }
  const { data, error } = await admin.from('live_sessions').insert(row).select('id').single();
  if (error) throw new Error(error.message);
  return { id: data.id as string };
}

export async function cancelLiveSession(id: string) {
  await requireUser();
  const admin = createSupabaseAdminClient();
  await admin.from('live_sessions').update({ status: 'cancelled' }).eq('id', id);
}
