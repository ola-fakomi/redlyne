import * as React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'blue';
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full px-1.5 font-panel font-medium',
        'min-w-[16px] h-[14px] text-[9px] leading-none',
        variant === 'blue'
          ? 'bg-panel-blue text-white'
          : 'bg-panel-border text-panel-text-secondary',
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
