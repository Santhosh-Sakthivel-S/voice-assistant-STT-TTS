import React, { useState } from 'react';

export default function SourceCard({ source, index }) {
  const [open, setOpen] = useState(false);
  const score = Math.round((source.score || 0) * 100);
  const scoreColor = score > 75 ? 'var(--accent-teal)' : score > 50 ? 'var(--accent-blue)' : 'var(--text-muted)';

  return (
    <div style={{
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-sm)',
      background: 'var(--bg-surface)',
      overflow: 'hidden',
      marginBottom: 8,
      transition: 'border-color 0.2s',
    }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '10px 14px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text-primary)',
          textAlign: 'left',
        }}
      >
        <span style={{
          fontSize: 10,
          fontFamily: 'DM Mono, monospace',
          background: 'var(--bg-card)',
          border: `1px solid ${scoreColor}`,
          color: scoreColor,
          borderRadius: 4,
          padding: '2px 6px',
          minWidth: 44,
          textAlign: 'center',
        }}>
          {score}%
        </span>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          Source {index + 1} — {Object.values(source.metadata || {}).slice(0, 2).join(' · ')}
        </span>
        <span style={{ fontSize: 10, color: 'var(--text-muted)', transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>▶</span>
      </button>

      {open && (
        <div style={{
          padding: '0 14px 14px',
          fontSize: 12,
          color: 'var(--text-secondary)',
          lineHeight: 1.7,
          borderTop: '1px solid var(--border-subtle)',
          whiteSpace: 'pre-wrap',
          fontFamily: 'DM Mono, monospace',
        }}>
          {source.content}
        </div>
      )}
    </div>
  );
}
