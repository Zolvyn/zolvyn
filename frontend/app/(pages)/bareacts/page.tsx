'use client';
import { useState, useRef } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const NAV = [
  { icon: '💬', label: 'Legal Q&A', href: '/chat' },
  { icon: '📄', label: 'Contract Analyzer', href: '/contract' },
  { icon: '📝', label: 'Document Generator', href: '/generator' },
  { icon: '🔮', label: 'Case Predictor', href: '/predictor' },
  { icon: '⚖️', label: 'Bare Acts', href: '/bareacts', active: true },
];

const ACTS = ['All Acts', 'BNS 2023', 'BNSS 2023', 'Constitution', 'IPC 1860', 'CrPC', 'Consumer Protection Act', 'RERA', 'RTI Act', 'IT Act 2000', 'Labour Laws', 'Transfer of Property Act', 'Contract Act 1872', 'NI Act', 'Motor Vehicles Act', 'POCSO Act'];

const POPULAR = [
  { label: 'BNS § 103 — Murder', query: 'BNS section 103 murder punishment' },
  { label: 'Constitution Art. 21 — Right to Life', query: 'Article 21 Constitution right to life personal liberty' },
  { label: 'Section 138 NI Act — Cheque Bounce', query: 'Section 138 Negotiable Instruments Act cheque bounce' },
  { label: 'BNSS § 173 — FIR', query: 'BNSS section 173 FIR first information report' },
  { label: 'Consumer Protection Act § 2 — Deficiency', query: 'Consumer Protection Act section 2 deficiency in service' },
  { label: 'RERA § 18 — Builder Liability', query: 'RERA section 18 builder liability compensation' },
];

export default function BareActsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [query, setQuery] = useState('');
  const [selectedAct, setSelectedAct] = useState('All Acts');
  const [streaming, setStreaming] = useState(false);
  const [result, setResult] = useState('');
  const [searched, setSearched] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const search = async (q?: string) => {
    const searchQuery = q || query.trim();
    if (!searchQuery || streaming) return;
    setStreaming(true); setResult(''); setSearched(true);

    try {
      const res = await fetch(`${API_URL}/api/bare-acts`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery, act: selectedAct === 'All Acts' ? 'all' : selectedAct }),
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
    } catch { setResult('Error fetching. Please try again.'); }
    setStreaming(false);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); search(); }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#080a0f', color: '#e8eaf0', fontFamily: "'Outfit',sans-serif", overflow: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Outfit:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:5px} ::-webkit-scrollbar-thumb{background:#2a3347;border-radius:4px}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        .nav-item:hover{background:#161b28 !important;color:#e8eaf0 !important}
        .popular-item:hover{border-color:#2a3347 !important;color:#e8eaf0 !important}
        input::placeholder{color:#4a5568}
        input{outline:none}
        select{outline:none}
      `}</style>

      {/* SIDEBAR */}
      <div style={{ width: sidebarOpen ? '260px' : '0', minWidth: sidebarOpen ? '260px' : '0', background: '#0d1018', borderRight: '1px solid #1e2535', display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', transition: 'width 0.28s, min-width 0.28s', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 16px 14px', borderBottom: '1px solid #1e2535' }}>
          <a href="/landing" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 200, fontSize: '16px', color: '#e8eaf0', display: 'flex', alignItems: 'center' }}>
              <span style={{ letterSpacing: '0.18em' }}>Z</span>
              <span style={{ display: 'inline-block', width: '13px', height: '13px', border: '1.5px solid #7eb8f7', borderRadius: '50%', margin: '0 3px', boxShadow: '0 0 8px rgba(126,184,247,0.3)' }}></span>
              <span style={{ letterSpacing: '0.18em' }}>LVYN</span>
            </div>
            <div style={{ width: '1px', height: '22px', background: '#2a3347' }}></div>
            <div style={{ fontSize: '9.5px', letterSpacing: '0.18em', color: '#4a5568', textTransform: 'uppercase', fontWeight: 300 }}>Legal Intelligence</div>
          </a>
          <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', color: '#9aa3b2', cursor: 'pointer', fontSize: '14px' }}>◀</button>
        </div>
        <div style={{ padding: '10px 10px 6px', borderBottom: '1px solid #1e2535' }}>
          {NAV.map(item => (
            <a key={item.href} href={item.href} className="nav-item" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', borderRadius: '7px', color: item.active ? '#e8eaf0' : '#9aa3b2', background: item.active ? '#161b28' : 'transparent', fontSize: '13.5px', textDecoration: 'none', fontWeight: 300, marginBottom: '2px' }}>
              <span style={{ opacity: 0.8 }}>{item.icon}</span><span>{item.label}</span>
            </a>
          ))}
        </div>
        {/* Acts list in sidebar */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
          <div style={{ fontSize: '10px', letterSpacing: '2px', color: '#4a5568', textTransform: 'uppercase', padding: '10px 10px 6px', fontWeight: 500 }}>Indian Acts</div>
          {ACTS.slice(1).map(act => (
            <div key={act} onClick={() => setSelectedAct(act)} style={{ padding: '7px 10px', borderRadius: '7px', color: selectedAct === act ? '#e8c96d' : '#9aa3b2', background: selectedAct === act ? 'rgba(201,168,76,0.07)' : 'transparent', fontSize: '12.5px', cursor: 'pointer', fontWeight: 300, marginBottom: '1px' }} className="nav-item">
              {act}
            </div>
          ))}
        </div>
        <div style={{ borderTop: '1px solid #1e2535', padding: '12px' }}>
          <button onClick={() => window.location.href = '/upgrade'} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'linear-gradient(135deg,#c9a84c,#e8c96d)', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#0d0a04', fontFamily: "'Outfit',sans-serif" }}>👑 Upgrade to Pro</button>
        </div>
      </div>

      {/* MAIN */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', minWidth: 0 }}>
        <div style={{ height: '56px', minHeight: '56px', background: '#0d1018', borderBottom: '1px solid #1e2535', display: 'flex', alignItems: 'center', padding: '0 20px', gap: '14px' }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', color: '#9aa3b2', cursor: 'pointer', fontSize: '18px' }}>☰</button>
          <span style={{ fontSize: '15px', fontWeight: 500, color: '#e8eaf0' }}>Bare Acts Search</span>
          <select value={selectedAct} onChange={e => setSelectedAct(e.target.value)} style={{ background: '#161b28', border: '1px solid #1e2535', borderRadius: '20px', color: '#9aa3b2', fontSize: '11.5px', padding: '4px 12px', cursor: 'pointer', fontFamily: "'JetBrains Mono',monospace" }}>
            {ACTS.map(a => <option key={a}>{a}</option>)}
          </select>
          {searched && <button onClick={() => { setSearched(false); setResult(''); setQuery(''); }} style={{ marginLeft: 'auto', padding: '6px 14px', borderRadius: '7px', border: '1px solid #1e2535', background: 'none', color: '#9aa3b2', fontSize: '13px', cursor: 'pointer', fontFamily: "'Outfit',sans-serif" }}>Clear</button>}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '32px 40px' }}>
          <div style={{ maxWidth: '760px', margin: '0 auto' }}>

            {/* Search box */}
            <div style={{ marginBottom: '32px' }}>
              {!searched && (
                <>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '30px', fontWeight: 300, fontStyle: 'italic', color: '#e8eaf0', marginBottom: '6px' }}>
                    Search <span style={{ background: 'linear-gradient(135deg,#c9a84c,#e8c96d)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>any Indian law</span>
                  </div>
                  <p style={{ fontSize: '14px', color: '#9aa3b2', fontWeight: 300, marginBottom: '24px' }}>Search by section number, act name, or describe the legal situation. Get plain English explanations instantly.</p>
                </>
              )}
              <div style={{ display: 'flex', gap: '10px' }}>
                <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={handleKey} placeholder="e.g. BNS section 103, Article 21, cheque bounce law…" style={{ flex: 1, background: '#0d1018', border: '1.5px solid #1e2535', borderRadius: '12px', color: '#e8eaf0', fontFamily: "'Outfit',sans-serif", fontSize: '15px', fontWeight: 300, padding: '13px 18px', transition: 'border-color 0.15s' }} />
                <button onClick={() => search()} disabled={!query.trim() || streaming} style={{ padding: '13px 24px', borderRadius: '12px', background: query.trim() ? 'linear-gradient(135deg,#c9a84c,#e8c96d)' : '#1e2535', border: 'none', color: query.trim() ? '#000' : '#4a5568', fontSize: '14px', fontWeight: 600, cursor: query.trim() ? 'pointer' : 'not-allowed', fontFamily: "'Outfit',sans-serif", whiteSpace: 'nowrap' }}>
                  {streaming ? '⏳' : '🔍 Search'}
                </button>
              </div>
            </div>

            {/* Popular searches */}
            {!searched && (
              <div>
                <div style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#4a5568', marginBottom: '14px', fontWeight: 500 }}>Popular Searches</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {POPULAR.map(p => (
                    <div key={p.label} onClick={() => { setQuery(p.query); search(p.query); }} className="popular-item" style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #1e2535', background: '#0d1018', cursor: 'pointer', fontSize: '13.5px', color: '#9aa3b2', fontWeight: 300, display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.18s' }}>
                      <span>{p.label}</span>
                      <span style={{ fontSize: '16px', opacity: 0.4 }}>→</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Result */}
            {searched && (
              <div style={{ animation: 'fadeUp 0.35s ease' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'linear-gradient(135deg,rgba(126,184,247,0.12),rgba(201,168,76,0.08))', border: '1px solid #2a3347', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>⚖️</div>
                  <div style={{ flex: 1, borderLeft: '2px solid #4caf82', paddingLeft: '16px' }}>
                    <div style={{ fontSize: '15px', lineHeight: 1.75, color: '#e8eaf0', fontWeight: 300, whiteSpace: 'pre-wrap' }}>
                      {result}
                      {streaming && <span style={{ display: 'inline-block', width: '2px', height: '15px', background: '#e8c96d', marginLeft: '2px', verticalAlign: 'middle', animation: 'blink 0.85s ease infinite' }}></span>}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}