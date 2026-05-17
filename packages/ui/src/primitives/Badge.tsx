import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/cn';

const badge = cva(
  'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium tracking-wide',
  {
    variants: {
      tone: {
        moss:    'bg-moss-100 text-moss-900',
        clay:    'bg-clay-100 text-clay-900',
        sun:     'bg-sun-300/30 text-clay-900',
        water:   'bg-water-300/30 text-water-500',
        neutral: 'bg-bone-100 text-ink-800',
        ink:     'bg-ink-950 text-bone-50',
        outline: 'border border-ink-950/15 text-ink-800',
      },
    },
    defaultVariants: { tone: 'neutral' },
  },
);

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badge>;

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badge({ tone }), className)} {...props} />;
}
