'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import { easeOrganic } from './variants';

/**
 * Wrapper que aplica un lift sutil al hover (y suavizado al press).
 * Usalo para tarjetas/CTAs sin tener que escribir variants individuales.
 */
export function HoverLift({
  children,
  lift = 4,
  scale = 1.01,
  className,
  ...rest
}: HTMLMotionProps<'div'> & { lift?: number; scale?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      whileHover={{ y: -lift, scale, transition: { duration: 0.35, ease: easeOrganic } }}
      whileTap={{ y: -1, scale: 0.995, transition: { duration: 0.12 } }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
