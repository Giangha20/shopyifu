'use client';

import * as React from 'react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { cn } from '@/lib/utils';

export type ScrollRevealVariant =
  | 'fadeIn'
  | 'fadeInUp'
  | 'fadeInLeft'
  | 'fadeInRight'
  | 'scaleIn';

export interface ScrollRevealProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag'> {
  children: React.ReactNode;
  variant?: ScrollRevealVariant;
  delay?: number;
  duration?: number;
  distance?: number;
  once?: boolean;
  threshold?: number;
  as?: React.ElementType;
}


const variantsMap: Record<
  ScrollRevealVariant,
  (distance: number) => Variants
> = {
  fadeIn: () => ({
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  }),
  fadeInUp: (distance) => ({
    hidden: { opacity: 0, y: distance },
    visible: { opacity: 1, y: 0 },
  }),
  fadeInLeft: (distance) => ({
    hidden: { opacity: 0, x: -distance },
    visible: { opacity: 1, x: 0 },
  }),
  fadeInRight: (distance) => ({
    hidden: { opacity: 0, x: distance },
    visible: { opacity: 1, x: 0 },
  }),
  scaleIn: () => ({
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
  }),
};

export function ScrollReveal({
  children,
  variant = 'fadeInUp',
  delay = 0,
  duration = 0.5,
  distance = 24,
  once = true,
  threshold = 0.1,
  className,
  as: Component = 'div',
  ...props
}: ScrollRevealProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <div className={className} {...props}>
        {children}
      </div>
    );
  }

  const animationVariants = variantsMap[variant](distance);

  const MotionComponent = (motion as any)[typeof Component === 'string' ? Component : 'div'] || motion.div;

  return (
    <MotionComponent
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: threshold }}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      variants={animationVariants}
      className={cn(className)}
      {...(props as any)}
    >
      {children}
    </MotionComponent>
  );

}
