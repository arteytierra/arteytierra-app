import { cn } from '../utils/cn';

interface TestimonialProps {
  body: string;
  author: string;
  role?: string;
  avatarUrl?: string;
  rating?: number;
  className?: string;
}

export function Testimonial({ body, author, role, avatarUrl, rating, className }: TestimonialProps) {
  return (
    <figure className={cn('rounded-2xl bg-bone-100 p-8 md:p-10', className)}>
      {rating && (
        <div className="flex gap-0.5 mb-4 text-sun-500">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className={i < rating ? 'opacity-100' : 'opacity-20'}>★</span>
          ))}
        </div>
      )}
      <blockquote className="font-display text-2xl md:text-3xl leading-snug text-ink-950">
        “{body}”
      </blockquote>
      <figcaption className="mt-8 flex items-center gap-4">
        {avatarUrl && (
          <img src={avatarUrl} alt="" className="h-11 w-11 rounded-full object-cover" />
        )}
        <div>
          <p className="font-medium text-ink-950">{author}</p>
          {role && <p className="text-sm text-ink-800/65">{role}</p>}
        </div>
      </figcaption>
    </figure>
  );
}

export function TestimonialPull({
  body,
  author,
  className,
}: {
  body: string;
  author: string;
  className?: string;
}) {
  return (
    <figure className={cn('max-w-3xl mx-auto text-center', className)}>
      <blockquote className="font-display text-3xl md:text-5xl leading-tight text-ink-950">
        “{body}”
      </blockquote>
      <figcaption className="mt-8 text-sm uppercase tracking-[0.18em] text-moss-700">{author}</figcaption>
    </figure>
  );
}
