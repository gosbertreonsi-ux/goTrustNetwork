import React from 'react';
import { motion } from 'framer-motion';

interface OrbProps {
  state: 'listening' | 'searching' | 'composing';
  size: number;
}

export function ThinkingOrb({ state, size }: OrbProps) {
  // Map our node states directly to high-fidelity glowing gradients
  const colors = {
    listening: 'radial-gradient(circle, rgba(16, 185, 129, 0.4) 0%, transparent 70%)',
    searching: 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%)',
    composing: 'radial-gradient(circle, rgba(239, 68, 68, 0.4) 0%, transparent 70%)'
  };

  const borders = {
    listening: '2px solid #10b981',
    searching: '2px dashed #3b82f6',
    composing: '2px solid #ef4444'
  };

  return (
    <motion.div
      animate={state === 'searching' ? { rotate: 360, scale: [1, 1.05, 1] } : { rotate: 0, scale: 1 }}
      transition={state === 'searching' ? { repeat: Infinity, duration: 4, ease: "linear" } : { duration: 0.5 }}
      style={{
        position: 'relative',
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        background: colors[state],
        border: borders[state],
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: state === 'searching' ? '0 0 30px rgba(59, 130, 246, 0.3)' : 'none',
      }}
    />
  );
}
