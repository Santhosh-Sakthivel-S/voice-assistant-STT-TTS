/* eslint-disable */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import ChatBubble from './components/ChatBubble';
import MicButton from './components/MicButton';
import WaveVisualizer from './components/WaveVisualizer';
import { useRecorder } from './hooks/useRecorder';
import { voiceQuery, queryRAG } from './utils/api';
import './styles/globals.css';

const IDLE_PIPELINE = { stt: 'idle', retrieval: 'idle', grading: 'idle', llm: 'idle', tts: 'idle' };

function ThinkingDots() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '14px 16px' }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          width: 7, height: 7, borderRadius: '50%',
          background: 'var(--accent-teal)',
          animation: `wave 0.9s ${i * 0.15}s ease-in-out infinite alternate`,
          display: 'block',
        }} />
      ))}
    </div>
  );
}

export default function App() {
  const [messages, setMessages] = useState([
    {
      id: 0,
      role: 'assistant',
      content: `Hello! I'm MedRAG — your voice-powered assistant. Speak or type your question and I'll search the records database to find the best answer.`,
    }
  ]);
  const [textInput, setTextInput] = useState('');
  const [pipeline, setPipeline] = useState(IDLE_PIPELINE);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ queries: 0, voice: 0, sources: 0 });
  const [mode, setMode] = useState('voice'); // 'voice' | 'text'

  const { isRecording, audioBlob, volume, startRecording, stopRecording } = useRecorder();
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Process audio when recording stops
  useEffect(() => {
    if (audioBlob && !isRecording) {
      handleVoiceQuery(audioBlob);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioBlob]);

  const addMessage = (msg) => {
    setMessages(prev => [...prev, { id: Date.now(), ...msg }]);
  };

  const buildChatHistory = () =>
    messages
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .map(m => ({ role: m.role, content: m.content }));

  const handleVoiceQuery = useCallback(async (blob) => {
    setLoading(true);
    setPipeline({ stt: 'active', retrieval: 'idle', grading: 'idle', llm: 'idle', tts: 'idle' });

    try {
      // Show interim user bubble
      const userMsgId = Date.now();
      setMessages(prev => [...prev, { id: userMsgId, role: 'user', content: '🎙 Transcribing…', isVoice: true, pending: true }]);

      const result = await voiceQuery(blob);

      // Replace pending bubble with real transcript
      setMessages(prev => prev.map(m =>
        m.id === userMsgId
          ? { ...m, content: result.transcript, pending: false }
          : m
      ));

      setPipeline(p => ({ ...p, stt: 'done', retrieval: 'done', grading: 'done', llm: 'done', tts: 'active' }));

      addMessage({
        role: 'assistant',
        content: result.answer,
        sources: result.sources,
        audioB64: result.audio_b64,
      });

      setPipeline({ stt: 'done', retrieval: 'done', grading: 'done', llm: 'done', tts: 'done' });
      setStats(s => ({
        queries: s.queries + 1,
        voice: s.voice + 1,
        sources: s.sources + (result.sources?.length || 0),
      }));
    } catch (err) {
      addMessage({ role: 'assistant', content: `⚠️ Error: ${err.response?.data?.detail || err.message}` });
      setPipeline(IDLE_PIPELINE);
    } finally {
      setLoading(false);
      setTimeout(() => setPipeline(IDLE_PIPELINE), 2500);
    }
  }, []);

  const handleTextSubmit = async () => {
    const q = textInput.trim();
    if (!q || loading) return;
    setTextInput('');
    setLoading(true);

    addMessage({ role: 'user', content: q });
    setPipeline({ stt: 'done', retrieval: 'active', grading: 'idle', llm: 'idle', tts: 'idle' });

    try {
      const history = buildChatHistory();
      const result = await queryRAG(q, history, true);

      setPipeline(p => ({ ...p, retrieval: 'done', grading: 'done', llm: 'done', tts: 'active' }));

      addMessage({
        role: 'assistant',
        content: result.answer,
        sources: result.sources,
        audioB64: result.audio_url,
      });

      setPipeline({ stt: 'done', retrieval: 'done', grading: 'done', llm: 'done', tts: 'done' });
      setStats(s => ({
        ...s,
        queries: s.queries + 1,
        sources: s.sources + (result.sources?.length || 0),
      }));
    } catch (err) {
      addMessage({ role: 'assistant', content: `⚠️ Error: ${err.response?.data?.detail || err.message}` });
      setPipeline(IDLE_PIPELINE);
    } finally {
      setLoading(false);
      setTimeout(() => setPipeline(IDLE_PIPELINE), 2500);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTextSubmit();
    }
  };

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      overflow: 'hidden',
    }}>
      {/* Left sidebar */}
      <Sidebar pipeline={pipeline} stats={stats} />

      {/* Vertical divider */}
      <div style={{
        width: 1,
        background: 'linear-gradient(to bottom, transparent, var(--border-subtle) 20%, var(--border-subtle) 80%, transparent)',
        flexShrink: 0,
      }} />

      {/* Main chat area */}
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Top bar */}
        <header style={{
          padding: '16px 28px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div>
            <h1 style={{
              fontFamily: 'Syne, sans-serif',
              fontSize: 16,
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '-0.01em',
            }}>
              Medical Intelligence Assistant
            </h1>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
              Powered by LangGraph · AWS Bedrock · pgvector
            </p>
          </div>

          {/* Mode toggle */}
          <div style={{
            display: 'flex',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 8,
            padding: 3,
            gap: 2,
          }}>
            {['voice', 'text'].map(m => (
              <button key={m} onClick={() => setMode(m)} style={{
                padding: '5px 14px',
                borderRadius: 6,
                border: 'none',
                cursor: 'pointer',
                fontSize: 11,
                fontFamily: 'DM Mono, monospace',
                background: mode === m ? 'var(--accent-teal)' : 'transparent',
                color: mode === m ? '#000' : 'var(--text-muted)',
                fontWeight: mode === m ? 600 : 400,
                transition: 'all 0.2s',
              }}>
                {m === 'voice' ? '🎙 Voice' : '⌨ Text'}
              </button>
            ))}
          </div>
        </header>

        {/* Messages */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}>
          {messages.map(msg => (
            <ChatBubble key={msg.id} message={msg} />
          ))}

          {loading && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{
                width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, rgba(0,229,204,0.3), rgba(59,130,246,0.3))',
                border: '1px solid rgba(0,229,204,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
              }}>✦</div>
              <div style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '4px 14px 14px 14px',
              }}>
                <ThinkingDots />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input area */}
        <div style={{
          borderTop: '1px solid var(--border-subtle)',
          padding: '20px 28px',
          flexShrink: 0,
          background: 'linear-gradient(to top, var(--bg-deep), transparent)',
        }}>
          {mode === 'voice' ? (
            /* Voice mode */
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
              <WaveVisualizer isRecording={isRecording} volume={volume} />

              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <MicButton
                  isRecording={isRecording}
                  volume={volume}
                  onStart={startRecording}
                  onStop={stopRecording}
                  disabled={loading}
                />
              </div>

              <p style={{
                fontSize: 11,
                color: isRecording ? 'var(--accent-teal)' : 'var(--text-muted)',
                letterSpacing: '0.04em',
                transition: 'color 0.3s',
              }}>
                {isRecording
                  ? '● Recording — click to stop'
                  : loading
                  ? 'Processing…'
                  : 'Click mic to speak'}
              </p>
            </div>
          ) : (
            /* Text mode */
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
              <textarea
                ref={inputRef}
                value={textInput}
                onChange={e => setTextInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
                placeholder="Ask about patient records, medications, diagnoses…"
                rows={2}
                style={{
                  flex: 1,
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 12,
                  padding: '12px 16px',
                  color: 'var(--text-primary)',
                  fontSize: 14,
                  fontFamily: 'DM Mono, monospace',
                  resize: 'none',
                  outline: 'none',
                  lineHeight: 1.6,
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--accent-teal)'}
                onBlur={e => e.target.style.borderColor = 'var(--border-subtle)'}
              />
              <button
                onClick={handleTextSubmit}
                disabled={loading || !textInput.trim()}
                style={{
                  padding: '12px 22px',
                  borderRadius: 12,
                  border: 'none',
                  cursor: loading || !textInput.trim() ? 'not-allowed' : 'pointer',
                  background: loading || !textInput.trim()
                    ? 'var(--bg-surface)'
                    : 'linear-gradient(135deg, var(--accent-teal), var(--accent-blue))',
                  color: loading || !textInput.trim() ? 'var(--text-muted)' : '#000',
                  fontSize: 13,
                  fontFamily: 'Syne, sans-serif',
                  fontWeight: 700,
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap',
                }}
              >
                {loading ? '…' : 'Send ↗'}
              </button>
            </div>
          )}

          {/* Hint */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 20,
            marginTop: 14,
            flexWrap: 'wrap',
          }}>
            {[
              'Patient medication history',
              'Diagnosis records',
              'Lab results',
              'Treatment plans',
            ].map(hint => (
              <button key={hint}
                onClick={() => { setMode('text'); setTextInput(hint); inputRef.current?.focus(); }}
                style={{
                  fontSize: 10,
                  color: 'var(--text-muted)',
                  background: 'var(--glass)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 20,
                  padding: '3px 10px',
                  cursor: 'pointer',
                  transition: 'color 0.2s, border-color 0.2s',
                  fontFamily: 'DM Mono',
                }}
                onMouseEnter={e => { e.target.style.color = 'var(--accent-teal)'; e.target.style.borderColor = 'var(--border-glow)'; }}
                onMouseLeave={e => { e.target.style.color = 'var(--text-muted)'; e.target.style.borderColor = 'var(--border-subtle)'; }}
              >
                {hint}
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
