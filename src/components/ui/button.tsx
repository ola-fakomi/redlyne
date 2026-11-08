import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-1 whitespace-nowrap rounded font-panel font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40',
  {
    variants: {
      variant: {
        default: 'bg-panel-blue text-white hover:bg-blue-600',
        secondary: 'bg-panel-header-bg text-panel-text-primary border border-panel-border hover:bg-panel-row-hover',
        ghost: 'text-panel-text-secondary hover:bg-panel-row-hover hover:text-panel-text-primary',
        destructive: 'bg-red-500 text-white hover:bg-red-600',
        link: 'text-panel-blue underline-offset-2 hover:underline p-0 h-auto',
      },
      size: {
        default: 'h-[26px] px-2 text-panel-sm',
        sm: 'h-[22px] px-1.5 text-panel-xs',
        lg: 'h-[30px] px-3 text-panel-base',
        icon: 'h-[22px] w-[22px] text-panel-xs',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
