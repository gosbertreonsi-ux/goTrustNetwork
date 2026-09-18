import React from 'react';

export function BorderBeam({ duration = 3, color = '#3b82f6' }) {
  return (
    <div style={{
      position: 'absolute',
      top: 0, left: 0, right: 0, bottom: 0,
      borderRadius: '24px',
      padding: '2px',
      background: `conic-gradient(from 0deg, transparent 60%, ${color} 100%)`,
      WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
      WebkitMaskComposite: 'xor',
      maskComposite: 'exclude',
      pointerEvents: 'none',
      zIndex: 2,
      animation: `beamSpin ${duration}s linear infinite`
    }}>
      <style>{`
        @keyframes beamSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
