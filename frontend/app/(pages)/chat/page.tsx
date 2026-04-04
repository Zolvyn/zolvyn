'use client';

import { useState, useRef, useEffect } from 'react';

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

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeChips, setActiveChips] = useState(['BNS', 'Constitution']);
  const [activeHistory, setActiveHistory] = useState('Security deposit — tenant rights');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const autoResize = (el: HTMLTextAreaElement) => {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 200) + 'px';
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    autoResize(e.target);
  };

  const toggleChip = (chip: string) => {
    setActiveChips(prev => prev.includes(chip) ? prev.filter(c => c !== chip) : [...prev, chip]);
  };

  const sendMessage = async (question?: string) => {
    const q = question || input.trim();
    if (!q || streaming) return;

    setInput('');
    if (textareaRef.current) { textareaRef.current.style.height = 'auto'; }
    setStreaming(true);
    setMessages(prev => [...prev, { role: 'user', content: q }, { role: 'ai', content: '', streaming: true }]);

    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
              if (data.token) {
                fullText += data.token;
                setMessages(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: 'ai', content: fullText, streaming: true };
                  return updated;
                });
              }
              if (data.done) {
                setMessages(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: 'ai', content: fullText, streaming: false };
                  return updated;
                });
              }
            } catch {}
          }
        }
      }
    } catch {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: 'ai', content: 'Connection error. Please try again.', streaming: false };
        return updated;
      });
    }
    setStreaming(false);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const newChat = () => { setMessages([]); setInput(''); };

  const s: Record<string, React.CSSProperties> = {
    shell: { display: 'flex', height: '100vh', background: '#080a0f', color: '#e8eaf0', fontFamily: "'Outfit', sans-serif", overflow: 'hidden', position: 'relative' },

    // Sidebar
    sidebar: { width: sidebarOpen ? '260px' : '0', minWidth: sidebarOpen ? '260px' : '0', display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: '#0d1018', borderRight: '1px solid #1e2535', transition: 'width 0.28s cubic-bezier(0.4,0,0.2,1), min-width 0.28s cubic-bezier(0.4,0,0.2,1)', flexShrink: 0, position: 'relative', zIndex: 10 },
    sbTop: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 12px 10px' },
    sbLogoMark: { display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' },
    sbLogoWord: { fontFamily: "'Outfit', sans-serif", fontWeight: 200, fontSize: '15px', letterSpacing: '0.22em', color: '#e8eaf0', display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' as const },
    sbLogoO: { width: '14px', height: '14px', border: '1.5px solid #7eb8f7', borderRadius: '50%', margin: '0 1px', flexShrink: 0, boxShadow: '0 0 7px rgba(126,184,247,0.3)', display: 'inline-block' },
    sbLogoDivider: { width: '1px', height: '18px', background: '#2a3347', flexShrink: 0 },
    sbLogoSub: { fontSize: '9.5px', letterSpacing: '0.18em', color: '#4a5568', textTransform: 'uppercase' as const, fontWeight: 300, whiteSpace: 'nowrap' as const },
    sbIconBtn: { width: '34px', height: '34px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', color: '#9aa3b2', cursor: 'pointer', fontSize: '17px', flexShrink: 0 },
    sbNewChat: { display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', margin: '4px 8px 8px', borderRadius: '9px', background: 'none', border: 'none', color: '#9aa3b2', cursor: 'pointer', fontSize: '14px', fontFamily: "'Outfit', sans-serif", fontWeight: 400, transition: 'all 0.18s', textAlign: 'left' as const, width: 'calc(100% - 16px)' },
    sbNewIcon: { width: '20px', height: '20px', borderRadius: '5px', background: 'linear-gradient(135deg, #c9a84c, #e8c96d)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: '#0d0a04', fontWeight: 700, flexShrink: 0 },
    sbSection: { fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#4a5568', padding: '10px 10px 5px', fontWeight: 500 },
    sbHistory: { flex: 1, overflowY: 'auto' as const, padding: '8px 8px 4px' },
    sbBottom: { borderTop: '1px solid #1e2535', padding: '10px 10px 14px' },
    sbUsageRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#4a5568', marginBottom: '6px', padding: '0 2px' },
    sbTrack: { height: '2px', background: '#1e2535', borderRadius: '2px', marginBottom: '10px', overflow: 'hidden' },
    sbFill: { height: '100%', width: '60%', background: 'linear-gradient(90deg, #c9a84c, #e8c96d)', borderRadius: '2px' },
    sbUpgrade: { width: '100%', padding: '10px 14px', borderRadius: '9px', background: 'linear-gradient(135deg, #c9a84c, #e8c96d)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', fontFamily: "'Outfit', sans-serif", fontSize: '13px', fontWeight: 600, color: '#0d0a04', letterSpacing: '0.02em' },
    sbUser: { display: 'flex', alignItems: 'center', gap: '9px', padding: '8px 2px 2px', cursor: 'pointer', marginTop: '10px' },
    sbAvatar: { width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #c9a84c, #e8c96d)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: '#0d0a04', flexShrink: 0 },

    // Main
    main: { flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', minWidth: 0 },
    topbar: { display: 'flex', alignItems: 'center', gap: '10px', padding: '0 16px', height: '56px', minHeight: '56px', borderBottom: '1px solid #1e2535', position: 'relative', zIndex: 5 },
    tbMenuBtn: { width: '32px', height: '32px', borderRadius: '7px', background: 'none', border: 'none', color: '#9aa3b2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 },
    tbTitle: { fontSize: '15px', fontWeight: 500, color: '#e8eaf0', letterSpacing: '0.01em' },
    tbChipsRow: { display: 'flex', gap: '5px', flex: 1, overflowX: 'auto' as const, padding: '0 6px' },
    tbRight: { display: 'flex', gap: '6px', marginLeft: 'auto', flexShrink: 0 },
    tbAction: { width: '30px', height: '30px', borderRadius: '7px', background: 'none', border: 'none', color: '#4a5568', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' },

    // Messages
    messages: { flex: 1, overflowY: 'auto' as const, padding: '0' },
    msgCol: { maxWidth: '760px', margin: '0 auto', padding: '0 20px' },

    // Empty
    emptyWrap: { maxWidth: '760px', margin: '0 auto', padding: '52px 20px 0' },
    emptyGreeting: { fontFamily: "'Cormorant Garamond', serif", fontSize: '38px', fontWeight: 300, color: '#e8eaf0', marginBottom: '6px', lineHeight: 1.15 },
    emptySub: { fontSize: '15px', color: '#9aa3b2', fontWeight: 300, lineHeight: 1.65, marginBottom: '36px', maxWidth: '560px' },
    emptyCards: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '32px' },
    emptyCard: { background: '#0d1018', border: '1px solid #1e2535', borderRadius: '12px', padding: '15px 16px', cursor: 'pointer', transition: 'all 0.2s' },

    // Input
    inputWrap: { borderTop: '1px solid #1e2535', padding: '12px 20px 16px', background: '#080a0f', position: 'relative', zIndex: 5 },
    inputInner: { maxWidth: '760px', margin: '0 auto', background: '#0d1018', border: '1px solid #1e2535', borderRadius: '14px', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '10px' },
    inputBottomRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    inputIcon: { width: '28px', height: '28px', borderRadius: '7px', background: 'none', border: 'none', color: '#4a5568', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' },
    sendBtn: { width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #4caf82, #6ee7a8)', color: '#061a10', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', boxShadow: '0 2px 12px rgba(76,175,130,0.18)' },
    inputHint: { textAlign: 'center' as const, fontSize: '11px', color: '#4a5568', marginTop: '8px', maxWidth: '760px', marginLeft: 'auto', marginRight: 'auto' },
  };

  return (
    <div style={s.shell}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Outfit:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        body{overflow:hidden}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:#1e2535;border-radius:4px}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
        @keyframes swing{0%,100%{transform:rotate(0deg)}50%{transform:rotate(-12deg)}}
        textarea::placeholder{color:#4a5568}
        .sb-item:hover{background:#161b28 !important;color:#e8eaf0 !important}
        .empty-card:hover{border-color:#2a3347 !important;background:rgba(255,255,255,0.02) !important}
        .sb-new-chat:hover{background:#161b28;color:#e8eaf0}
        .tb-chip-active{background:rgba(201,168,76,0.07) !important;border-color:rgba(201,168,76,0.25) !important;color:#e8c96d !important}
      `}</style>

      {/* SIDEBAR */}
      <div style={s.sidebar}>
        <div style={s.sbTop}>
          <a href="/landing" style={s.sbLogoMark}>
            <div style={s.sbLogoWord}>
              <span style={{ letterSpacing: '0.18em' }}>Z</span>
              <span style={s.sbLogoO}></span>
              <span style={{ letterSpacing: '0.18em', paddingRight: '0.18em' }}>LVYN</span>
            </div>
            <div style={s.sbLogoDivider}></div>
            <div style={s.sbLogoSub}>Legal Intelligence</div>
          </a>
          <button style={s.sbIconBtn} onClick={() => setSidebarOpen(false)}>◀</button>
        </div>

        <button style={s.sbNewChat} onClick={newChat}>
          <div style={s.sbNewIcon}>+</div>
          New conversation
        </button>

        <div style={{ padding: '0 8px 8px', borderBottom: '1px solid #1e2535' }}>
          {[{ icon: '🔍', label: 'Search conversations' }, { icon: '⭐', label: 'Starred' }].map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', borderRadius: '8px', color: '#9aa3b2', fontSize: '13.5px', cursor: 'pointer' }}
              className="sb-item">
              <span style={{ fontSize: '15px', opacity: 0.7 }}>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>

        <div style={s.sbHistory}>
          {Object.entries(HISTORY).map(([section, items]) => (
            <div key={section}>
              <div style={s.sbSection}>{section}</div>
              {items.map(item => (
                <div key={item}
                  onClick={() => setActiveHistory(item)}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 10px', borderRadius: '8px', cursor: 'pointer', color: activeHistory === item ? '#e8eaf0' : '#9aa3b2', fontSize: '13.5px', fontWeight: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '2px', background: activeHistory === item ? 'rgba(201,168,76,0.07)' : 'transparent' }}
                  className="sb-item">
                  <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: activeHistory === item ? '#e8c96d' : '#4a5568', flexShrink: 0, boxShadow: activeHistory === item ? '0 0 6px #e8c96d' : 'none' }}></div>
                  {item}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div style={s.sbBottom}>
          <div style={s.sbUsageRow}>
            <span>Daily queries</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px' }}>3 / 5 free</span>
          </div>
          <div style={s.sbTrack}><div style={s.sbFill}></div></div>
          <button style={s.sbUpgrade} onClick={() => window.location.href = '/upgrade'}>
            👑 &nbsp;Upgrade to Pro
          </button>
          <div style={s.sbUser}>
            <div style={s.sbAvatar}>Z</div>
            <div>
              <div style={{ fontSize: '13px', color: '#e8eaf0', fontWeight: 500 }}>Zolvyn User</div>
              <div style={{ fontSize: '11px', color: '#4a5568' }}>Free plan · 3 queries left</div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div style={s.main}>
        {/* Topbar */}
        <div style={s.topbar}>
          <button style={s.tbMenuBtn} onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={s.tbTitle}>Legal Q&A</span>
            <span style={{ color: '#4a5568', fontSize: '12px' }}>∨</span>
          </div>
          <div style={s.tbChipsRow}>
            {CHIPS.map(chip => (
              <div key={chip} onClick={() => toggleChip(chip)}
                style={{ fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", padding: '3px 9px', borderRadius: '20px', whiteSpace: 'nowrap', background: activeChips.includes(chip) ? 'rgba(201,168,76,0.07)' : '#161b28', border: `1px solid ${activeChips.includes(chip) ? 'rgba(201,168,76,0.25)' : '#1e2535'}`, color: activeChips.includes(chip) ? '#e8c96d' : '#4a5568', cursor: 'pointer' }}>
                {chip}
              </div>
            ))}
          </div>
          <div style={s.tbRight}>
            <button style={s.tbAction} title="Share">🔗</button>
            <button style={s.tbAction} title="Download">⬇</button>
          </div>
        </div>

        {/* Messages */}
        <div style={s.messages}>
          {messages.length === 0 ? (
            <div style={s.emptyWrap}>
              <div style={s.emptyGreeting}>
                {getGreeting()},<br />
                <em style={{ fontStyle: 'italic', color: '#e8c96d' }}>how can Zolvyn help?</em>
              </div>
              <p style={s.emptySub}>Ask anything about Indian law. I'll search BNS, BNSS, the Constitution, and thousands of court judgments to give you a precise, cited answer.</p>
              <div style={s.emptyCards}>
                {SUGGESTIONS.map((s2, i) => (
                  <div key={i} onClick={() => sendMessage(s2.text)} style={s.emptyCard} className="empty-card">
                    <div style={{ fontSize: '16px', marginBottom: '7px', opacity: 0.7 }}>{s2.icon}</div>
                    <div style={{ fontSize: '13.5px', color: '#9aa3b2', lineHeight: 1.55, fontWeight: 300 }}>{s2.text}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={s.msgCol}>
              {messages.map((msg, i) => (
                <div key={i}>
                  {msg.role === 'user' ? (
                    <div style={{ padding: '22px 0 6px', display: 'flex', justifyContent: 'flex-end' }}>
                      <div style={{ background: '#161b28', border: '1px solid #2a3347', borderRadius: '18px 18px 4px 18px', padding: '12px 16px', maxWidth: '75%', fontSize: '15px', lineHeight: 1.65, color: '#e8eaf0', fontWeight: 300 }}>
                        {msg.content}
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: '20px 0', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'linear-gradient(135deg, rgba(126,184,247,0.12), rgba(201,168,76,0.08))', border: '1px solid #2a3347', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0, marginTop: '3px' }}>⚖️</div>
                      <div style={{ flex: 1, minWidth: 0, borderLeft: '2px solid #4caf82', paddingLeft: '16px' }}>
                        {msg.streaming && msg.content === '' ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '6px 0' }}>
                            <span style={{ fontSize: '18px', display: 'inline-block', animation: 'swing 1.1s ease-in-out infinite' }}>⚖️</span>
                            <div>
                              <div style={{ fontSize: '14px', color: '#9aa3b2', fontWeight: 300 }}>Searching Indian law…</div>
                              <div style={{ marginTop: '4px' }}>
                                {[0, 1, 2].map(j => <span key={j} style={{ display: 'inline-block', width: '3px', height: '3px', borderRadius: '50%', background: '#e8c96d', margin: '0 2px', animation: `bounce 1.1s ease ${j * 0.15}s infinite` }}></span>)}
                              </div>
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

        {/* Input */}
        <div style={s.inputWrap}>
          <div style={s.inputInner}>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInput}
              onKeyDown={handleKey}
              placeholder="Ask any legal question…"
              rows={1}
              style={{ width: '100%', background: 'none', border: 'none', outline: 'none', fontFamily: "'Outfit', sans-serif", fontSize: '15px', color: '#e8eaf0', resize: 'none', lineHeight: 1.6, maxHeight: '200px', overflowY: 'auto', fontWeight: 300, minHeight: '24px' }}
            />
            <div style={s.inputBottomRow}>
              <div style={{ display: 'flex', gap: '5px' }}>
                <button style={s.inputIcon} title="Attach">📎</button>
                <button style={s.inputIcon} title="Voice">🎤</button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: '1px solid #1e2535', borderRadius: '7px', padding: '4px 9px', fontSize: '12px', color: '#4a5568', fontFamily: "'JetBrains Mono', monospace" }}>
                  <span>⚖</span>
                  <select style={{ background: 'none', border: 'none', outline: 'none', fontSize: '12px', color: 'inherit', cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace" }}>
                    <option>All Laws</option>
                    <option>BNS 2023</option>
                    <option>BNSS 2023</option>
                    <option>Constitution</option>
                    <option>IPC 1860</option>
                    <option>Consumer Law</option>
                  </select>
                </div>
              </div>
              <button onClick={() => sendMessage()} disabled={streaming || !input.trim()}
                style={{ ...s.sendBtn, background: streaming || !input.trim() ? '#1e2535' : 'linear-gradient(135deg, #4caf82, #6ee7a8)', color: streaming || !input.trim() ? '#4a5568' : '#061a10', cursor: streaming || !input.trim() ? 'not-allowed' : 'pointer', boxShadow: streaming || !input.trim() ? 'none' : '0 2px 12px rgba(76,175,130,0.18)' }}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M14.5 8L1.5 1.5L5 8L1.5 14.5L14.5 8Z" fill="currentColor" />
                </svg>
              </button>
            </div>
          </div>
          <div style={s.inputHint}>Zolvyn AI · Based on Indian law · Verify with a qualified advocate before taking legal action</div>
        </div>
      </div>
    </div>
  );
}