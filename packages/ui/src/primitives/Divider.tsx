import { cn } from '../utils/cn';

export function Divider({ className, label }: { className?: string; label?: string }) {
  if (label) {
    return (
      <div className={cn('flex items-center gap-4', className)}>
        <span className="h-px flex-1 bg-ink-950/15" />
        <span className="text-xs uppercase tracking-[0.18em] text-moss-700">{label}</span>
        <span className="h-px flex-1 bg-ink-950/15" />
      </div>
    );
  }
  return <hr className={cn('border-0 h-px bg-ink-950/10', className)} />;
}
