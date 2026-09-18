import React from 'react';
import { motion } from 'framer-motion';

export function VoiceBeam({ isListening, children }: { isListening: boolean; children: React.ReactNode }) {
  return (
    <motion.div
      animate={isListening ? {
        boxShadow: [
          "0 0 15px rgba(59, 130, 246, 0.2)",
          "0 0 40px rgba(59, 130, 246, 0.6)",
          "0 0 15px rgba(59, 130, 246, 0.2)"
        ]
      } : { boxShadow: "0 0 0px transparent" }}
      transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
      style={{
        borderRadius: '28px',
        padding: '2px',
        transition: 'all 0.3s ease'
      }}
    >
      {children}
    </motion.div>
  );
}
