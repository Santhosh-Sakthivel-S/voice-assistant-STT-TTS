import React from 'react';

const PipelineStep = ({ icon, label, status }) => {
  const colors = { idle: 'var(--text-muted)', active: 'var(--accent-teal)', done: 'var(--accent-blue)', error: '#f87171' };
  const color = colors[status] || colors.idle;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '8px 0',
      borderBottom: '1px solid var(--border-subtle)',
    }}>
      <span style={{
        width: 32, height: 32, borderRadius: 8,
        background: status === 'active' ? `rgba(0,229,204,0.1)` : 'var(--glass)',
        border: `1px solid ${color}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 14, flexShrink: 0,
        animation: status === 'active' ? 'float 2s ease-in-out infinite' : 'none',
        transition: 'border-color 0.3s, background 0.3s',
      }}>{icon}</span>
      <div>
        <div style={{ fontSize: 12, color: 'var(--text-primary)' }}>{label}</div>
        <div style={{ fontSize: 10, color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{status}</div>
      </div>
      {status === 'active' && (
        <span style={{
          marginLeft: 'auto', width: 8, height: 8, borderRadius: '50%',
          background: 'var(--accent-teal)',
          boxShadow: '0 0 8px var(--accent-teal)',
          animation: 'float 1s ease-in-out infinite',
        }} />
      )}
    </div>
  );
};

export default function Sidebar({ pipeline, stats }) {
  return (
    <aside style={{
      width: 260,
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: 20,
      padding: '24px 0',
    }}>
      {/* Logo */}
      <div style={{ padding: '0 20px' }}>
        <div style={{
          fontFamily: 'Syne, sans-serif',
          fontWeight: 800,
          fontSize: 20,
          letterSpacing: '-0.02em',
          background: 'linear-gradient(90deg, var(--accent-teal), var(--accent-blue))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          MedRAG
        </div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2, letterSpacing: '0.06em' }}>
          STT · RAG · TTS PIPELINE
        </div>
      </div>

      {/* Pipeline status */}
      <div style={{
        margin: '0 16px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius)',
        padding: '12px 16px',
      }}>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 10, textTransform: 'uppercase' }}>
          Pipeline Status
        </div>
        <PipelineStep icon="🎙" label="Whisper STT"        status={pipeline.stt} />
        <PipelineStep icon="🔍" label="pgvector Retrieval" status={pipeline.retrieval} />
        <PipelineStep icon="⚖️" label="Doc Grading"        status={pipeline.grading} />
        <PipelineStep icon="⚡" label="Claude 3.5 Sonnet"  status={pipeline.llm} />
        <PipelineStep icon="🔊" label="Coqui TTS"          status={pipeline.tts} />
      </div>

      {/* Stats */}
      <div style={{
        margin: '0 16px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius)',
        padding: '12px 16px',
      }}>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 10, textTransform: 'uppercase' }}>
          Session Stats
        </div>
        {[
          { label: 'Queries', value: stats.queries },
          { label: 'Voice turns', value: stats.voice },
          { label: 'Sources used', value: stats.sources },
        ].map(({ label, value }) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{label}</span>
            <span style={{ fontSize: 12, color: 'var(--accent-teal)', fontFamily: 'DM Mono' }}>{value}</span>
          </div>
        ))}
      </div>

      {/* Model info */}
      <div style={{ margin: '0 16px', padding: '0 0 4px' }}>
        {[
          { badge: 'STT', name: 'Whisper', color: 'var(--accent-violet)' },
          { badge: 'VEC', name: 'pgvector / meddb', color: 'var(--accent-blue)' },
          { badge: 'LLM', name: 'Claude 3.5 Sonnet', color: 'var(--accent-teal)' },
          { badge: 'TTS', name: 'Coqui TTS', color: '#f59e0b' },
        ].map(({ badge, name, color }) => (
          <div key={badge} style={{
            display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8,
          }}>
            <span style={{
              fontSize: 9, fontFamily: 'DM Mono', color, border: `1px solid ${color}`,
              borderRadius: 4, padding: '2px 5px', minWidth: 34, textAlign: 'center',
            }}>{badge}</span>
            <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{name}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}
