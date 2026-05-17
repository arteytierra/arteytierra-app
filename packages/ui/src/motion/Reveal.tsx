'use client';

import { motion, type Variants } from 'framer-motion';
import { fadeUp, stagger } from './variants';

interface RevealProps {
  children: React.ReactNode;
  variants?: Variants;
  delay?: number;
  className?: string;
  once?: boolean;
  amount?: number;
}

export function Reveal({
  children,
  variants = fadeUp,
  delay = 0,
  className,
  once = true,
  amount = 0.2,
}: RevealProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={variants}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}

export function RevealGroup({
  children,
  delay = 0.08,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      variants={stagger(delay)}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={fadeUp}>
      {children}
    </motion.div>
  );
}
