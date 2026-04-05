'use client';

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { trackPageVisit, trackQuery, getStoredUser, createUser, storeUser } from '../../lib/supabase';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Message {
  role: 'user' | 'ai';
  content: string;
  streaming?: boolean;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  timestamp: Date;
}

const SUGGESTIONS = [
  { icon: '🏠', text: 'What are my rights if my landlord refuses to return the security deposit?' },
  { icon: '📋', text: 'Can my employer legally deduct salary without written notice?' },
  { icon: '⚡', text: 'What is the procedure to file an FIR if police refuse to register it?' },
  { icon: '💳', text: 'Explain Section 138 NI Act — cheque bounce case and remedies.' },
];

const CHIPS = ['BNS', 'BNSS', 'Constitution', 'IPC', 'CrPC', 'State Laws'];

const NAV = [
  { icon: '💬', label: 'Legal Q&A', href: '/chat', active: true },
  { icon: '📄', label: 'Contract Analyzer', href: '/contract' },
  { icon: '📝', label: 'Document Generator', href: '/generator' },
  { icon: '🔮', label: 'Case Predictor', href: '/predictor' },
  { icon: '⚖️', label: 'Bare Acts', href: '/bareacts' },
];

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
      <div style={{ background: '#0d1018', border: '1px solid #2a3347', borderRadius: '20px', padding: '48px 44px', width: '100%', maxWidth: '420px', boxShadow: '0 32px 80px rgba(0,0,0,0.6)', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '200px', height: '1px', background: 'linear-gradient(90deg,transparent,rgba(201,168,76,0.4),transparent)' }}></div>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 200, fontSize: '18px', letterSpacing: '0.26em', color: '#e8eaf0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            <span style={{ letterSpacing: '0.18em' }}>Z</span>
            <span style={{ display: 'inline-block', width: '13px', height: '13px', border: '1.5px solid #7eb8f7', borderRadius: '50%', margin: '0 3px', boxShadow: '0 0 8px rgba(126,184,247,0.3)' }}></span>
            <span style={{ letterSpacing: '0.18em' }}>LVYN</span>
          </div>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '26px', fontWeight: 300, color: '#e8eaf0', marginBottom: '8px' }}>Welcome to <em style={{ color: '#e8c96d' }}>Zolvyn AI</em></div>
          <p style={{ fontSize: '13.5px', color: '#7a8499', fontWeight: 300, lineHeight: 1.65 }}>India's legal intelligence platform. What should we call you?</p>
        </div>
        <input value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} placeholder="Enter your name…" autoFocus
          style={{ width: '100%', background: '#111520', border: '1.5px solid #1e2535', borderRadius: '11px', color: '#e8eaf0', fontFamily: "'Outfit',sans-serif", fontSize: '15px', fontWeight: 300, padding: '13px 16px', outline: 'none', marginBottom: '12px' }} />
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

// ─── MARKDOWN COMPONENTS ────────────────────────────────────────────────────
// Custom renderers so ReactMarkdown + remark-gfm produce styled output
const mdComponents: Record<string, React.FC<any>> = {
  h1: ({ children }) => (
    <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 500, fontSize: '24px', color: '#e8eaf0', margin: '22px 0 10px', lineHeight: 1.3, borderBottom: '1px solid #1e2535', paddingBottom: '8px' }}>{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 500, fontSize: '20px', color: '#e8eaf0', margin: '20px 0 8px', lineHeight: 1.3 }}>{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 500, fontSize: '17px', color: '#e8c96d', margin: '16px 0 6px', lineHeight: 1.3 }}>{children}</h3>
  ),
  p: ({ children }) => (
    <p style={{ margin: '0 0 14px', lineHeight: 1.8, fontWeight: 300, color: '#e8eaf0', fontSize: '15px' }}>{children}</p>
  ),
  strong: ({ children }) => (
    <strong style={{ color: '#e8eaf0', fontWeight: 600 }}>{children}</strong>
  ),
  em: ({ children }) => (
    <em style={{ color: '#e8c96d', fontStyle: 'italic' }}>{children}</em>
  ),
  ul: ({ children }) => (
    <ul style={{ paddingLeft: 0, margin: '0 0 14px', listStyle: 'none' }}>{children}</ul>
  ),
  ol: ({ children }) => (
    <ol style={{ paddingLeft: '22px', margin: '0 0 14px' }}>{children}</ol>
  ),
  li: ({ children, ordered }: { children: any; ordered?: boolean }) => (
    <li style={{ marginBottom: '8px', lineHeight: 1.7, fontWeight: 300, color: '#e8eaf0', paddingLeft: ordered ? 0 : '20px', position: 'relative', fontSize: '15px' }}>
      {!ordered && (
        <span style={{ position: 'absolute', left: 0, top: '1px', color: '#c9a84c', fontSize: '16px', lineHeight: 1.5 }}>•</span>
      )}
      {children}
    </li>
  ),
  code: ({ inline, children }: { inline?: boolean; children: any }) =>
    inline ? (
      <code style={{ background: '#161b28', border: '1px solid #2a3347', borderRadius: '4px', padding: '2px 7px', fontFamily: "'JetBrains Mono',monospace", fontSize: '12px', color: '#7eb8f7' }}>{children}</code>
    ) : (
      <pre style={{ background: '#111520', border: '1px solid #1e2535', borderRadius: '10px', padding: '16px', overflowX: 'auto', margin: '14px 0' }}>
        <code style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '13px', color: '#e8eaf0', background: 'none' }}>{children}</code>
      </pre>
    ),
  blockquote: ({ children }) => (
    <blockquote style={{ borderLeft: '3px solid #c9a84c', padding: '10px 18px', margin: '14px 0', color: '#9aa3b2', background: 'rgba(201,168,76,0.04)', borderRadius: '0 8px 8px 0' }}>{children}</blockquote>
  ),
  hr: () => <hr style={{ border: 'none', borderTop: '1px solid #1e2535', margin: '18px 0' }} />,
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: '#7eb8f7', textDecoration: 'underline' }}>{children}</a>
  ),
  // ─── TABLE ───────────────────────────────────────────────────────────────
  table: ({ children }) => (
    <div style={{ overflowX: 'auto', margin: '18px 0', borderRadius: '10px', border: '1px solid #1e2535' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px', minWidth: '400px' }}>
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => (
    <thead style={{ background: '#161b28' }}>{children}</thead>
  ),
  tbody: ({ children }) => (
    <tbody>{children}</tbody>
  ),
  tr: ({ children }) => (
    <tr style={{ borderBottom: '1px solid rgba(30,37,53,0.7)' }}>{children}</tr>
  ),
  th: ({ children }) => (
    <th style={{ padding: '11px 16px', textAlign: 'left', fontWeight: 600, color: '#9aa3b2', fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', borderBottom: '1px solid #1e2535', whiteSpace: 'nowrap' }}>{children}</th>
  ),
  td: ({ children }) => (
    <td style={{ padding: '11px 16px', color: '#e8eaf0', lineHeight: 1.6, fontSize: '13.5px', fontWeight: 300, verticalAlign: 'top' }}>{children}</td>
  ),
};

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConvId, setCurrentConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeChips, setActiveChips] = useState(['BNS', 'Constitution']);
  const [userName, setUserName] = useState<string | null>(null);
  const [showNamePopup, setShowNamePopup] = useState(false);
  const [uploadedDoc, setUploadedDoc] = useState<{ name: string; content: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('zolvyn_conversations');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConversations(parsed.map((c: any) => ({ ...c, timestamp: new Date(c.timestamp) })));
      } catch {}
    }
    const user = getStoredUser();
    if (user) { setUserName(user.name); trackPageVisit('chat'); }
    else setTimeout(() => setShowNamePopup(true), 600);
  }, []);

  useEffect(() => {
    if (conversations.length > 0) localStorage.setItem('zolvyn_conversations', JSON.stringify(conversations));
  }, [conversations]);

  const saveConversation = (msgs: Message[], convId: string | null, firstQuestion: string) => {
    const id = convId || crypto.randomUUID();
    const title = firstQuestion.length > 45 ? firstQuestion.slice(0, 45) + '…' : firstQuestion;
    setConversations(prev => {
      const existing = prev.find(c => c.id === id);
      if (existing) return prev.map(c => c.id === id ? { ...c, messages: msgs } : c);
      return [{ id, title, messages: msgs, timestamp: new Date() }, ...prev];
    });
    return id;
  };

  const loadConversation = (conv: Conversation) => {
    setCurrentConvId(conv.id);
    setMessages(conv.messages);
  };

  const newChat = () => {
    setCurrentConvId(null);
    setMessages([]);
    setInput('');
    setUploadedDoc(null);
  };

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      setUploadedDoc({ name: file.name, content: content.slice(0, 8000) });
    };
    reader.readAsText(file);
  };

  const sendMessage = async (question?: string) => {
    const q = question || input.trim();
    if (!q || streaming) return;
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setStreaming(true);

    const userMsg: Message = { role: 'user', content: q };
    const newMessages = [...messages, userMsg, { role: 'ai' as const, content: '', streaming: true }];
    setMessages(newMessages);
    trackQuery('chat', q);

    let questionWithContext = q;
    if (uploadedDoc) {
      questionWithContext = `[User uploaded document: "${uploadedDoc.name}"]\n\nDocument content:\n${uploadedDoc.content}\n\n---\n\nUser question: ${q}`;
    }

    const history = messages.slice(-6).map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.content }));

    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: questionWithContext,
          context_laws: activeChips.length ? activeChips : ['BNS', 'BNSS', 'IPC', 'Constitution'],
          state: 'All India',
          history,
          // ── FIX: increase max tokens so answers never get cut off ──
          max_tokens: 4096,
          // ── FIX: system prompt for structured, complete answers ──
          system_prompt: `You are Zolvyn AI, India's expert legal intelligence assistant. You MUST:
1. Always give COMPLETE answers — never stop mid-sentence or truncate.
2. Use rich Markdown formatting:
   - **Bold** for key legal terms, section numbers, and important points
   - Use ## and ### headers to organise long answers
   - Use bullet points (- item) for lists of rights, steps, or points
   - Use numbered lists (1. 2. 3.) for sequential procedures
   - Use proper Markdown tables (with | pipes and --- separators) when comparing laws, penalties, timelines, or multiple options
   - Use > blockquotes for actual legal text or landmark judgments
3. Structure every answer with:
   - A brief direct answer first (2-3 sentences)
   - Detailed breakdown with headers and bullets
   - Relevant sections/acts cited
   - Practical next steps for the user
4. When a table would help clarity, ALWAYS use it. Example format:
   | Column 1 | Column 2 | Column 3 |
   |----------|----------|----------|
   | Value    | Value    | Value    |
5. Cite specific sections: e.g., **Section 406 IPC**, **Article 21 Constitution**, **Section 17 RERA**
6. End with a ⚠️ disclaimer to consult a qualified advocate for their specific situation.`,
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
                  updated[updated.length - 1] = { role: 'ai', content: fullText, streaming: true };
                  return updated;
                });
              }
              if (data.done) {
                const finalMessages = [...messages, userMsg, { role: 'ai' as const, content: fullText, streaming: false }];
                setMessages(finalMessages);
                const convId = saveConversation(finalMessages, currentConvId, q);
                if (!currentConvId) setCurrentConvId(convId);
              }
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

  const groupConversations = () => {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const groups: Record<string, Conversation[]> = { Today: [], Yesterday: [], 'This Week': [], Older: [] };
    conversations.forEach(c => {
      const d = new Date(c.timestamp).toDateString();
      if (d === today) groups['Today'].push(c);
      else if (d === yesterday) groups['Yesterday'].push(c);
      else if (Date.now() - new Date(c.timestamp).getTime() < 7 * 86400000) groups['This Week'].push(c);
      else groups['Older'].push(c);
    });
    return groups;
  };

  const groups = groupConversations();

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
        .conv-item:hover{background:#161b28 !important}
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

        <button onClick={newChat} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', margin: '4px 8px 8px', borderRadius: '9px', background: 'none', border: 'none', color: '#9aa3b2', cursor: 'pointer', fontSize: '14px', fontFamily: "'Outfit',sans-serif", textAlign: 'left', width: 'calc(100% - 16px)' }} className="sb-item">
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
          {conversations.length === 0 ? (
            <div style={{ padding: '20px 10px', fontSize: '12px', color: '#3a4258', textAlign: 'center', fontWeight: 300, lineHeight: 1.6 }}>
              Your conversations will appear here after your first question
            </div>
          ) : (
            Object.entries(groups).map(([section, convs]) => convs.length === 0 ? null : (
              <div key={section}>
                <div style={{ fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#4a5568', padding: '10px 10px 5px', fontWeight: 500 }}>{section}</div>
                {convs.map(conv => (
                  <div key={conv.id} onClick={() => loadConversation(conv)} className="conv-item"
                    style={{ padding: '7px 10px', borderRadius: '8px', cursor: 'pointer', color: currentConvId === conv.id ? '#e8eaf0' : '#9aa3b2', fontSize: '13px', fontWeight: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '2px', background: currentConvId === conv.id ? 'rgba(201,168,76,0.07)' : 'transparent', transition: 'background 0.15s' }}>
                    {conv.title}
                  </div>
                ))}
              </div>
            ))
          )}
        </div>

        <div style={{ borderTop: '1px solid #1e2535', padding: '10px 10px 14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#4a5568', marginBottom: '6px', padding: '0 2px' }}>
            <span>Daily queries</span>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '11px' }}>Free plan</span>
          </div>
          <button onClick={() => window.location.href = '/upgrade'} style={{ width: '100%', padding: '10px 14px', borderRadius: '9px', background: 'linear-gradient(135deg,#c9a84c,#e8c96d)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', fontFamily: "'Outfit',sans-serif", fontSize: '13px', fontWeight: 600, color: '#0d0a04' }}>
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
        </div>

        {uploadedDoc && (
          <div style={{ padding: '8px 20px', background: 'rgba(126,184,247,0.06)', borderBottom: '1px solid rgba(126,184,247,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12.5px', color: '#7eb8f7', fontWeight: 300 }}>📎 {uploadedDoc.name} — asking about this document</span>
            <button onClick={() => setUploadedDoc(null)} style={{ background: 'none', border: 'none', color: '#4a5568', cursor: 'pointer', fontSize: '16px' }}>✕</button>
          </div>
        )}

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
                          <div style={{ fontSize: '15px', color: '#e8eaf0' }}>
                            {/* ── Always use ReactMarkdown so tables/bullets render even while streaming ── */}
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={mdComponents}
                            >
                              {msg.content}
                            </ReactMarkdown>
                            {msg.streaming && (
                              <span style={{ display: 'inline-block', width: '2px', height: '15px', background: '#e8c96d', marginLeft: '2px', verticalAlign: 'middle', animation: 'blink 0.85s ease infinite' }}></span>
                            )}
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
            <textarea ref={textareaRef} value={input} onChange={handleInput} onKeyDown={handleKey} placeholder="Ask any legal question… or upload a document 📎" rows={1}
              style={{ width: '100%', background: 'none', border: 'none', outline: 'none', fontFamily: "'Outfit',sans-serif", fontSize: '15px', color: '#e8eaf0', resize: 'none', lineHeight: 1.6, maxHeight: '200px', overflowY: 'auto', fontWeight: 300, minHeight: '24px' }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '5px' }}>
                <input ref={fileInputRef} type="file" accept=".txt,.pdf,.doc,.docx" onChange={handleFileUpload} style={{ display: 'none' }} />
                <button onClick={() => fileInputRef.current?.click()}
                  style={{ width: '28px', height: '28px', borderRadius: '7px', background: uploadedDoc ? 'rgba(126,184,247,0.1)' : 'none', border: uploadedDoc ? '1px solid rgba(126,184,247,0.3)' : 'none', color: uploadedDoc ? '#7eb8f7' : '#4a5568', cursor: 'pointer', fontSize: '14px' }}>📎</button>
                <button style={{ width: '28px', height: '28px', borderRadius: '7px', background: 'none', border: 'none', color: '#4a5568', cursor: 'pointer', fontSize: '14px' }}>🎤</button>
              </div>
              <button onClick={() => sendMessage()} disabled={streaming || !input.trim()}
                style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: streaming || !input.trim() ? '#1e2535' : 'linear-gradient(135deg,#4caf82,#6ee7a8)', color: streaming || !input.trim() ? '#4a5568' : '#061a10', cursor: streaming || !input.trim() ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>
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