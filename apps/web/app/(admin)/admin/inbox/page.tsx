import { MessageCircle, Mail, Instagram, Smartphone } from 'lucide-react';
import { requireStaff } from '@/lib/auth/session';
import { createSupabaseAdminClient } from '@/lib/db/admin';
import { PageHeader } from '@/components/admin/PageHeader';
import { EmptyState } from '@/components/admin/EmptyState';
import { ReplyForm } from '@/components/admin/inbox/ReplyForm';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Inbox · Admin' };

type Channel = 'whatsapp' | 'instagram' | 'email' | 'sms' | 'web';

interface MsgRow {
  id: string;
  channel: Channel;
  direction: 'inbound' | 'outbound';
  from_address: string | null;
  to_address: string | null;
  body: string | null;
  status: string | null;
  created_at: string;
  contact_id: string | null;
  contacts: { name: string | null; email: string | null; phone: string | null } | null;
}

const channelIcon: Record<Channel, typeof MessageCircle> = {
  whatsapp: MessageCircle,
  instagram: Instagram,
  email: Mail,
  sms: Smartphone,
  web: Mail,
};

export default async function InboxPage() {
  await requireStaff();
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from('messages')
    .select(
      'id, channel, direction, from_address, to_address, body, status, created_at, contact_id, contacts(name, email, phone)',
    )
    .order('created_at', { ascending: false })
    .limit(200);

  const msgs = (data ?? []) as unknown as MsgRow[];

  const groups = new Map<string, MsgRow[]>();
  for (const m of msgs) {
    const key =
      m.contact_id ?? (m.direction === 'inbound' ? m.from_address : m.to_address) ?? 'unknown';
    const existing = groups.get(key);
    if (existing) existing.push(m);
    else groups.set(key, [m]);
  }

  return (
    <>
      <PageHeader
        title="Inbox"
        description="Conversaciones unificadas · WhatsApp, Instagram, email."
      />
      {msgs.length === 0 ? (
        <EmptyState
          title="Sin mensajes"
          description="Aún no llegaron mensajes a tus canales conectados."
        />
      ) : (
        <ul className="grid gap-3">
          {[...groups.entries()].map(([key, list]) => {
            const head = list[0]!;
            const Icon = channelIcon[head.channel] ?? MessageCircle;
            const reversed = list.slice(0, 8).reverse();
            return (
              <li key={key} className="rounded-2xl border border-bone-200 bg-bone-50 p-5">
                <div className="flex items-center gap-3 border-b border-bone-200 pb-3 mb-3">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-moss-100 text-moss-700">
                    <Icon size={15} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {head.contacts?.name ??
                        head.contacts?.phone ??
                        head.contacts?.email ??
                        head.from_address ??
                        'Anónimo'}
                    </p>
                    <p className="text-xs text-ink-800/55">
                      {head.channel} · {list.length} mensajes
                    </p>
                  </div>
                  <span className="text-xs text-ink-800/55">
                    {new Date(head.created_at).toLocaleString('es-AR')}
                  </span>
                </div>
                <ol className="space-y-2 max-h-72 overflow-y-auto">
                  {reversed.map((m) => (
                    <li
                      key={m.id}
                      className={`text-sm rounded-xl px-3 py-2 max-w-[80%] ${
                        m.direction === 'inbound'
                          ? 'bg-bone-100 text-ink-950'
                          : 'bg-moss-700 text-bone-50 ml-auto'
                      }`}
                    >
                      {m.body}
                    </li>
                  ))}
                </ol>
                {head.channel === 'whatsapp' && head.contacts?.phone && (
                  <ReplyForm channel="whatsapp" to={head.contacts.phone} />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
