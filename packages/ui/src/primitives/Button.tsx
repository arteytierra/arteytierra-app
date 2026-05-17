import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';
import { cn } from '../utils/cn';

const button = cva(
  'inline-flex items-center justify-center gap-2 rounded-full font-medium ' +
  'transition-all duration-300 ease-organic ' +
  'active:scale-[0.97] active:transition-transform active:duration-100 ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss-700/40 focus-visible:ring-offset-2 focus-visible:ring-offset-bone-50 ' +
  'disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:   'bg-ink-950 text-bone-50 hover:bg-moss-700',
        moss:      'bg-moss-700 text-bone-50 hover:bg-moss-900',
        clay:      'bg-clay-700 text-bone-50 hover:bg-clay-900',
        outline:   'border border-ink-950/15 bg-transparent text-ink-950 hover:bg-bone-100',
        ghost:     'bg-transparent text-ink-950 hover:bg-bone-100',
        link:      'bg-transparent text-moss-700 underline-offset-4 hover:underline px-0',
        danger:    'bg-danger-500 text-bone-50 hover:opacity-90',
      },
      size: {
        sm: 'px-4 py-2 text-xs',
        md: 'px-6 py-3 text-sm',
        lg: 'px-7 py-3.5 text-sm',
        xl: 'px-9 py-4 text-base',
        icon: 'h-10 w-10 p-0',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof button>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(button({ variant, size }), className)} {...props} />
  ),
);
Button.displayName = 'Button';
