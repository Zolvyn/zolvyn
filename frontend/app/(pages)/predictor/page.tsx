'use client';
import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const NAV = [
  { icon: '💬', label: 'Legal Q&A', href: '/chat' },
  { icon: '📄', label: 'Contract Analyzer', href: '/contract' },
  { icon: '📝', label: 'Document Generator', href: '/generator' },
  { icon: '🔮', label: 'Case Predictor', href: '/predictor', active: true },
  { icon: '⚖️', label: 'Bare Acts', href: '/bareacts' },
];

const CASE_TYPES = ['Criminal', 'Civil', 'Family', 'Consumer', 'Property', 'Employment', 'Cyber', 'Motor Accident', 'Cheque Bounce', 'RERA', 'Tax', 'Corporate', 'Intellectual Property', 'Matrimonial', 'Constitutional', 'Bail', 'Arbitration'];

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

type State = 'idle' | 'predicting' | 'done';

export default function PredictorPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [state, setState] = useState<State>('idle');
  const [caseType, setCaseType] = useState('Criminal');
  const [side, setSide] = useState<'plaintiff' | 'defendant'>('plaintiff');
  const [description, setDescription] = useState('');
  const [result, setResult] = useState<PredictResult | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  const predict = async () => {
    if (!description.trim() || description.trim().length < 30) return;
    setState('predicting'); setResult(null);
    try {
      const res = await fetch(`${API_URL}/api/predict`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ case_description: description, case_type: caseType, side }),
      });
      const json = await res.json();
      if (json.status === 'success') { setResult(json.data); setState('done'); }
      else { setState('idle'); }
    } catch { setState('idle'); }
  };

  const probColor = (p: number) => p >= 65 ? '#4caf82' : p >= 40 ? '#e8a030' : '#e05252';

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#080a0f', color: '#e8eaf0', fontFamily: "'Outfit',sans-serif", overflow: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Outfit:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:5px} ::-webkit-scrollbar-thumb{background:#2a3347;border-radius:4px}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes gavel-swing{from{transform:rotate(-18deg)}to{transform:rotate(12deg)}}
        @keyframes dot-bounce{0%,80%,100%{transform:translateY(0);opacity:0.4}40%{transform:translateY(-8px);opacity:1}}
        @keyframes ring-pulse{0%{transform:scale(1);opacity:0.5}50%{transform:scale(1.3);opacity:0.15}100%{transform:scale(1);opacity:0.5}}
        @keyframes fill-bar{from{width:0}to{width:var(--w)}}
        .nav-item:hover{background:#161b28 !important;color:#e8eaf0 !important}
        textarea::placeholder{color:#4a5568}
        textarea{outline:none}
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
        <div style={{ flex: 1 }}></div>
        <div style={{ borderTop: '1px solid #1e2535', padding: '12px' }}>
          <button onClick={() => window.location.href = '/upgrade'} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'linear-gradient(135deg,#c9a84c,#e8c96d)', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#0d0a04', fontFamily: "'Outfit',sans-serif" }}>👑 Upgrade to Pro</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px', marginTop: '10px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg,#c9a84c,#e8c96d)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: '#0d0a04' }}>Z</div>
            <div><div style={{ fontSize: '13px', color: '#e8eaf0', fontWeight: 500 }}>Zolvyn User</div><div style={{ fontSize: '11px', color: '#4a5568' }}>Free plan</div></div>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', minWidth: 0 }}>
        <div style={{ height: '56px', minHeight: '56px', background: '#0d1018', borderBottom: '1px solid #1e2535', display: 'flex', alignItems: 'center', padding: '0 20px', gap: '14px' }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', color: '#9aa3b2', cursor: 'pointer', fontSize: '18px' }}>☰</button>
          <span style={{ fontSize: '15px', fontWeight: 500, color: '#e8eaf0' }}>Case Predictor</span>
          {state === 'done' && <button onClick={() => { setState('idle'); setResult(null); setDescription(''); }} style={{ marginLeft: 'auto', padding: '6px 14px', borderRadius: '7px', border: '1px solid #1e2535', background: 'none', color: '#9aa3b2', fontSize: '13px', cursor: 'pointer', fontFamily: "'Outfit',sans-serif" }}>New Prediction</button>}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '32px 40px' }}>
          <div style={{ maxWidth: '860px', margin: '0 auto' }}>

            {(state === 'idle') && (
              <>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '30px', fontWeight: 300, fontStyle: 'italic', color: '#e8eaf0', marginBottom: '6px' }}>
                  Predict your <span style={{ background: 'linear-gradient(135deg,#c9a84c,#e8c96d)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>case outcome</span>
                </div>
                <p style={{ fontSize: '14px', color: '#9aa3b2', fontWeight: 300, marginBottom: '28px' }}>Describe your case and get win probability, applicable laws, real precedents, and strategy.</p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#9aa3b2', letterSpacing: '0.5px', marginBottom: '7px' }}>Case Type</label>
                    <select value={caseType} onChange={e => setCaseType(e.target.value)} style={{ width: '100%', background: '#111520', border: '1.5px solid #1e2535', borderRadius: '9px', color: '#e8eaf0', fontFamily: "'Outfit',sans-serif", fontSize: '14px', padding: '10px 14px', cursor: 'pointer' }}>
                      {CASE_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#9aa3b2', letterSpacing: '0.5px', marginBottom: '7px' }}>Your Side</label>
                    <div style={{ display: 'flex', border: '1.5px solid #1e2535', borderRadius: '9px', overflow: 'hidden' }}>
                      {(['plaintiff', 'defendant'] as const).map(s => (
                        <button key={s} onClick={() => setSide(s)} style={{ flex: 1, padding: '10px', fontSize: '14px', fontFamily: "'Outfit',sans-serif", border: 'none', cursor: 'pointer', background: side === s ? '#1a2030' : '#111520', color: side === s ? '#e8eaf0' : '#9aa3b2', fontWeight: side === s ? 500 : 300, borderRight: s === 'plaintiff' ? '1px solid #1e2535' : 'none' }}>
                          {s === 'plaintiff' ? '⚡ Plaintiff' : '🛡️ Defendant'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: '#9aa3b2', letterSpacing: '0.5px', marginBottom: '7px' }}>Case Description</label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe your case in detail — what happened, who is involved, what you want as outcome, any FIR numbers, relevant dates, and key facts…" rows={8} style={{ width: '100%', background: '#111520', border: '1.5px solid #1e2535', borderRadius: '12px', color: '#e8eaf0', fontFamily: "'Outfit',sans-serif", fontSize: '14px', fontWeight: 300, lineHeight: 1.7, padding: '18px 20px', resize: 'vertical' }} />
                </div>

                <button onClick={predict} disabled={description.trim().length < 30} style={{ width: '100%', padding: '13px', borderRadius: '10px', background: description.trim().length >= 30 ? 'linear-gradient(135deg,#c9a84c,#e8c96d)' : '#1e2535', border: 'none', color: description.trim().length >= 30 ? '#000' : '#4a5568', fontSize: '14.5px', fontWeight: 600, cursor: description.trim().length >= 30 ? 'pointer' : 'not-allowed', fontFamily: "'Outfit',sans-serif" }}>
                  🔮 Predict Case Outcome
                </button>
              </>
            )}

            {state === 'predicting' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', gap: '22px' }}>
                <div style={{ position: 'relative', width: '70px', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1.5px solid rgba(201,168,76,0.2)', animation: 'ring-pulse 1.8s ease-in-out infinite' }}></div>
                  <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1.5px solid rgba(201,168,76,0.2)', animation: 'ring-pulse 1.8s ease-in-out 0.6s infinite' }}></div>
                  <span style={{ fontSize: '30px', animation: 'gavel-swing 1.2s ease-in-out infinite alternate', transformOrigin: 'bottom right', display: 'inline-block' }}>🔮</span>
                </div>
                <div style={{ fontSize: '14px', color: '#9aa3b2', fontWeight: 300 }}>Analyzing precedents and Indian law…</div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {[0, 1, 2].map(i => <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#c9a84c', animation: `dot-bounce 1.2s ease-in-out ${i * 0.2}s infinite` }}></div>)}
                </div>
              </div>
            )}

            {state === 'done' && result && (
              <div style={{ animation: 'fadeUp 0.4s ease' }}>
                {/* Win Probability */}
                <div style={{ background: '#111520', border: '1px solid #1e2535', borderRadius: '16px', padding: '28px', marginBottom: '24px', display: 'flex', gap: '32px', alignItems: 'center' }}>
                  <div style={{ textAlign: 'center', flexShrink: 0 }}>
                    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '64px', fontWeight: 300, color: probColor(result.win_probability), lineHeight: 1 }}>{result.win_probability}%</div>
                    <div style={{ fontSize: '11px', color: '#4a5568', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '4px' }}>Win Probability</div>
                    <div style={{ marginTop: '12px', height: '4px', background: '#1e2535', borderRadius: '2px', overflow: 'hidden', width: '120px' }}>
                      <div style={{ height: '100%', width: `${result.win_probability}%`, background: `linear-gradient(90deg,${probColor(result.win_probability)},${probColor(result.win_probability)}aa)`, borderRadius: '2px', transition: 'width 1s ease' }}></div>
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                      <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 500, background: 'rgba(201,168,76,0.1)', color: '#e8c96d', border: '1px solid rgba(201,168,76,0.25)' }}>{caseType}</span>
                      <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 500, background: 'rgba(126,184,247,0.1)', color: '#7eb8f7', border: '1px solid rgba(126,184,247,0.25)' }}>{side}</span>
                      <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 500, background: result.confidence === 'HIGH' ? 'rgba(76,175,130,0.1)' : 'rgba(232,160,48,0.1)', color: result.confidence === 'HIGH' ? '#4caf82' : '#e8a030', border: `1px solid ${result.confidence === 'HIGH' ? 'rgba(76,175,130,0.25)' : 'rgba(232,160,48,0.25)'}` }}>{result.confidence} CONFIDENCE</span>
                    </div>
                    <div style={{ fontSize: '14px', color: '#e8eaf0', fontWeight: 400, marginBottom: '8px' }}>⚡ Next Step: {result.recommended_action}</div>
                    <div style={{ fontSize: '13px', color: '#9aa3b2', fontWeight: 300 }}>⏱ Estimated timeline: {result.timeline}</div>
                  </div>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', borderBottom: '1px solid #1e2535', marginBottom: '20px' }}>
                  {['Laws', 'Precedents', 'Strengths', 'Strategy'].map((t, i) => (
                    <button key={t} onClick={() => setActiveTab(i)} style={{ padding: '10px 18px', fontSize: '13px', background: 'none', border: 'none', borderBottom: activeTab === i ? '2px solid #c9a84c' : '2px solid transparent', color: activeTab === i ? '#e8c96d' : '#9aa3b2', cursor: 'pointer', fontFamily: "'Outfit',sans-serif", fontWeight: activeTab === i ? 500 : 300, marginBottom: '-1px' }}>
                      {t}
                    </button>
                  ))}
                </div>

                <div style={{ background: '#111520', border: '1px solid #1e2535', borderRadius: '14px', overflow: 'hidden' }}>
                  {activeTab === 0 && result.applicable_laws?.map((law, i) => (
                    <div key={i} style={{ padding: '16px 22px', borderBottom: i < result.applicable_laws.length - 1 ? '1px solid #1e2535' : 'none', display: 'flex', gap: '16px' }}>
                      <span style={{ padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontFamily: "'JetBrains Mono',monospace", color: '#7eb8f7', background: 'rgba(126,184,247,0.08)', border: '1px solid rgba(126,184,247,0.2)', flexShrink: 0, height: 'fit-content', marginTop: '2px' }}>{law.section}</span>
                      <span style={{ fontSize: '13.5px', color: '#9aa3b2', fontWeight: 300, lineHeight: 1.6 }}>{law.relevance}</span>
                    </div>
                  ))}
                  {activeTab === 1 && result.similar_cases?.map((c, i) => (
                    <div key={i} style={{ padding: '18px 22px', borderBottom: i < result.similar_cases.length - 1 ? '1px solid #1e2535' : 'none' }}>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 500, color: '#e8eaf0' }}>{c.name}</span>
                        <span style={{ fontSize: '11px', color: '#4a5568', fontFamily: "'JetBrains Mono',monospace" }}>{c.court} · {c.year}</span>
                      </div>
                      <div style={{ fontSize: '13px', color: '#4caf82', fontWeight: 300, marginBottom: '4px' }}>Outcome: {c.outcome}</div>
                      <div style={{ fontSize: '13px', color: '#9aa3b2', fontWeight: 300 }}>{c.relevance}</div>
                    </div>
                  ))}
                  {activeTab === 2 && (
                    <div>
                      {result.strengths?.map((s, i) => (
                        <div key={i} style={{ padding: '13px 22px', borderBottom: '1px solid #1e2535', display: 'flex', gap: '10px' }}>
                          <span style={{ color: '#4caf82', flexShrink: 0 }}>✓</span>
                          <span style={{ fontSize: '13.5px', color: '#e8eaf0', fontWeight: 300 }}>{s}</span>
                        </div>
                      ))}
                      {result.weaknesses?.map((w, i) => (
                        <div key={i} style={{ padding: '13px 22px', borderBottom: i < result.weaknesses.length - 1 ? '1px solid #1e2535' : 'none', display: 'flex', gap: '10px' }}>
                          <span style={{ color: '#e05252', flexShrink: 0 }}>✕</span>
                          <span style={{ fontSize: '13.5px', color: '#9aa3b2', fontWeight: 300 }}>{w}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {activeTab === 3 && result.strategy?.map((step, i) => (
                    <div key={i} style={{ padding: '16px 22px', borderBottom: i < result.strategy.length - 1 ? '1px solid #1e2535' : 'none', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'linear-gradient(135deg,#c9a84c,#e8c96d)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: '#000', flexShrink: 0 }}>{i + 1}</div>
                      <span style={{ fontSize: '13.5px', color: '#e8eaf0', fontWeight: 300, lineHeight: 1.65 }}>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}