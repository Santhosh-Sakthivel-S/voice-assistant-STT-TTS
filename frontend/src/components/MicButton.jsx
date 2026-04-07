import React from 'react';

const MicIcon = ({ active }) => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
    <rect x="9" y="2" width="6" height="11" rx="3"
      fill={active ? 'var(--accent-teal)' : 'var(--text-secondary)'} />
    <path d="M5 10a7 7 0 0 0 14 0" stroke={active ? 'var(--accent-teal)' : 'var(--text-secondary)'}
      strokeWidth="1.8" strokeLinecap="round" fill="none" />
    <line x1="12" y1="17" x2="12" y2="21"
      stroke={active ? 'var(--accent-teal)' : 'var(--text-secondary)'}
      strokeWidth="1.8" strokeLinecap="round" />
    <line x1="8" y1="21" x2="16" y2="21"
      stroke={active ? 'var(--accent-teal)' : 'var(--text-secondary)'}
      strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

export default function MicButton({ isRecording, volume, onStart, onStop, disabled }) {
  const scale = 1 + volume * 0.25;

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Pulse rings when recording */}
      {isRecording && [1, 2, 3].map((i) => (
        <span key={i} style={{
          position: 'absolute',
          borderRadius: '50%',
          border: `1.5px solid var(--accent-teal)`,
          width: 64 + i * 20,
          height: 64 + i * 20,
          opacity: 0,
          animation: `pulse-ring 1.8s ${i * 0.3}s ease-out infinite`,
          pointerEvents: 'none',
        }} />
      ))}

      <button
        onClick={isRecording ? onStop : onStart}
        disabled={disabled}
        style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          border: `2px solid ${isRecording ? 'var(--accent-teal)' : 'var(--border-glow)'}`,
          background: isRecording
            ? 'radial-gradient(circle, rgba(0,229,204,0.2), rgba(0,229,204,0.05))'
            : 'var(--bg-card)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scale(${scale})`,
          transition: 'transform 0.1s ease, border-color 0.3s ease, background 0.3s ease',
          boxShadow: isRecording ? '0 0 24px rgba(0,229,204,0.35)' : 'none',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <MicIcon active={isRecording} />
      </button>
    </div>
  );
}
