import { forwardRef } from 'react';
import { cn } from '../utils/cn';

const base =
  'w-full rounded-lg border border-ink-950/15 bg-bone-50 px-4 py-3 text-sm ' +
  'text-ink-950 placeholder:text-ink-800/40 ' +
  'transition-colors duration-200 ease-organic ' +
  'focus:outline-none focus:border-moss-700 focus:ring-2 focus:ring-moss-700/15 ' +
  'disabled:opacity-50 disabled:cursor-not-allowed ' +
  'aria-[invalid=true]:border-danger-500 aria-[invalid=true]:ring-danger-500/15';

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={cn(base, className)} {...props} />
  ),
);
Input.displayName = 'Input';

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cn(base, 'min-h-[8rem] py-3 leading-relaxed', className)} {...props} />
));
Textarea.displayName = 'Textarea';

export const Select = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select ref={ref} className={cn(base, 'pr-10 appearance-none', className)} {...props}>
      {children}
    </select>
  ),
);
Select.displayName = 'Select';
