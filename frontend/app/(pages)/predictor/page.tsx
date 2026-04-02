'use client';

import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const SIDEBAR_ITEMS = [
  { href: '/chat', icon: '💬', label: 'Legal Q&A' },
  { href: '/contract', icon: '📄', label: 'Contract Analyzer' },
  { href: '/generator', icon: '📝', label: 'Document Generator' },
  { href: '/predictor', icon: '🔮', label: 'Case Predictor', active: true },
  { href: '/bareacts', icon: '📚', label: 'Bare Acts' },
  { href: '/upgrade', icon: '⚡', label: 'Upgrade to Pro' },
];

const CASE_TYPES = [
  'Criminal — Theft / Robbery', 'Criminal — Assault / Murder', 'Criminal — Cybercrime',
  'Civil — Property Dispute', 'Civil — Contract Breach', 'Consumer Complaint',
  'Family — Divorce / Custody', 'Family — Maintenance', 'Labour — Wrongful Termination',
  'Labour — Salary Dispute', 'Cheque Bounce — NI Act 138', 'Motor Accident Claim',
  'Tenancy Dispute', 'Corporate — Fraud', 'RERA — Builder Dispute',
  'RTI — Information Denial', 'Tax — GST Dispute',
];

interface PredictResult {
  win_probability: number;
  confidence: string;
  applicable_laws: { section: string; relevance: string }[];
  similar_cases: { name: string; court: string; year: number; outcome: string; relevance: string }[];
  strengths: string[];
  weaknesses: string[];
  strategy: string[];
  recommended_action: string;
  timeline: string;
}

export default function PredictorPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [description, setDescription] = useState('');
  const [caseType, setCaseType] = useState(CASE_TYPES[0]);
  const [side, setSide] = useState<'plaintiff' | 'defendant'>('plaintiff');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictResult | null>(null);
  const [error, setError] = useState('');

  const predict = async () => {
    if (!description.trim()) { setError('Please describe your case.'); return; }
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await fetch(`${API_URL}/api/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ case_description: description, case_type: caseType, side }),
      });
      const json = await res.json();
      if (json.status === 'success') setResult(json.data);
      else setError('Prediction failed. Try again.');
    } catch {
      setError('Cannot connect to backend. Make sure it is running on port 8000.');
    }
    setLoading(false);
  };

  const probColor = result
    ? result.win_probability >= 70 ? '#4caf82'
    : result.win_probability >= 40 ? '#e8c96d' : '#e05252'
    : '#4caf82';

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
          <span style={{ fontSize: '15px', fontWeight: 500 }}>Case Predictor</span>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '32px 40px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', fontWeight: 300, fontStyle: 'italic', marginBottom: '6px' }}>
              Predict your <span style={{ color: '#e8c96d' }}>case outcome</span>
            </div>
            <div style={{ fontSize: '14px', color: '#9aa3b2', fontWeight: 300, marginBottom: '28px' }}>Describe your legal situation and get AI-powered win probability, strategy, and similar precedents.</div>

            {/* Input grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#4a5568', marginBottom: '8px' }}>Case Type</div>
                <select value={caseType} onChange={e => setCaseType(e.target.value)} style={{ width: '100%', background: '#0d1018', border: '1px solid #2a3347', borderRadius: '10px', padding: '12px 14px', fontSize: '14px', color: '#e8eaf0', fontFamily: 'inherit', outline: 'none' }}>
                  {CASE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <div style={{ fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#4a5568', marginBottom: '8px' }}>Your Side</div>
                <div style={{ display: 'flex', gap: '0', background: '#0d1018', border: '1px solid #1e2535', borderRadius: '10px', padding: '4px' }}>
                  {(['plaintiff', 'defendant'] as const).map(s => (
                    <button key={s} onClick={() => setSide(s)} style={{ flex: 1, padding: '10px', borderRadius: '7px', border: 'none', background: side === s ? '#161b28' : 'none', color: side === s ? '#e8eaf0' : '#9aa3b2', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', textTransform: 'capitalize' as const }}>{s}</button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#4a5568', marginBottom: '8px' }}>Case Description</div>
              <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe your legal situation in detail — what happened, when, who is involved, what evidence you have…" style={{ width: '100%', minHeight: '160px', background: '#0d1018', border: '1px solid #2a3347', borderRadius: '12px', padding: '16px', fontSize: '14px', color: '#e8eaf0', fontFamily: 'inherit', fontWeight: 300, lineHeight: 1.7, resize: 'vertical', outline: 'none' }} />
            </div>

            <button onClick={predict} disabled={loading} style={{ padding: '12px 36px', background: 'linear-gradient(135deg, #c9a84c, #e8c96d)', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 600, color: '#0d0a04', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: loading ? 0.6 : 1, marginBottom: '28px' }}>
              {loading ? 'Predicting…' : 'Predict Outcome →'}
            </button>

            {error && <div style={{ background: 'rgba(224,82,82,0.08)', border: '1px solid rgba(224,82,82,0.2)', borderRadius: '10px', padding: '14px', color: '#e05252', fontSize: '13.5px', marginBottom: '20px' }}>{error}</div>}

            {loading && (
              <div style={{ textAlign: 'center', padding: '48px', color: '#9aa3b2' }}>
                <div style={{ fontSize: '32px', marginBottom: '16px' }}>⚖️</div>
                <div style={{ fontSize: '15px', marginBottom: '8px' }}>Analyzing case…</div>
                <div style={{ fontSize: '13px', color: '#4a5568' }}>Searching precedents and applicable laws</div>
              </div>
            )}

            {result && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {/* Win probability */}
                <div style={{ background: '#0d1018', border: '1px solid #1e2535', borderRadius: '14px', padding: '28px', display: 'flex', alignItems: 'center', gap: '32px' }}>
                  <div style={{ textAlign: 'center', flexShrink: 0 }}>
                    <div style={{ width: '100px', height: '100px', borderRadius: '50%', border: `4px solid ${probColor}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 24px ${probColor}33` }}>
                      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', fontWeight: 500, color: probColor, lineHeight: 1 }}>{result.win_probability}%</div>
                      <div style={{ fontSize: '10px', color: '#4a5568', letterSpacing: '0.06em', textTransform: 'uppercase' as const }}>Win</div>
                    </div>
                    <div style={{ fontSize: '11px', color: '#4a5568', marginTop: '8px' }}>Confidence: {result.confidence}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '12px', color: '#4a5568', marginBottom: '4px', textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>Recommended Action</div>
                    <div style={{ fontSize: '15px', color: '#e8eaf0', lineHeight: 1.6, fontWeight: 400 }}>{result.recommended_action}</div>
                    {result.timeline && <div style={{ fontSize: '13px', color: '#9aa3b2', marginTop: '8px', fontWeight: 300 }}>⏱ Estimated timeline: {result.timeline}</div>}
                  </div>
                </div>

                {/* Strengths & Weaknesses */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ background: '#0d1018', border: '1px solid rgba(76,175,130,0.2)', borderRadius: '14px', overflow: 'hidden' }}>
                    <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(76,175,130,0.15)', fontSize: '13px', fontWeight: 500, color: '#4caf82' }}>✅ Strengths</div>
                    <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {result.strengths?.map((s, i) => <div key={i} style={{ fontSize: '13.5px', color: '#9aa3b2', fontWeight: 300, lineHeight: 1.55, paddingLeft: '10px', borderLeft: '2px solid #4caf82' }}>{s}</div>)}
                    </div>
                  </div>
                  <div style={{ background: '#0d1018', border: '1px solid rgba(224,82,82,0.2)', borderRadius: '14px', overflow: 'hidden' }}>
                    <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(224,82,82,0.15)', fontSize: '13px', fontWeight: 500, color: '#e05252' }}>⚠️ Weaknesses</div>
                    <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {result.weaknesses?.map((w, i) => <div key={i} style={{ fontSize: '13.5px', color: '#9aa3b2', fontWeight: 300, lineHeight: 1.55, paddingLeft: '10px', borderLeft: '2px solid #e05252' }}>{w}</div>)}
                    </div>
                  </div>
                </div>

                {/* Strategy */}
                {result.strategy?.length > 0 && (
                  <div style={{ background: '#0d1018', border: '1px solid #1e2535', borderRadius: '14px', overflow: 'hidden' }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid #1e2535', fontSize: '14px', fontWeight: 500 }}>📋 Legal Strategy</div>
                    <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {result.strategy.map((s, i) => (
                        <div key={i} style={{ display: 'flex', gap: '12px', fontSize: '14px', color: '#9aa3b2', fontWeight: 300, lineHeight: 1.6 }}>
                          <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#e8c96d', flexShrink: 0, marginTop: '2px' }}>{i + 1}</span>
                          {s}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Applicable Laws */}
                {result.applicable_laws?.length > 0 && (
                  <div style={{ background: '#0d1018', border: '1px solid #1e2535', borderRadius: '14px', overflow: 'hidden' }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid #1e2535', fontSize: '14px', fontWeight: 500 }}>⚖️ Applicable Laws</div>
                    <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {result.applicable_laws.map((l, i) => (
                        <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                          <span style={{ fontSize: '12px', fontFamily: 'monospace', color: '#7eb8f7', background: 'rgba(126,184,247,0.08)', border: '1px solid rgba(126,184,247,0.2)', padding: '2px 8px', borderRadius: '5px', whiteSpace: 'nowrap' as const }}>{l.section}</span>
                          <span style={{ fontSize: '13.5px', color: '#9aa3b2', fontWeight: 300, lineHeight: 1.5 }}>{l.relevance}</span>
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
        select option { background: #0d1018; }
        a { color: inherit; }
      `}</style>
    </div>
  );
}