'use client';

import { useState, useRef } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface ClauseFlag {
  clause: string;
  issue: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  recommendation: string;
}

interface ContractResult {
  overall_risk: 'HIGH' | 'MEDIUM' | 'LOW';
  score: number;
  summary: string;
  red_flags: ClauseFlag[];
  missing_clauses: string[];
  key_terms: { term: string; explanation: string }[];
  compliance: { law: string; status: string; note: string }[];
  recommendations: string[];
}

const SIDEBAR_ITEMS = [
  { href: '/chat', icon: '💬', label: 'Legal Q&A' },
  { href: '/contract', icon: '📄', label: 'Contract Analyzer', active: true },
  { href: '/generator', icon: '📝', label: 'Document Generator' },
  { href: '/predictor', icon: '🔮', label: 'Case Predictor' },
  { href: '/bareacts', icon: '📚', label: 'Bare Acts' },
  { href: '/upgrade', icon: '⚡', label: 'Upgrade to Pro' },
];

const RISK_COLORS = {
  HIGH: { bg: 'rgba(224,82,82,0.1)', color: '#e05252', border: 'rgba(224,82,82,0.3)' },
  MEDIUM: { bg: 'rgba(232,169,76,0.1)', color: '#e8c96d', border: 'rgba(232,169,76,0.3)' },
  LOW: { bg: 'rgba(76,175,130,0.1)', color: '#4caf82', border: 'rgba(76,175,130,0.3)' },
};

export default function ContractPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [tab, setTab] = useState<'upload' | 'paste'>('upload');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ContractResult | null>(null);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const analyze = async (contractText: string) => {
    if (!contractText.trim()) { setError('Please provide contract text.'); return; }
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await fetch(`${API_URL}/api/contract`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: contractText }),
      });
      const json = await res.json();
      if (json.status === 'success') setResult(json.data);
      else setError('Analysis failed. Try again.');
    } catch {
      setError('Cannot connect to backend. Make sure it is running on port 8000.');
    }
    setLoading(false);
  };

  const handleFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await fetch(`${API_URL}/api/contract/upload`, { method: 'POST', body: formData });
      const json = await res.json();
      if (json.status === 'success') setResult(json.data);
      else setError(json.detail || 'Upload failed.');
    } catch {
      setError('Cannot connect to backend.');
    }
    setLoading(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const riskColor = result ? RISK_COLORS[result.overall_risk] : RISK_COLORS.LOW;

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
          <button onClick={() => window.location.href = '/upgrade'} style={{ width: '100%', padding: '10px', borderRadius: '9px', background: 'linear-gradient(135deg, #c9a84c, #e8c96d)', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#0d0a04', fontFamily: 'inherit' }}>
            👑 Upgrade to Pro
          </button>
        </div>
      </div>

      {/* MAIN */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', minWidth: 0 }}>

        {/* Topbar */}
        <div style={{ height: '56px', minHeight: '56px', borderBottom: '1px solid #1e2535', display: 'flex', alignItems: 'center', padding: '0 24px', gap: '12px' }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', color: '#7a8499', cursor: 'pointer', fontSize: '18px' }}>☰</button>
          <span style={{ fontSize: '15px', fontWeight: 500, color: '#e8eaf0' }}>Contract Analyzer</span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{ fontSize: '11.5px', padding: '4px 12px', borderRadius: '20px', background: '#161b28', border: '1px solid #1e2535', color: '#9aa3b2' }}>🔒 Indian Contract Act 1872</div>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px 40px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>

            {/* Heading */}
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', fontWeight: 300, fontStyle: 'italic', color: '#e8eaf0', marginBottom: '6px' }}>
              Analyze any <span style={{ color: '#e8c96d' }}>contract</span>
            </div>
            <div style={{ fontSize: '14px', color: '#9aa3b2', fontWeight: 300, marginBottom: '28px' }}>Upload a PDF/DOCX or paste contract text for instant AI-powered risk analysis under Indian law.</div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0', background: '#0d1018', border: '1px solid #1e2535', borderRadius: '10px', padding: '4px', marginBottom: '20px', width: 'fit-content' }}>
              {(['upload', 'paste'] as const).map(t => (
                <button key={t} onClick={() => setTab(t)} style={{ padding: '8px 20px', borderRadius: '7px', border: 'none', background: tab === t ? '#161b28' : 'none', color: tab === t ? '#e8eaf0' : '#9aa3b2', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 400 }}>
                  {t === 'upload' ? '📎 Upload File' : '📋 Paste Text'}
                </button>
              ))}
            </div>

            {/* Upload zone */}
            {tab === 'upload' && (
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                onClick={() => fileRef.current?.click()}
                style={{ border: `2px dashed ${dragOver ? '#e8c96d' : '#2a3347'}`, borderRadius: '14px', padding: '48px', textAlign: 'center', cursor: 'pointer', background: dragOver ? 'rgba(201,168,76,0.03)' : '#0d1018', transition: 'all 0.2s', marginBottom: '20px' }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>📄</div>
                <div style={{ fontSize: '15px', color: '#e8eaf0', marginBottom: '6px', fontWeight: 400 }}>Drop your contract here</div>
                <div style={{ fontSize: '13px', color: '#4a5568' }}>PDF or DOCX · Max 10MB</div>
                <input ref={fileRef} type="file" accept=".pdf,.docx" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
              </div>
            )}

            {/* Paste text */}
            {tab === 'paste' && (
              <div style={{ marginBottom: '20px' }}>
                <textarea
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder="Paste your contract text here…"
                  style={{ width: '100%', minHeight: '200px', background: '#0d1018', border: '1px solid #2a3347', borderRadius: '12px', padding: '16px', fontSize: '14px', color: '#e8eaf0', fontFamily: 'inherit', fontWeight: 300, lineHeight: 1.7, resize: 'vertical', outline: 'none' }}
                />
                <button onClick={() => analyze(text)} disabled={loading} style={{ marginTop: '12px', padding: '12px 32px', background: 'linear-gradient(135deg, #c9a84c, #e8c96d)', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 600, color: '#0d0a04', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: loading ? 0.6 : 1 }}>
                  {loading ? 'Analyzing…' : 'Analyze Contract →'}
                </button>
              </div>
            )}

            {/* Error */}
            {error && <div style={{ background: 'rgba(224,82,82,0.08)', border: '1px solid rgba(224,82,82,0.2)', borderRadius: '10px', padding: '14px 16px', color: '#e05252', fontSize: '13.5px', marginBottom: '20px' }}>{error}</div>}

            {/* Loading */}
            {loading && (
              <div style={{ textAlign: 'center', padding: '48px', color: '#9aa3b2' }}>
                <div style={{ fontSize: '32px', marginBottom: '16px', animation: 'spin 1s linear infinite', display: 'inline-block' }}>⚖️</div>
                <div style={{ fontSize: '15px', marginBottom: '8px' }}>Analyzing contract…</div>
                <div style={{ fontSize: '13px', color: '#4a5568' }}>Checking clauses under Indian Contract Act 1872</div>
              </div>
            )}

            {/* Results */}
            {result && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {/* Risk header */}
                <div style={{ background: '#0d1018', border: `1px solid ${riskColor.border}`, borderRadius: '14px', padding: '24px 28px', display: 'flex', alignItems: 'center', gap: '24px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#4a5568', marginBottom: '6px' }}>Overall Risk</div>
                    <div style={{ display: 'inline-block', padding: '6px 18px', borderRadius: '20px', background: riskColor.bg, color: riskColor.color, border: `1px solid ${riskColor.border}`, fontSize: '14px', fontWeight: 600, letterSpacing: '0.06em' }}>{result.overall_risk}</div>
                  </div>
                  <div style={{ width: '1px', height: '48px', background: '#1e2535' }}></div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#4a5568', marginBottom: '6px' }}>Safety Score</div>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '32px', fontWeight: 500, color: riskColor.color, lineHeight: 1 }}>{result.score}<span style={{ fontSize: '16px', color: '#4a5568' }}>/100</span></div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', color: '#9aa3b2', lineHeight: 1.6, fontWeight: 300 }}>{result.summary}</div>
                  </div>
                </div>

                {/* Red Flags */}
                {result.red_flags?.length > 0 && (
                  <div style={{ background: '#0d1018', border: '1px solid #1e2535', borderRadius: '14px', overflow: 'hidden' }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid #1e2535', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>🚩</span><span style={{ fontSize: '14px', fontWeight: 500, color: '#e8eaf0' }}>Red Flags ({result.red_flags.length})</span>
                    </div>
                    {result.red_flags.map((flag, i) => {
                      const c = RISK_COLORS[flag.severity];
                      return (
                        <div key={i} style={{ padding: '16px 20px', borderBottom: i < result.red_flags.length - 1 ? '1px solid #1e2535' : 'none' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                            <span style={{ fontSize: '12px', fontFamily: 'monospace', color: '#9aa3b2' }}>Clause {flag.clause}</span>
                            <span style={{ padding: '2px 8px', borderRadius: '20px', background: c.bg, color: c.color, border: `1px solid ${c.border}`, fontSize: '10.5px', fontWeight: 500 }}>{flag.severity}</span>
                          </div>
                          <div style={{ fontSize: '14px', color: '#e8eaf0', marginBottom: '6px', fontWeight: 400 }}>{flag.issue}</div>
                          <div style={{ fontSize: '13px', color: '#4caf82', fontWeight: 300 }}>→ {flag.recommendation}</div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Missing Clauses */}
                {result.missing_clauses?.length > 0 && (
                  <div style={{ background: '#0d1018', border: '1px solid #1e2535', borderRadius: '14px', overflow: 'hidden' }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid #1e2535', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>⚠️</span><span style={{ fontSize: '14px', fontWeight: 500, color: '#e8eaf0' }}>Missing Clauses</span>
                    </div>
                    <div style={{ padding: '16px 20px', display: 'flex', flexWrap: 'wrap' as const, gap: '8px' }}>
                      {result.missing_clauses.map((c, i) => (
                        <span key={i} style={{ padding: '5px 12px', borderRadius: '20px', background: 'rgba(232,169,76,0.08)', border: '1px solid rgba(232,169,76,0.2)', color: '#e8c96d', fontSize: '12.5px' }}>{c}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {result.recommendations?.length > 0 && (
                  <div style={{ background: '#0d1018', border: '1px solid #1e2535', borderRadius: '14px', overflow: 'hidden' }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid #1e2535', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>✅</span><span style={{ fontSize: '14px', fontWeight: 500, color: '#e8eaf0' }}>Recommendations</span>
                    </div>
                    <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column' as const, gap: '10px' }}>
                      {result.recommendations.map((r, i) => (
                        <div key={i} style={{ display: 'flex', gap: '10px', fontSize: '14px', color: '#9aa3b2', fontWeight: 300, lineHeight: 1.6 }}>
                          <span style={{ color: '#4caf82', flexShrink: 0 }}>{i + 1}.</span>{r}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Key Terms */}
                {result.key_terms?.length > 0 && (
                  <div style={{ background: '#0d1018', border: '1px solid #1e2535', borderRadius: '14px', overflow: 'hidden' }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid #1e2535', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>📖</span><span style={{ fontSize: '14px', fontWeight: 500, color: '#e8eaf0' }}>Key Legal Terms</span>
                    </div>
                    <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column' as const, gap: '12px' }}>
                      {result.key_terms.map((t, i) => (
                        <div key={i}>
                          <div style={{ fontSize: '13px', fontFamily: 'monospace', color: '#7eb8f7', marginBottom: '4px' }}>{t.term}</div>
                          <div style={{ fontSize: '13.5px', color: '#9aa3b2', fontWeight: 300, lineHeight: 1.6 }}>{t.explanation}</div>
                        </div>
                      ))}
                    </div>
                  </div>
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
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        a { color: inherit; }
      `}</style>
    </div>
  );
}