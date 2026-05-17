import { useId } from 'react';
import { cn } from '../utils/cn';

interface FieldProps {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: (id: string) => React.ReactNode;
}

export function Field({ label, hint, error, required, className, children }: FieldProps) {
  const id = useId();
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-ink-800">
          {label}
          {required && <span className="text-danger-500 ml-1">*</span>}
        </label>
      )}
      {children(id)}
      {error ? (
        <p className="text-xs text-danger-500">{error}</p>
      ) : hint ? (
        <p className="text-xs text-ink-800/60">{hint}</p>
      ) : null}
    </div>
  );
}

export function Checkbox({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="checkbox"
      className={cn(
        'h-4 w-4 rounded border-ink-950/25 text-moss-700 focus:ring-moss-700/30',
        className,
      )}
      {...props}
    />
  );
}
