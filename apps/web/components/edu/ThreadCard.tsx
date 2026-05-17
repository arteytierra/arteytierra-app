import Link from 'next/link';
import { MessageCircle } from 'lucide-react';

interface Props {
  slug: string;
  id: string;
  title: string;
  body: string | null;
  createdAt: string;
  authorName: string;
  replyCount: number;
}

export function ThreadCard({ slug, id, title, body, createdAt, authorName, replyCount }: Props) {
  return (
    <li>
      <Link
        href={`/mis-cursos/${slug}/comunidad/${id}`}
        className="block rounded-2xl border border-bone-100/15 bg-bone-100/5 p-5 hover:bg-bone-100/10 transition-colors"
      >
        <h3 className="font-display text-lg">{title}</h3>
        {body && <p className="mt-2 text-sm text-bone-100/65 line-clamp-2">{body}</p>}
        <div className="mt-3 flex items-center gap-4 text-xs text-bone-100/55">
          <span>{authorName}</span>
          <span>{new Date(createdAt).toLocaleDateString('es-AR')}</span>
          <span className="inline-flex items-center gap-1">
            <MessageCircle size={11} /> {replyCount}
          </span>
        </div>
      </Link>
    </li>
  );
}
