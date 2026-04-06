'use client';
import { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';

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
  { label: 'BNS § 103 — Murder', query: 'BNS section 103 murder punishment', icon: '⚖️' },
  { label: 'Constitution Art. 21 — Right to Life', query: 'Article 21 Constitution right to life personal liberty', icon: '🏛️' },
  { label: 'Section 138 NI Act — Cheque Bounce', query: 'Section 138 Negotiable Instruments Act cheque bounce punishment', icon: '💳' },
  { label: 'BNSS § 173 — FIR Procedure', query: 'BNSS section 173 FIR first information report procedure', icon: '📋' },
  { label: 'Consumer Protection Act — Deficiency of Service', query: 'Consumer Protection Act section 2 deficiency in service complaint', icon: '🛡️' },
  { label: 'RERA § 18 — Builder Liability', query: 'RERA section 18 builder liability compensation delay possession', icon: '🏠' },
  { label: 'IPC § 420 — Cheating', query: 'IPC section 420 cheating dishonestly inducing delivery of property', icon: '🚨' },
  { label: 'Article 19 — Freedom of Speech', query: 'Article 19 Constitution freedom of speech expression reasonable restrictions', icon: '🗣️' },
];

export default function BareActsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [query, setQuery] = useState('');
  const [selectedAct, setSelectedAct] = useState('All Acts');
  const [streaming, setStreaming] = useState(false);
  const [result, setResult] = useState('');
  const [searched, setSearched] = useState(false);
  const [currentQuery, setCurrentQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const search = async (q?: string) => {
    const searchQuery = q || query.trim();
    if (!searchQuery || streaming) return;
    setStreaming(true);
    setResult('');
    setSearched(true);
    setCurrentQuery(searchQuery);

    try {
      const res = await fetch(`${API_URL}/api/bare-acts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
              if (data.done) setStreaming(false);
            } catch {}
          }
        }
      }
    } catch {
      setResult('Connection error. Please try again.');
    }
    setStreaming(false);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') search();
  };

  const clearSearch = () => {
    setSearched(false);
    setResult('');
    setQuery('');
    setCurrentQuery('');
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#080a0f', color: '#e8eaf0', fontFamily: "'Outfit',sans-serif", overflow: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Outfit:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:5px} ::-webkit-scrollbar-thumb{background:#2a3347;border-radius:4px}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        .nav-a:hover{background:#161b28 !important;color:#e8eaf0 !important}
        .pop-item:hover{border-color:#2a3347 !important;background:rgba(255,255,255,0.02) !important;color:#e8eaf0 !important}
        .act-item:hover{background:#161b28 !important;color:#e8c96d !important}
        input::placeholder{color:#4a5568} input,select{outline:none}

        .bare-md h1,.bare-md h2,.bare-md h3{font-family:'Cormorant Garamond',serif;font-weight:500;color:#e8eaf0;margin:20px 0 10px;line-height:1.25}
        .bare-md h1{font-size:26px;border-bottom:1px solid #1e2535;padding-bottom:10px}
        .bare-md h2{font-size:20px;color:#e8c96d}
        .bare-md h3{font-size:17px;color:#7eb8f7}
        .bare-md p{margin-bottom:14px;line-height:1.85;font-weight:300;color:#e8eaf0;font-size:15px}
        .bare-md strong{color:#e8eaf0;font-weight:600}
        .bare-md em{color:#e8c96d;font-style:italic}
        .bare-md ul{padding-left:0;margin-bottom:16px;list-style:none}
        .bare-md ul li{margin-bottom:10px;line-height:1.7;color:#e8eaf0;padding-left:22px;position:relative;font-weight:300;font-size:15px}
        .bare-md ul li::before{content:'•';position:absolute;left:0;color:#c9a84c;font-size:18px;line-height:1.4}
        .bare-md ol{padding-left:22px;margin-bottom:16px}
        .bare-md ol li{margin-bottom:10px;line-height:1.7;color:#e8eaf0;font-weight:300;font-size:15px}
        .bare-md blockquote{border-left:3px solid #c9a84c;padding:12px 20px;margin:16px 0;color:#9aa3b2;background:rgba(201,168,76,0.04);border-radius:0 10px 10px 0;font-style:italic}
        .bare-md code{background:#161b28;border:1px solid #2a3347;border-radius:4px;padding:2px 7px;font-family:'JetBrains Mono',monospace;font-size:12.5px;color:#7eb8f7}
        .bare-md table{width:100%;border-collapse:collapse;margin:18px 0;border:1px solid #1e2535;border-radius:10px;overflow:hidden;font-size:14px}
        .bare-md th{background:#161b28;padding:11px 16px;text-align:left;font-weight:600;color:#9aa3b2;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;border-bottom:1px solid #1e2535}
        .bare-md td{padding:11px 16px;border-bottom:1px solid rgba(30,37,53,0.5);color:#e8eaf0;font-weight:300;line-height:1.6}
        .bare-md tr:last-child td{border-bottom:none}
        .bare-md tr:hover td{background:rgba(255,255,255,0.015)}
        .bare-md hr{border:none;border-top:1px solid #1e2535;margin:20px 0}
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
            <a key={item.href} href={item.href} className="nav-a" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', borderRadius: '7px', color: item.active ? '#e8eaf0' : '#9aa3b2', background: item.active ? '#161b28' : 'transparent', fontSize: '13.5px', textDecoration: 'none', fontWeight: 300, marginBottom: '2px' }}>
              <span style={{ opacity: 0.8 }}>{item.icon}</span><span>{item.label}</span>
            </a>
          ))}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
          <div style={{ fontSize: '10px', letterSpacing: '2px', color: '#4a5568', textTransform: 'uppercase', padding: '12px 10px 8px', fontWeight: 600 }}>Filter by Act</div>
          {ACTS.map(act => (
            <div key={act} onClick={() => { setSelectedAct(act); }} className="act-item"
              style={{ padding: '7px 10px', borderRadius: '7px', color: selectedAct === act ? '#e8c96d' : '#9aa3b2', background: selectedAct === act ? 'rgba(201,168,76,0.07)' : 'transparent', fontSize: '12.5px', cursor: 'pointer', fontWeight: selectedAct === act ? 400 : 300, marginBottom: '1px', transition: 'all 0.15s', borderLeft: selectedAct === act ? '2px solid #c9a84c' : '2px solid transparent' }}>
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
        {/* Topbar */}
        <div style={{ height: '56px', minHeight: '56px', background: '#0d1018', borderBottom: '1px solid #1e2535', display: 'flex', alignItems: 'center', padding: '0 20px', gap: '14px' }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', color: '#9aa3b2', cursor: 'pointer', fontSize: '18px' }}>☰</button>
          <span style={{ fontSize: '15px', fontWeight: 500, color: '#e8eaf0' }}>⚖️ Bare Acts Search</span>
          {selectedAct !== 'All Acts' && (
            <span style={{ padding: '3px 10px', borderRadius: '20px', background: 'rgba(201,168,76,0.08)', color: '#e8c96d', fontSize: '11px', border: '1px solid rgba(201,168,76,0.2)', fontFamily: "'JetBrains Mono',monospace" }}>{selectedAct}</span>
          )}
          {searched && (
            <button onClick={clearSearch} style={{ marginLeft: 'auto', padding: '6px 14px', borderRadius: '7px', border: '1px solid #1e2535', background: 'none', color: '#9aa3b2', fontSize: '13px', cursor: 'pointer', fontFamily: "'Outfit',sans-serif" }}>← New Search</button>
          )}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '32px 40px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>

            {/* Search Box — always visible */}
            <div style={{ marginBottom: searched ? '24px' : '32px' }}>
              {!searched && (
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '32px', fontWeight: 300, fontStyle: 'italic', color: '#e8eaf0', marginBottom: '8px' }}>
                    Search <span style={{ background: 'linear-gradient(135deg,#c9a84c,#e8c96d)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>any Indian law</span>
                  </div>
                  <p style={{ fontSize: '14px', color: '#9aa3b2', fontWeight: 300, lineHeight: 1.65 }}>
                    Search by section number, act name, or describe your legal situation in plain language. Get structured, plain-English explanations with exact section references.
                  </p>
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', background: '#0d1018', border: '1.5px solid #1e2535', borderRadius: '14px', padding: '6px 6px 6px 18px', alignItems: 'center', transition: 'border-color 0.2s' }}>
                <span style={{ fontSize: '16px', flexShrink: 0 }}>🔍</span>
                <input
                  ref={inputRef}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="e.g. BNS section 103, Article 21, what is cheque bounce law…"
                  style={{ flex: 1, background: 'none', border: 'none', color: '#e8eaf0', fontFamily: "'Outfit',sans-serif", fontSize: '15px', fontWeight: 300, padding: '8px 0' }}
                />
                <button onClick={() => search()} disabled={!query.trim() || streaming}
                  style={{ padding: '10px 20px', borderRadius: '10px', background: query.trim() && !streaming ? 'linear-gradient(135deg,#c9a84c,#e8c96d)' : '#161b28', border: 'none', color: query.trim() && !streaming ? '#000' : '#4a5568', fontSize: '13.5px', fontWeight: 600, cursor: query.trim() && !streaming ? 'pointer' : 'not-allowed', fontFamily: "'Outfit',sans-serif", whiteSpace: 'nowrap', flexShrink: 0, transition: 'all 0.2s' }}>
                  {streaming ? '⏳ Searching…' : 'Search →'}
                </button>
              </div>
            </div>

            {/* Popular Searches */}
            {!searched && (
              <div style={{ animation: 'fadeUp 0.35s ease' }}>
                <div style={{ fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#4a5568', marginBottom: '14px', fontWeight: 600 }}>Popular Searches</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {POPULAR.map(p => (
                    <div key={p.label} onClick={() => { setQuery(p.query); search(p.query); }} className="pop-item"
                      style={{ padding: '14px 16px', borderRadius: '12px', border: '1px solid #1e2535', background: '#0d1018', cursor: 'pointer', transition: 'all 0.18s', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '20px', flexShrink: 0 }}>{p.icon}</span>
                      <div>
                        <div style={{ fontSize: '13px', color: '#e8eaf0', fontWeight: 400, marginBottom: '2px' }}>{p.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Result */}
            {searched && (
              <div style={{ animation: 'fadeUp 0.35s ease' }}>
                {currentQuery && (
                  <div style={{ fontSize: '12px', color: '#4a5568', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>Results for:</span>
                    <span style={{ padding: '2px 10px', borderRadius: '20px', background: '#161b28', border: '1px solid #1e2535', color: '#9aa3b2', fontFamily: "'JetBrains Mono',monospace", fontSize: '11.5px' }}>{currentQuery}</span>
                  </div>
                )}

                <div style={{ background: '#0d1018', border: '1px solid #1e2535', borderRadius: '16px', overflow: 'hidden' }}>
                  <div style={{ padding: '16px 22px', borderBottom: '1px solid #1e2535', display: 'flex', alignItems: 'center', gap: '12px', background: '#111520' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg,rgba(126,184,247,0.12),rgba(201,168,76,0.08))', border: '1px solid #2a3347', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>⚖️</div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 500, color: '#e8eaf0' }}>Zolvyn Legal Reference</div>
                      <div style={{ fontSize: '11px', color: '#4a5568', fontWeight: 300 }}>Based on {selectedAct === 'All Acts' ? 'all Indian laws' : selectedAct}</div>
                    </div>
                    {streaming && <div style={{ marginLeft: 'auto', width: '14px', height: '14px', borderRadius: '50%', border: '2px solid #c9a84c', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }}></div>}
                  </div>

                  <div style={{ padding: '24px 28px', borderLeft: '3px solid #4caf82' }}>
                    {streaming && result === '' ? (
                      <div style={{ color: '#4a5568', fontSize: '14px', fontWeight: 300 }}>Searching Indian law database…</div>
                    ) : (
                      <div className="bare-md">
                        {streaming ? (
                          <div style={{ whiteSpace: 'pre-wrap', fontSize: '15px', lineHeight: 1.85, color: '#e8eaf0', fontWeight: 300 }}>
                            {result}
                            <span style={{ display: 'inline-block', width: '2px', height: '16px', background: '#e8c96d', marginLeft: '2px', verticalAlign: 'middle', animation: 'blink 0.85s ease infinite' }}></span>
                          </div>
                        ) : (
                          <ReactMarkdown>{result}</ReactMarkdown>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {!streaming && result && (
                  <div style={{ marginTop: '16px', padding: '12px 16px', borderRadius: '10px', background: 'rgba(126,184,247,0.04)', border: '1px solid rgba(126,184,247,0.1)', fontSize: '12px', color: '#3a4258', lineHeight: 1.6 }}>
                    <strong style={{ color: 'rgba(126,184,247,0.5)' }}>Note —</strong> This is AI-generated legal information for educational purposes. Always verify with the official bare act text and consult a qualified advocate for legal matters.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}