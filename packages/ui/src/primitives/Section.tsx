import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/cn';

const section = cva('w-full', {
  variants: {
    tone: {
      bone:  'bg-bone-50 text-ink-950',
      paper: 'bg-bone-100 text-ink-950',
      moss:  'bg-moss-900 text-bone-50',
      ink:   'bg-ink-950 text-bone-50',
      clay:  'bg-clay-200 text-ink-950',
    },
    spacing: {
      sm: 'py-16',
      md: 'py-section',
      lg: 'py-section-lg',
      none: 'py-0',
    },
  },
  defaultVariants: { tone: 'bone', spacing: 'md' },
});

export type SectionProps = React.HTMLAttributes<HTMLElement> & VariantProps<typeof section>;

export function Section({ className, tone, spacing, ...props }: SectionProps) {
  return <section className={cn(section({ tone, spacing }), className)} {...props} />;
}
