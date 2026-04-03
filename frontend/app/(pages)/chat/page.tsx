'use client';

import { useState, useRef, useEffect } from 'react';

// ── Types ──
interface Message {
  role: 'user' | 'ai';
  content: string;
  streaming?: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// ── Suggested questions ──
const SUGGESTIONS = [
  { icon: '🏠', text: 'What are my rights if my landlord refuses to return the security deposit?' },
  { icon: '📋', text: 'Can my employer legally deduct salary without written notice?' },
  { icon: '⚡', text: 'What is the procedure to file an FIR if police refuse to register it?' },
  { icon: '💳', text: 'Explain Section 138 NI Act — cheque bounce case and remedies.' },
];

const HISTORY = [
  { label: 'Security deposit — tenant rights', time: '2m' },
  { label: 'NDA clause analysis', time: '1h' },
  { label: 'FIR filing under BNSS', time: '3h' },
  { label: 'Cheque bounce — Section 138', time: '1d' },
  { label: 'Consumer complaint RERA', time: '1d' },
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Dynamic greeting
  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto resize textarea
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
  };

  // Send message
  const sendMessage = async (question?: string) => {
    const q = question || input.trim();
    if (!q || streaming) return;

    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setStreaming(true);

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: q }]);

    // Add empty AI message that will stream
    setMessages(prev => [...prev, { role: 'ai', content: '', streaming: true }]);

    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          context_laws: ['BNS', 'BNSS', 'IPC', 'Constitution'],
          state: 'All India',
          history: [],
        }),
      });

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const lines = decoder.decode(value).split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.token) {
                fullText += data.token;
                setMessages(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    role: 'ai',
                    content: fullText,
                    streaming: true,
                  };
                  return updated;
                });
              }
              if (data.done) {
                setMessages(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    role: 'ai',
                    content: fullText,
                    streaming: false,
                  };
                  return updated;
                });
              }
            } catch {}
          }
        }
      }
    } catch (err) {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: 'ai',
          content: `Error: Could not reach ${API_URL}. Check console for details.`,
          streaming: false,
        };
        return updated;
      });
    }

    setStreaming(false);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const newChat = () => {
    setMessages([]);
    setInput('');
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#080a0f', color: '#e8eaf0', fontFamily: "'Outfit', sans-serif", overflow: 'hidden' }}>

      {/* ── SIDEBAR ── */}
      <div style={{
        width: sidebarOpen ? '260px' : '0',
        minWidth: sidebarOpen ? '260px' : '0',
        background: '#0d1018',
        borderRight: '1px solid #1e2535',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
        transition: 'width 0.28s, min-width 0.28s',
        flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ padding: '18px 16px 14px', borderBottom: '1px solid #1e2535', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 300, fontSize: '17px', letterSpacing: '0.26em', color: '#e8eaf0', display: 'flex', alignItems: 'center' }}>
              Z<span style={{ display: 'inline-block', width: '14px', height: '14px', border: '1.5px solid #7eb8f7', borderRadius: '50%', margin: '0 1px', boxShadow: '0 0 8px rgba(126,184,247,0.3)' }}></span>LVY N
            </div>
            <div style={{ width: '1px', height: '18px', background: '#2a3347' }}></div>
            <div style={{ fontSize: '9.5px', letterSpacing: '0.18em', color: '#4a5568', textTransform: 'uppercase', fontWeight: 300 }}>Legal Intelligence</div>
          </a>
          <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', color: '#7a8499', cursor: 'pointer', fontSize: '16px', padding: '4px' }}>◀</button>
        </div>

        {/* New Chat */}
        <button onClick={newChat} style={{ margin: '12px 10px 8px', display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderRadius: '9px', background: '#161b28', border: '1px solid #2a3347', color: '#e8eaf0', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit' }}>
          <div style={{ width: '20px', height: '20px', borderRadius: '5px', background: 'linear-gradient(135deg, #c9a84c, #e8c96d)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: '#0d0a04', fontWeight: 700 }}>+</div>
          New conversation
        </button>

        {/* History */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '4px 8px' }}>
          <div style={{ fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#4a5568', padding: '10px 10px 5px' }}>Recent</div>
          {HISTORY.map((item, i) => (
            <div key={i} style={{ padding: '7px 10px', borderRadius: '8px', cursor: 'pointer', color: '#9aa3b2', fontSize: '13px', fontWeight: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '2px' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#161b28')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              {item.label}
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div style={{ padding: '12px', borderTop: '1px solid #1e2535' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#4a5568', marginBottom: '6px' }}>
            <span>Daily queries</span><span style={{ fontFamily: 'monospace' }}>3 / 5 free</span>
          </div>
          <div style={{ height: '2px', background: '#1e2535', borderRadius: '2px', marginBottom: '10px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: '60%', background: 'linear-gradient(90deg, #c9a84c, #e8c96d)' }}></div>
          </div>
          <button onClick={() => window.location.href = '/upgrade'} style={{ width: '100%', padding: '10px', borderRadius: '9px', background: 'linear-gradient(135deg, #c9a84c, #e8c96d)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', fontSize: '13px', fontWeight: 600, color: '#0d0a04', fontFamily: 'inherit' }}>
            👑 Upgrade to Pro
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px', marginTop: '10px', padding: '4px 2px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #c9a84c, #e8c96d)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: '#0d0a04' }}>Z</div>
            <div>
              <div style={{ fontSize: '13px', color: '#e8eaf0', fontWeight: 500 }}>Zolvyn User</div>
              <div style={{ fontSize: '11px', color: '#4a5568' }}>Free plan</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', minWidth: 0 }}>

        {/* Topbar */}
        <div style={{ height: '56px', minHeight: '56px', borderBottom: '1px solid #1e2535', display: 'flex', alignItems: 'center', padding: '0 20px', gap: '12px', background: '#080a0f' }}>
          {!sidebarOpen && (
            <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', color: '#7a8499', cursor: 'pointer', fontSize: '18px', padding: '4px' }}>☰</button>
          )}
          {sidebarOpen && (
            <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', color: '#7a8499', cursor: 'pointer', fontSize: '18px', padding: '4px' }}>☰</button>
          )}
          <span style={{ fontSize: '15px', fontWeight: 500, color: '#e8eaf0' }}>Legal Q&A</span>
          <div style={{ display: 'flex', gap: '6px', flex: 1, overflowX: 'auto' }}>
            {['BNS', 'BNSS', 'Constitution', 'IPC', 'CrPC'].map(chip => (
              <div key={chip} style={{ fontSize: '11px', fontFamily: 'monospace', padding: '3px 9px', borderRadius: '20px', background: '#161b28', border: '1px solid #1e2535', color: '#7a8499', cursor: 'pointer', whiteSpace: 'nowrap' }}>{chip}</div>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0' }}>
          <div style={{ maxWidth: '760px', margin: '0 auto', padding: '0 20px' }}>

            {/* Empty state */}
            {messages.length === 0 && (
              <div style={{ paddingTop: '52px' }}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '38px', fontWeight: 300, color: '#e8eaf0', marginBottom: '8px', lineHeight: 1.15 }}>
                  {getGreeting()},<br />
                  <em style={{ fontStyle: 'italic', color: '#e8c96d' }}>how can Zolvyn help?</em>
                </div>
                <p style={{ fontSize: '15px', color: '#9aa3b2', fontWeight: 300, lineHeight: 1.65, marginBottom: '32px', maxWidth: '520px' }}>
                  Ask anything about Indian law. I'll search BNS, BNSS, the Constitution, and thousands of court judgments.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '32px' }}>
                  {SUGGESTIONS.map((s, i) => (
                    <div key={i} onClick={() => sendMessage(s.text)} style={{ background: '#0d1018', border: '1px solid #1e2535', borderRadius: '12px', padding: '15px 16px', cursor: 'pointer', transition: 'all 0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = '#2a3347'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e2535'; e.currentTarget.style.background = '#0d1018'; }}>
                      <div style={{ fontSize: '16px', marginBottom: '7px', opacity: 0.7 }}>{s.icon}</div>
                      <div style={{ fontSize: '13.5px', color: '#9aa3b2', lineHeight: 1.55, fontWeight: 300 }}>{s.text}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            {messages.map((msg, i) => (
              <div key={i} style={{ padding: msg.role === 'user' ? '22px 0 6px' : '20px 0' }}>
                {msg.role === 'user' ? (
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <div style={{ background: '#161b28', border: '1px solid #2a3347', borderRadius: '18px 18px 4px 18px', padding: '12px 16px', maxWidth: '75%', fontSize: '15px', lineHeight: 1.65, color: '#e8eaf0', fontWeight: 300 }}>
                      {msg.content}
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'linear-gradient(135deg, rgba(126,184,247,0.12), rgba(201,168,76,0.08))', border: '1px solid #2a3347', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0, marginTop: '3px' }}>⚖️</div>

                    <div style={{ flex: 1, minWidth: 0, borderLeft: '2px solid #4caf82', paddingLeft: '16px' }}>
                      <div style={{ fontSize: '15px', lineHeight: 1.75, color: '#e8eaf0', fontWeight: 300, whiteSpace: 'pre-wrap' }}>
                        {msg.content}
                        {msg.streaming && <span style={{ display: 'inline-block', width: '2px', height: '15px', background: '#e8c96d', marginLeft: '2px', verticalAlign: 'middle', animation: 'blink 0.85s ease infinite' }}>|</span>}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div style={{ borderTop: '1px solid #1e2535', padding: '12px 20px 16px', background: '#080a0f' }}>
          <div style={{ maxWidth: '760px', margin: '0 auto', background: '#0d1018', border: '1px solid #1e2535', borderRadius: '14px', padding: '12px 14px', transition: 'border-color 0.22s' }}>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInput}
              onKeyDown={handleKey}
              placeholder="Ask any legal question…"
              rows={1}
              style={{ width: '100%', background: 'none', border: 'none', outline: 'none', fontFamily: "'Outfit', sans-serif", fontSize: '15px', color: '#e8eaf0', resize: 'none', lineHeight: 1.6, maxHeight: '200px', overflowY: 'auto', fontWeight: 300, minHeight: '24px' }}
            />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button style={{ width: '28px', height: '28px', borderRadius: '7px', background: 'none', border: '1px solid #1e2535', color: '#4a5568', cursor: 'pointer', fontSize: '14px' }}>📎</button>
                <button style={{ width: '28px', height: '28px', borderRadius: '7px', background: 'none', border: '1px solid #1e2535', color: '#4a5568', cursor: 'pointer', fontSize: '14px' }}>🎤</button>
              </div>
              <button
                onClick={() => sendMessage()}
                disabled={streaming || !input.trim()}
                style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: streaming || !input.trim() ? '#1e2535' : 'linear-gradient(135deg, #4caf82, #6ee7a8)', color: streaming || !input.trim() ? '#4a5568' : '#061a10', cursor: streaming || !input.trim() ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', transition: 'all 0.2s' }}>
                ➤
              </button>
            </div>
          </div>
          <div style={{ textAlign: 'center', fontSize: '11px', color: '#4a5568', marginTop: '8px', maxWidth: '760px', margin: '8px auto 0' }}>
            Zolvyn AI · Based on Indian law · Verify with a qualified advocate before taking legal action
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Outfit:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { overflow: hidden; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #1e2535; border-radius: 4px; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        textarea::placeholder { color: #4a5568; }
      `}</style>
    </div>
  );
}