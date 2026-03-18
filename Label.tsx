import { LabelHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils/cn';

export const Label = forwardRef<HTMLLabelElement, LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn('text-xs font-semibold text-slate-500 uppercase tracking-wider', className)}
        {...props}
      />
    );
  }
);
Label.displayName = 'Label';
