import * as React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex w-full rounded border border-panel-border bg-white px-1.5 text-panel-sm font-panel text-panel-text-primary shadow-none',
          'h-[22px] leading-none',
          'placeholder:text-panel-text-label',
          'focus:outline-none focus:ring-1 focus:ring-panel-blue focus:border-panel-blue',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';

export { Input };
