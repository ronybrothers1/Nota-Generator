import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'w-full px-3 py-2 border-2 rounded-md text-sm text-slate-900 bg-white transition-all outline-none',
          'placeholder:text-slate-400',
          error
            ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
            : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';
