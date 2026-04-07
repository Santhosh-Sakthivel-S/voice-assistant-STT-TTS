import React from 'react';
import AudioPlayer from './AudioPlayer';
import SourceCard from './SourceCard';

function BotAvatar() {
  return (
    <div style={{
      width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
      background: 'linear-gradient(135deg, rgba(0,229,204,0.3), rgba(59,130,246,0.3))',
      border: '1px solid rgba(0,229,204,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 14,
    }}>
      ✦
    </div>
  );
}

function UserAvatar() {
  return (
    <div style={{
      width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
      background: 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(59,130,246,0.3))',
      border: '1px solid rgba(139,92,246,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 14,
    }}>
      ◎
    </div>
  );
}

export default function ChatBubble({ message }) {
  const isUser = message.role === 'user';
  const [showSources, setShowSources] = React.useState(false);

  return (
    <div className="fade-up" style={{
      display: 'flex',
      flexDirection: isUser ? 'row-reverse' : 'row',
      gap: 12,
      alignItems: 'flex-start',
      padding: '6px 0',
    }}>
      {isUser ? <UserAvatar /> : <BotAvatar />}

      <div style={{ maxWidth: '74%', minWidth: 80 }}>
        {/* Label */}
        <div style={{
          fontSize: 10,
          color: 'var(--text-muted)',
          marginBottom: 4,
          textAlign: isUser ? 'right' : 'left',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}>
          {isUser ? 'You' : 'MedRAG · Claude 3.5'}
        </div>

        {/* Bubble */}
        <div style={{
          background: isUser
            ? 'linear-gradient(135deg, rgba(139,92,246,0.18), rgba(59,130,246,0.12))'
            : 'var(--bg-card)',
          border: `1px solid ${isUser ? 'rgba(139,92,246,0.25)' : 'var(--border-subtle)'}`,
          borderRadius: isUser ? '14px 4px 14px 14px' : '4px 14px 14px 14px',
          padding: '12px 16px',
          fontSize: 14,
          lineHeight: 1.65,
          color: 'var(--text-primary)',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}>
          {message.content}

          {/* Voice label */}
          {message.isVoice && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              marginLeft: 8, fontSize: 10, color: 'var(--accent-teal)',
              opacity: 0.7,
            }}>
              🎙 voice
            </span>
          )}
        </div>

        {/* TTS audio player */}
        {message.audioB64 && (
          <AudioPlayer audioB64={message.audioB64} autoPlay={true} />
        )}

        {/* Sources toggle */}
        {message.sources && message.sources.length > 0 && (
          <div style={{ marginTop: 10 }}>
            <button
              onClick={() => setShowSources(!showSources)}
              style={{
                fontSize: 11, color: 'var(--text-muted)', background: 'none',
                border: '1px solid var(--border-subtle)', borderRadius: 6,
                padding: '3px 10px', cursor: 'pointer',
                transition: 'color 0.2s, border-color 0.2s',
              }}
            >
              {showSources ? '↑ hide' : '↓ show'} {message.sources.length} source{message.sources.length > 1 ? 's' : ''}
            </button>

            {showSources && (
              <div style={{ marginTop: 8 }}>
                {message.sources.map((src, i) => (
                  <SourceCard key={i} source={src} index={i} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
