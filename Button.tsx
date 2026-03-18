import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'sky' | 'success' | 'ghost' | 'danger-ghost' | 'outline-dashed';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-all whitespace-nowrap active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed',
          {
            'bg-blue-700 text-white hover:bg-blue-800 hover:shadow-[0_4px_12px_rgba(30,64,175,0.3)]': variant === 'primary',
            'bg-sky-500 text-white hover:bg-sky-600 hover:shadow-[0_4px_12px_rgba(14,165,233,0.3)]': variant === 'sky',
            'bg-emerald-500 text-white hover:bg-emerald-600 hover:shadow-[0_4px_12px_rgba(16,185,129,0.3)]': variant === 'success',
            'bg-transparent text-slate-500 border-2 border-slate-200 hover:bg-slate-50 hover:text-slate-900': variant === 'ghost',
            'bg-transparent text-red-500 hover:bg-red-50 border-none': variant === 'danger-ghost',
            'border-2 border-dashed border-blue-400 bg-blue-50 text-blue-700 hover:bg-blue-100': variant === 'outline-dashed',

            'px-3 py-1.5 text-xs': size === 'sm',
            'px-4 py-2 text-sm': size === 'md',
            'px-6 py-3 text-base': size === 'lg',
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
