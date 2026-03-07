import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, hoverEffect = false, ...props }, ref) => {
    const Component = hoverEffect ? motion.div : 'div';
    const motionProps = hoverEffect
      ? {
          whileHover: { y: -5, boxShadow: '0 20px 40px -10px rgba(0,0,0,0.3)' },
          transition: { duration: 0.2 },
        }
      : {};

    return (
      // @ts-ignore
      <Component
        ref={ref}
        className={cn(
          'rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-lg shadow-xl',
          className
        )}
        {...motionProps}
        {...props}
      />
    );
  }
);
Card.displayName = 'Card';

export { Card };
