import React, { useEffect, useRef, useState } from 'react';

function b64ToBlob(b64, mime = 'audio/wav') {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

export default function AudioPlayer({ audioB64, autoPlay = true }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [url, setUrl] = useState(null);

  useEffect(() => {
    if (!audioB64) return;
    const blob = b64ToBlob(audioB64);
    const objectUrl = URL.createObjectURL(blob);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [audioB64]);

  useEffect(() => {
    if (url && autoPlay && audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
  }, [url, autoPlay]);

  const toggle = () => {
    const el = audioRef.current;
    if (!el) return;
    if (playing) el.pause(); else el.play();
  };

  if (!audioB64) return null;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '10px 14px',
      background: 'rgba(0,229,204,0.05)',
      border: '1px solid rgba(0,229,204,0.2)',
      borderRadius: 'var(--radius-sm)',
      marginTop: 12,
    }}>
      <audio
        ref={audioRef}
        src={url}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => { setPlaying(false); setProgress(0); }}
        onTimeUpdate={() => {
          const el = audioRef.current;
          if (el && el.duration) setProgress(el.currentTime / el.duration);
        }}
      />

      {/* Play/Pause */}
      <button onClick={toggle} style={{
        width: 36, height: 36, borderRadius: '50%',
        background: 'var(--accent-teal)', border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="#000">
          {playing
            ? <><rect x="3" y="2" width="4" height="12" rx="1"/><rect x="9" y="2" width="4" height="12" rx="1"/></>
            : <path d="M4 2l10 6-10 6z"/>}
        </svg>
      </button>

      {/* Progress bar */}
      <div style={{ flex: 1, height: 4, background: 'var(--bg-surface)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${progress * 100}%`,
          background: 'var(--accent-teal)', borderRadius: 2,
          transition: 'width 0.1s linear',
        }} />
      </div>

      <span style={{ fontSize: 10, color: 'var(--accent-teal)', fontFamily: 'DM Mono', whiteSpace: 'nowrap' }}>
        AI Voice
      </span>
    </div>
  );
}
