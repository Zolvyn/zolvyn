'use client';

import { useState, useRef, useEffect } from 'react';
import { trackPageVisit, trackQuery, getStoredUser, createUser, storeUser } from '../../lib/supabase';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Message {
  role: 'user' | 'ai';
  content: string;
  streaming?: boolean;
}

const SUGGESTIONS = [
  { icon: '🏠', text: 'What are my rights if my landlord refuses to return the security deposit?' },
  { icon: '📋', text: 'Can my employer legally deduct salary without written notice?' },
  { icon: '⚡', text: 'What is the procedure to file an FIR if police refuse to register it?' },
  { icon: '💳', text: 'Explain Section 138 NI Act — cheque bounce case and remedies.' },
];

const HISTORY = {
  Today: ['Security deposit — tenant rights', 'NDA clause analysis', 'FIR filing under BNSS procedure'],
  Yesterday: ['Cheque bounce — Section 138 NI Act', 'Consumer complaint RERA violation', 'Cybercrime reporting procedure'],
  'This Week': ['Rental agreement stamp duty Maharashtra', 'Employment bond enforceability India', 'Divorce petition grounds Hindu Marriage Act'],
};

const CHIPS = ['BNS', 'BNSS', 'Constitution', 'IPC', 'CrPC', 'State Laws'];
const NAV = [
  { icon: '💬', label: 'Legal Q&A', href: '/chat', active: true },
  { icon: '📄', label: 'Contract Analyzer', href: '/contract' },
  { icon: '📝', label: 'Document Generator', href: '/generator' },
  { icon: '🔮', label: 'Case Predictor', href: '/predictor' },
  { icon: '⚖️', label: 'Bare Acts', href: '/bareacts' },
];

// ── Name Capture Popup ──
function NamePopup({ onComplete }: { onComplete: (name: string) => void }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const trimmed = name.trim() || 'User';
    setLoading(true);
    const user = await createUser(trimmed);
    if (!user) storeUser({ id: crypto.randomUUID(), name: trimmed });
    setLoading(false);
    onComplete(trimmed);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(8,10,15,0.88)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <style>{`
        @keyframes slideUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        .ni::placeholder{color:#4a5568} .ni:focus{border-color:rgba(201,168,76,0.4)!important}
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;1,300&family=Outfit:wght@300;400;500;600&display=swap');
      `}</style>
      <div style={{ background: '#0d1018', border: '1px solid #2a3347', borderRadius: '20px', padding: '48px 44px', width: '100%', maxWidth: '420px', boxShadow: '0 32px 80px rgba(0,0,0,0.6)', animation: 'slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1)', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '200px', height: '1px', background: 'linear-gradient(90deg,transparent,rgba(201,168,76,0.4),transparent)' }}></div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '28px' }}>
          <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 200, fontSize: '18px', letterSpacing: '0.26em', color: '#e8eaf0', display: 'flex', alignItems: 'center' }}>
            <span style={{ letterSpacing: '0.18em' }}>Z</span>
            <span style={{ display: 'inline-block', width: '13px', height: '13px', border: '1.5px solid #7eb8f7', borderRadius: '50%', margin: '0 3px', boxShadow: '0 0 8px rgba(126,184,247,0.3)' }}></span>
            <span style={{ letterSpacing: '0.18em' }}>LVYN</span>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '26px', fontWeight: 300, color: '#e8eaf0', marginBottom: '8px' }}>Welcome to <em style={{ color: '#e8c96d' }}>Zolvyn AI</em></div>
          <p style={{ fontSize: '13.5px', color: '#7a8499', fontWeight: 300, lineHeight: 1.65 }}>India's legal intelligence platform. What should we call you?</p>
        </div>
        <input className="ni" value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} placeholder="Enter your name…" autoFocus style={{ width: '100%', background: '#111520', border: '1.5px solid #1e2535', borderRadius: '11px', color: '#e8eaf0', fontFamily: "'Outfit',sans-serif", fontSize: '15px', fontWeight: 300, padding: '13px 16px', outline: 'none', marginBottom: '12px', transition: 'border-color 0.2s' }} />
        <button onClick={handleSubmit} disabled={loading} style={{ width: '100%', padding: '13px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg,#c9a84c,#e8c96d)', color: '#0d0a00', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Outfit',sans-serif", marginBottom: '12px' }}>
          {loading ? 'Setting up…' : 'Start for free →'}
        </button>
        <div style={{ textAlign: 'center' }}>
          <button onClick={() => { storeUser({ id: crypto.randomUUID(), name: 'User' }); onComplete('User'); }} style={{ background: 'none', border: 'none', color: '#4a5568', fontSize: '12.5px', cursor: 'pointer', fontFamily: "'Outfit',sans-serif" }}>Skip for now</button>
        </div>
        <div style={{ marginTop: '18px', paddingTop: '14px', borderTop: '1px solid #1e2535', fontSize: '11px', color: '#3a4258', textAlign: 'center' }}>No account needed · No password · No spam</div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeChips, setActiveChips] = useState(['BNS', 'Constitution']);
  const [activeHistory, setActiveHistory] = useState('Security deposit — tenant rights');
  const [userName, setUserName] = useState<string | null>(null);
  const [showNamePopup, setShowNamePopup] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const user = getStoredUser();
    if (user) {
      setUserName(user.name);
      trackPageVisit('chat');
    } else {
      setTimeout(() => setShowNamePopup(true), 600);
    }
  }, []);

  const handleNameComplete = (name: string) => {
    setUserName(name);
    setShowNamePopup(false);
    trackPageVisit('chat');
  };

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
  };

  const toggleChip = (chip: string) => setActiveChips(prev => prev.includes(chip) ? prev.filter(c => c !== chip) : [...prev, chip]);

  const sendMessage = async (question?: string) => {
    const q = question || input.trim();
    if (!q || streaming) return;
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setStreaming(true);
    setMessages(prev => [...prev, { role: 'user', content: q }, { role: 'ai', content: '', streaming: true }]);
    trackQuery('chat', q);

    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q, context_laws: activeChips.length ? activeChips : ['BNS', 'BNSS', 'IPC', 'Constitution'], state: 'All India', history: [] }),
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
              if (data.token) { fullText += data.token; setMessages(prev => { const u = [...prev]; u[u.length - 1] = { role: 'ai', content: fullText, streaming: true }; return u; }); }
              if (data.done) { setMessages(prev => { const u = [...prev]; u[u.length - 1] = { role: 'ai', content: fullText, streaming: false }; return u; }); }
            } catch {}
          }
        }
      }
    } catch {
      setMessages(prev => { const u = [...prev]; u[u.length - 1] = { role: 'ai', content: 'Connection error. Please try again.', streaming: false }; return u; });
    }
    setStreaming(false);
  };

  const handleKey = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#080a0f', color: '#e8eaf0', fontFamily: "'Outfit',sans-serif", overflow: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Outfit:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0} body{overflow:hidden}
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-thumb{background:#1e2535;border-radius:4px}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
        @keyframes swing{0%,100%{transform:rotate(0deg)}50%{transform:rotate(-12deg)}}
        textarea::placeholder{color:#4a5568}
        .sb-item:hover{background:#161b28 !important;color:#e8eaf0 !important}
        .ec:hover{border-color:#2a3347 !important;background:rgba(255,255,255,0.02) !important}
        .nav-a:hover{background:#161b28 !important;color:#e8eaf0 !important}
      `}</style>

      {showNamePopup && <NamePopup onComplete={handleNameComplete} />}

      {/* SIDEBAR */}
      <div style={{ width: sidebarOpen ? '260px' : '0', minWidth: sidebarOpen ? '260px' : '0', background: '#0d1018', borderRight: '1px solid #1e2535', display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', transition: 'width 0.28s cubic-bezier(0.4,0,0.2,1), min-width 0.28s', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 16px 14px', borderBottom: '1px solid #1e2535' }}>
          <a href="/landing" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 200, fontSize: '16px', color: '#e8eaf0', display: 'flex', alignItems: 'center' }}>
              <span style={{ letterSpacing: '0.18em' }}>Z</span>
              <span style={{ display: 'inline-block', width: '13px', height: '13px', border: '1.5px solid #7eb8f7', borderRadius: '50%', margin: '0 3px', boxShadow: '0 0 8px rgba(126,184,247,0.3)' }}></span>
              <span style={{ letterSpacing: '0.18em' }}>LVYN</span>
            </div>
            <div style={{ width: '1px', height: '18px', background: '#2a3347' }}></div>
            <div style={{ fontSize: '9.5px', letterSpacing: '0.18em', color: '#4a5568', textTransform: 'uppercase', fontWeight: 300 }}>Legal Intelligence</div>
          </a>
          <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', color: '#9aa3b2', cursor: 'pointer', fontSize: '17px' }}>◀</button>
        </div>

        <button onClick={() => setMessages([])} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', margin: '4px 8px 8px', borderRadius: '9px', background: 'none', border: 'none', color: '#9aa3b2', cursor: 'pointer', fontSize: '14px', fontFamily: "'Outfit',sans-serif", textAlign: 'left', width: 'calc(100% - 16px)' }}>
          <div style={{ width: '20px', height: '20px', borderRadius: '5px', background: 'linear-gradient(135deg,#c9a84c,#e8c96d)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: '#0d0a04', fontWeight: 700, flexShrink: 0 }}>+</div>
          New conversation
        </button>

        <div style={{ padding: '0 8px 8px', borderBottom: '1px solid #1e2535' }}>
          {NAV.map(item => (
            <a key={item.href} href={item.href} className="nav-a" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', borderRadius: '7px', color: item.active ? '#e8eaf0' : '#9aa3b2', background: item.active ? '#161b28' : 'transparent', fontSize: '13.5px', textDecoration: 'none', fontWeight: 300, marginBottom: '2px' }}>
              <span style={{ opacity: 0.8 }}>{item.icon}</span><span>{item.label}</span>
            </a>
          ))}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 8px 4px' }}>
          {Object.entries(HISTORY).map(([section, items]) => (
            <div key={section}>
              <div style={{ fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#4a5568', padding: '10px 10px 5px', fontWeight: 500 }}>{section}</div>
              {items.map(item => (
                <div key={item} onClick={() => setActiveHistory(item)} className="sb-item" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 10px', borderRadius: '8px', cursor: 'pointer', color: activeHistory === item ? '#e8eaf0' : '#9aa3b2', fontSize: '13.5px', fontWeight: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '2px', background: activeHistory === item ? 'rgba(201,168,76,0.07)' : 'transparent' }}>
                  <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: activeHistory === item ? '#e8c96d' : '#4a5568', flexShrink: 0, boxShadow: activeHistory === item ? '0 0 6px #e8c96d' : 'none' }}></div>
                  {item}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div style={{ borderTop: '1px solid #1e2535', padding: '10px 10px 14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#4a5568', marginBottom: '6px', padding: '0 2px' }}>
            <span>Daily queries</span>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '11px' }}>3 / 5 free</span>
          </div>
          <div style={{ height: '2px', background: '#1e2535', borderRadius: '2px', marginBottom: '10px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: '60%', background: 'linear-gradient(90deg,#c9a84c,#e8c96d)' }}></div>
          </div>
          <button onClick={() => window.location.href = '/upgrade'} style={{ width: '100%', padding: '10px 14px', borderRadius: '9px', background: 'linear-gradient(135deg,#c9a84c,#e8c96d)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', fontFamily: "'Outfit',sans-serif", fontSize: '13px', fontWeight: 600, color: '#0d0a04', letterSpacing: '0.02em' }}>
            👑 Upgrade to Pro
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px', marginTop: '10px', padding: '4px 2px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg,#c9a84c,#e8c96d)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: '#0d0a04' }}>{userName ? userName[0].toUpperCase() : 'Z'}</div>
            <div>
              <div style={{ fontSize: '13px', color: '#e8eaf0', fontWeight: 500 }}>{userName || 'Zolvyn User'}</div>
              <div style={{ fontSize: '11px', color: '#4a5568' }}>Free plan</div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 16px', height: '56px', minHeight: '56px', borderBottom: '1px solid #1e2535' }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ width: '32px', height: '32px', borderRadius: '7px', background: 'none', border: 'none', color: '#9aa3b2', cursor: 'pointer', fontSize: '16px', flexShrink: 0 }}>☰</button>
          <span style={{ fontSize: '15px', fontWeight: 500, color: '#e8eaf0' }}>Legal Q&A</span>
          <div style={{ display: 'flex', gap: '5px', flex: 1, overflowX: 'auto', padding: '0 6px' }}>
            {CHIPS.map(chip => (
              <div key={chip} onClick={() => toggleChip(chip)} style={{ fontSize: '11px', fontFamily: "'JetBrains Mono',monospace", padding: '3px 9px', borderRadius: '20px', whiteSpace: 'nowrap', background: activeChips.includes(chip) ? 'rgba(201,168,76,0.07)' : '#161b28', border: `1px solid ${activeChips.includes(chip) ? 'rgba(201,168,76,0.25)' : '#1e2535'}`, color: activeChips.includes(chip) ? '#e8c96d' : '#4a5568', cursor: 'pointer' }}>{chip}</div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '6px', marginLeft: 'auto', flexShrink: 0 }}>
            <button style={{ width: '30px', height: '30px', borderRadius: '7px', background: 'none', border: 'none', color: '#4a5568', cursor: 'pointer', fontSize: '14px' }}>🔗</button>
            <button style={{ width: '30px', height: '30px', borderRadius: '7px', background: 'none', border: 'none', color: '#4a5568', cursor: 'pointer', fontSize: '14px' }}>⬇</button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '0' }}>
          {messages.length === 0 ? (
            <div style={{ maxWidth: '760px', margin: '0 auto', padding: '52px 20px 0' }}>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '38px', fontWeight: 300, color: '#e8eaf0', marginBottom: '6px', lineHeight: 1.15 }}>
                {getGreeting()}{userName && userName !== 'User' ? `, ${userName}` : ''},<br />
                <em style={{ fontStyle: 'italic', color: '#e8c96d' }}>how can Zolvyn help?</em>
              </div>
              <p style={{ fontSize: '15px', color: '#9aa3b2', fontWeight: 300, lineHeight: 1.65, marginBottom: '36px', maxWidth: '560px' }}>Ask anything about Indian law. I'll search BNS, BNSS, the Constitution, and thousands of court judgments.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '32px' }}>
                {SUGGESTIONS.map((s, i) => (
                  <div key={i} onClick={() => sendMessage(s.text)} className="ec" style={{ background: '#0d1018', border: '1px solid #1e2535', borderRadius: '12px', padding: '15px 16px', cursor: 'pointer', transition: 'all 0.2s' }}>
                    <div style={{ fontSize: '16px', marginBottom: '7px', opacity: 0.7 }}>{s.icon}</div>
                    <div style={{ fontSize: '13.5px', color: '#9aa3b2', lineHeight: 1.55, fontWeight: 300 }}>{s.text}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ maxWidth: '760px', margin: '0 auto', padding: '0 20px' }}>
              {messages.map((msg, i) => (
                <div key={i}>
                  {msg.role === 'user' ? (
                    <div style={{ padding: '22px 0 6px', display: 'flex', justifyContent: 'flex-end' }}>
                      <div style={{ background: '#161b28', border: '1px solid #2a3347', borderRadius: '18px 18px 4px 18px', padding: '12px 16px', maxWidth: '75%', fontSize: '15px', lineHeight: 1.65, color: '#e8eaf0', fontWeight: 300 }}>{msg.content}</div>
                    </div>
                  ) : (
                    <div style={{ padding: '20px 0', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'linear-gradient(135deg,rgba(126,184,247,0.12),rgba(201,168,76,0.08))', border: '1px solid #2a3347', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0, marginTop: '3px' }}>⚖️</div>
                      <div style={{ flex: 1, minWidth: 0, borderLeft: '2px solid #4caf82', paddingLeft: '16px' }}>
                        {msg.streaming && msg.content === '' ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '6px 0' }}>
                            <span style={{ fontSize: '18px', display: 'inline-block', animation: 'swing 1.1s ease-in-out infinite' }}>⚖️</span>
                            <div>
                              <div style={{ fontSize: '14px', color: '#9aa3b2', fontWeight: 300 }}>Searching Indian law…</div>
                              <div style={{ marginTop: '4px' }}>{[0,1,2].map(j => <span key={j} style={{ display: 'inline-block', width: '3px', height: '3px', borderRadius: '50%', background: '#e8c96d', margin: '0 2px', animation: `bounce 1.1s ease ${j*0.15}s infinite` }}></span>)}</div>
                            </div>
                          </div>
                        ) : (
                          <div style={{ fontSize: '15px', lineHeight: 1.75, color: '#e8eaf0', fontWeight: 300, whiteSpace: 'pre-wrap' }}>
                            {msg.content}
                            {msg.streaming && <span style={{ display: 'inline-block', width: '2px', height: '15px', background: '#e8c96d', marginLeft: '2px', verticalAlign: 'middle', animation: 'blink 0.85s ease infinite' }}></span>}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div style={{ borderTop: '1px solid #1e2535', padding: '12px 20px 16px', background: '#080a0f' }}>
          <div style={{ maxWidth: '760px', margin: '0 auto', background: '#0d1018', border: '1px solid #1e2535', borderRadius: '14px', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <textarea ref={textareaRef} value={input} onChange={handleInput} onKeyDown={handleKey} placeholder="Ask any legal question…" rows={1} style={{ width: '100%', background: 'none', border: 'none', outline: 'none', fontFamily: "'Outfit',sans-serif", fontSize: '15px', color: '#e8eaf0', resize: 'none', lineHeight: 1.6, maxHeight: '200px', overflowY: 'auto', fontWeight: 300, minHeight: '24px' }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '5px' }}>
                <button style={{ width: '28px', height: '28px', borderRadius: '7px', background: 'none', border: 'none', color: '#4a5568', cursor: 'pointer', fontSize: '14px' }}>📎</button>
                <button style={{ width: '28px', height: '28px', borderRadius: '7px', background: 'none', border: 'none', color: '#4a5568', cursor: 'pointer', fontSize: '14px' }}>🎤</button>
              </div>
              <button onClick={() => sendMessage()} disabled={streaming || !input.trim()} style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: streaming || !input.trim() ? '#1e2535' : 'linear-gradient(135deg,#4caf82,#6ee7a8)', color: streaming || !input.trim() ? '#4a5568' : '#061a10', cursor: streaming || !input.trim() ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M14.5 8L1.5 1.5L5 8L1.5 14.5L14.5 8Z" fill="currentColor"/></svg>
              </button>
            </div>
          </div>
          <div style={{ textAlign: 'center', fontSize: '11px', color: '#4a5568', marginTop: '8px', maxWidth: '760px', margin: '8px auto 0' }}>Zolvyn AI · Based on Indian law · Verify with a qualified advocate before taking legal action</div>
        </div>
      </div>
    </div>
  );
}