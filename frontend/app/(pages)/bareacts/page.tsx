'use client';

import { useState, useRef, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const SIDEBAR_ITEMS = [
  { href: '/chat', icon: '💬', label: 'Legal Q&A' },
  { href: '/contract', icon: '📄', label: 'Contract Analyzer' },
  { href: '/generator', icon: '📝', label: 'Document Generator' },
  { href: '/predictor', icon: '🔮', label: 'Case Predictor' },
  { href: '/bareacts', icon: '📚', label: 'Bare Acts', active: true },
  { href: '/upgrade', icon: '⚡', label: 'Upgrade to Pro' },
];

const ACTS = [
  { key: 'all', label: 'All Laws' },
  { key: 'bns', label: 'BNS 2023' },
  { key: 'bnss', label: 'BNSS 2023' },
  { key: 'ipc', label: 'IPC 1860' },
  { key: 'crpc', label: 'CrPC' },
  { key: 'constitution', label: 'Constitution' },
  { key: 'contract', label: 'Contract Act' },
  { key: 'consumer', label: 'Consumer Act' },
  { key: 'rti', label: 'RTI Act' },
  { key: 'it', label: 'IT Act' },
];

const QUICK_SEARCHES = [
  'BNS Section 303 — Theft punishment',
  'Article 21 — Right to Life',
  'Section 138 NI Act — Cheque bounce',
  'IPC Section 302 — Murder',
  'Consumer Protection — Deficiency of service',
  'RTI Section 6 — How to file RTI',
];

export default function BareActsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [query, setQuery] = useState('');
  const [selectedAct, setSelectedAct] = useState('all');
  const [result, setResult] = useState('');
  const [streaming, setStreaming] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (resultRef.current) resultRef.current.scrollTop = resultRef.current.scrollHeight;
  }, [result]);

  const search = async (q?: string) => {
    const searchQuery = q || query;
    if (!searchQuery.trim()) return;
    setResult(''); setStreaming(true);

    try {
      const res = await fetch(`${API_URL}/api/bare-acts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery, act: selectedAct }),
      });

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let full = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const lines = decoder.decode(value).split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.token) { full += data.token; setResult(full); }
            } catch {}
          }
        }
      }
    } catch {
      setResult('Cannot connect to backend. Make sure it is running on port 8000.');
    }
    setStreaming(false);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#080a0f', color: '#e8eaf0', fontFamily: "'Outfit', sans-serif", overflow: 'hidden' }}>

      {/* SIDEBAR */}
      <div style={{ width: sidebarOpen ? '260px' : '0', minWidth: sidebarOpen ? '260px' : '0', background: '#0d1018', borderRight: '1px solid #1e2535', display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', transition: 'width 0.28s, min-width 0.28s', flexShrink: 0 }}>
        <div style={{ padding: '18px 16px 14px', borderBottom: '1px solid #1e2535', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontWeight: 300, fontSize: '17px', letterSpacing: '0.26em', color: '#e8eaf0', display: 'flex', alignItems: 'center' }}>
              Z<span style={{ display: 'inline-block', width: '14px', height: '14px', border: '1.5px solid #7eb8f7', borderRadius: '50%', margin: '0 1px', boxShadow: '0 0 8px rgba(126,184,247,0.3)' }}></span>LVY N
            </div>
            <div style={{ width: '1px', height: '18px', background: '#2a3347' }}></div>
            <div style={{ fontSize: '9.5px', letterSpacing: '0.18em', color: '#4a5568', textTransform: 'uppercase' as const, fontWeight: 300 }}>Legal Intelligence</div>
          </a>
          <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', color: '#7a8499', cursor: 'pointer', fontSize: '16px' }}>◀</button>
        </div>
        <div style={{ padding: '8px 10px', flex: 1, overflowY: 'auto' as const }}>
          {SIDEBAR_ITEMS.map(item => (
            <a key={item.href} href={item.href} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', borderRadius: '8px', color: item.active ? '#e8eaf0' : '#9aa3b2', fontSize: '13.5px', textDecoration: 'none', fontWeight: 300, background: item.active ? 'rgba(201,168,76,0.07)' : 'transparent', marginBottom: '2px', border: item.active ? '1px solid rgba(201,168,76,0.12)' : '1px solid transparent' }}>
              <span>{item.icon}</span>{item.label}
            </a>
          ))}
        </div>
        <div style={{ padding: '12px', borderTop: '1px solid #1e2535' }}>
          <button onClick={() => window.location.href = '/upgrade'} style={{ width: '100%', padding: '10px', borderRadius: '9px', background: 'linear-gradient(135deg, #c9a84c, #e8c96d)', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#0d0a04', fontFamily: 'inherit' }}>👑 Upgrade to Pro</button>
        </div>
      </div>

      {/* MAIN */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', minWidth: 0 }}>
        <div style={{ height: '56px', minHeight: '56px', borderBottom: '1px solid #1e2535', display: 'flex', alignItems: 'center', padding: '0 24px', gap: '12px' }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', color: '#7a8499', cursor: 'pointer', fontSize: '18px' }}>☰</button>
          <span style={{ fontSize: '15px', fontWeight: 500 }}>Bare Acts Library</span>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '32px 40px' }}>
          <div style={{ maxWidth: '860px', margin: '0 auto' }}>

            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', fontWeight: 300, fontStyle: 'italic', marginBottom: '6px' }}>
              Search <span style={{ color: '#e8c96d' }}>Indian law</span> sections
            </div>
            <div style={{ fontSize: '14px', color: '#9aa3b2', fontWeight: 300, marginBottom: '28px' }}>Look up any act, section, or legal provision in plain language with full context.</div>

            {/* Act filter */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' as const, marginBottom: '16px' }}>
              {ACTS.map(a => (
                <button key={a.key} onClick={() => setSelectedAct(a.key)} style={{ padding: '5px 12px', borderRadius: '20px', border: `1px solid ${selectedAct === a.key ? 'rgba(201,168,76,0.4)' : '#1e2535'}`, background: selectedAct === a.key ? 'rgba(201,168,76,0.08)' : 'none', color: selectedAct === a.key ? '#e8c96d' : '#9aa3b2', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.18s' }}>
                  {a.label}
                </button>
              ))}
            </div>

            {/* Search box */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && search()}
                placeholder="e.g. BNS Section 303, Article 21, Section 138 NI Act…"
                style={{ flex: 1, background: '#0d1018', border: '1px solid #2a3347', borderRadius: '10px', padding: '12px 16px', fontSize: '14px', color: '#e8eaf0', fontFamily: 'inherit', outline: 'none' }}
              />
              <button onClick={() => search()} disabled={streaming} style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #c9a84c, #e8c96d)', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 600, color: '#0d0a04', cursor: streaming ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: streaming ? 0.6 : 1 }}>
                {streaming ? 'Searching…' : 'Search →'}
              </button>
            </div>

            {/* Quick searches */}
            {!result && (
              <div>
                <div style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#4a5568', marginBottom: '12px' }}>Quick searches</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {QUICK_SEARCHES.map((s, i) => (
                    <button key={i} onClick={() => { setQuery(s); search(s); }} style={{ textAlign: 'left', padding: '12px 16px', background: '#0d1018', border: '1px solid #1e2535', borderRadius: '10px', color: '#9aa3b2', fontSize: '13.5px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 300, transition: 'all 0.18s' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = '#2a3347'; e.currentTarget.style.color = '#e8eaf0'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e2535'; e.currentTarget.style.color = '#9aa3b2'; }}>
                      🔍 {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Result */}
            {result && (
              <div style={{ background: '#0d1018', border: '1px solid #1e2535', borderRadius: '14px', padding: '24px', marginTop: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #1e2535' }}>
                  <span style={{ fontSize: '16px' }}>📖</span>
                  <span style={{ fontSize: '14px', fontWeight: 500, color: '#e8eaf0' }}>Legal Reference</span>
                  {streaming && <span style={{ fontSize: '12px', color: '#4a5568', marginLeft: 'auto' }}>Streaming…</span>}
                </div>
                <div ref={resultRef} style={{ fontSize: '15px', lineHeight: 1.75, color: '#e8eaf0', fontWeight: 300, whiteSpace: 'pre-wrap' as const }}>
                  {result}
                  {streaming && <span style={{ display: 'inline-block', width: '2px', height: '15px', background: '#e8c96d', marginLeft: '2px', verticalAlign: 'middle', animation: 'blink 0.85s ease infinite' }}>|</span>}
                </div>
                {!streaming && (
                  <button onClick={() => { setResult(''); setQuery(''); }} style={{ marginTop: '20px', padding: '8px 16px', background: 'none', border: '1px solid #2a3347', borderRadius: '8px', color: '#9aa3b2', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>
                    ← Search again
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Outfit:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #1e2535; border-radius: 4px; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        input::placeholder { color: #4a5568; }
        a { color: inherit; }
      `}</style>
    </div>
  );
}