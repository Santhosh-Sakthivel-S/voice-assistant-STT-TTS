import React from 'react';

export default function WaveVisualizer({ isRecording, volume }) {
  const bars = 24;
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 3,
      height: 48,
    }}>
      {Array.from({ length: bars }).map((_, i) => {
        const seed = Math.sin(i * 0.8) * 0.5 + 0.5;
        const height = isRecording
          ? Math.max(4, seed * volume * 44 + 4)
          : 4;
        return (
          <span key={i} style={{
            display: 'block',
            width: 3,
            height,
            borderRadius: 2,
            background: isRecording
              ? `rgba(0,229,204,${0.4 + seed * 0.6})`
              : 'var(--text-muted)',
            animation: isRecording ? `wave ${0.6 + seed * 0.6}s ${i * 0.04}s ease-in-out infinite alternate` : 'none',
            transition: 'height 0.08s ease',
          }} />
        );
      })}
    </div>
  );
}
