import type { Variants, Transition } from 'framer-motion';

export const easeOrganic: Transition['ease'] = [0.22, 1, 0.36, 1];

export const fadeUp: Variants = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: easeOrganic } },
};

export const stagger = (delay = 0.08): Variants => ({
  hidden:  {},
  visible: { transition: { staggerChildren: delay } },
});

export const slideRight: Variants = {
  hidden:  { opacity: 0, x: -24 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: easeOrganic } },
};

export const scaleIn: Variants = {
  hidden:  { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: easeOrganic } },
};

export const fadeIn: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5, ease: easeOrganic } },
};

export const scalePop: Variants = {
  hidden:  { opacity: 0, scale: 0.85 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 320, damping: 22 },
  },
};

export const drawerSlideRight: Variants = {
  hidden:  { x: '100%' },
  visible: { x: 0, transition: { duration: 0.35, ease: easeOrganic } },
  exit:    { x: '100%', transition: { duration: 0.25, ease: easeOrganic } },
};
