import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/cn';

const container = cva('mx-auto w-full px-6 md:px-10', {
  variants: {
    width: {
      prose:      'max-w-prose px-6',
      editorial:  'max-w-editorial',
      wide:       'max-w-wide',
      full:       'max-w-none',
    },
  },
  defaultVariants: { width: 'editorial' },
});

export type ContainerProps = React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof container>;

export function Container({ className, width, ...props }: ContainerProps) {
  return <div className={cn(container({ width }), className)} {...props} />;
}
