import { cn } from '../utils/cn';

export function Eyebrow({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        'text-xs uppercase tracking-[0.18em] font-medium text-moss-700',
        className,
      )}
      {...props}
    >
      {children}
    </p>
  );
}
