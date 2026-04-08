'use client';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

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

type State = 'idle' | 'predicting' | 'done' | 'error';

function Sidebar({ sidebarOpen, setSidebarOpen }: { sidebarOpen: boolean; setSidebarOpen: (v: boolean) => void }) {
  return (
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
          <a key={item.href} href={item.href} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', borderRadius: '7px', color: item.active ? '#e8eaf0' : '#9aa3b2', background: item.active ? '#161b28' : 'transparent', fontSize: '13.5px', textDecoration: 'none', fontWeight: 300, marginBottom: '2px' }}>
            <span style={{ opacity: 0.8 }}>{item.icon}</span><span>{item.label}</span>
          </a>
        ))}
      </div>
      <div style={{ flex: 1 }} />
      <div style={{ borderTop: '1px solid #1e2535', padding: '12px' }}>
        <button onClick={() => window.location.href = '/upgrade'} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'linear-gradient(135deg,#c9a84c,#e8c96d)', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#0d0a04', fontFamily: "'Outfit',sans-serif" }}>👑 Upgrade to Pro</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '9px', marginTop: '10px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg,#c9a84c,#e8c96d)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: '#0d0a04' }}>Z</div>
          <div><div style={{ fontSize: '13px', color: '#e8eaf0', fontWeight: 500 }}>Zolvyn User</div><div style={{ fontSize: '11px', color: '#4a5568' }}>Free plan</div></div>
        </div>
      </div>
    </div>
  );
}

export default function PredictorPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [state, setState] = useState<State>('idle');
  const [caseType, setCaseType] = useState('Criminal');
  const [side, setSide] = useState<'plaintiff' | 'defendant'>('plaintiff');
  const [description, setDescription] = useState('');
  const [result, setResult] = useState<PredictResult | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [error, setError] = useState('');

  const predict = async () => {
    if (!description.trim() || description.trim().length < 30) return;
    setState('predicting'); setResult(null); setError('');
    try {
      const res = await fetch(`${API_URL}/api/predict`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ case_description: description, case_type: caseType, side }),
      });
      const json = await res.json();
      if (json.status === 'success') {
        setResult(json.data);
        setState('done');
      } else {
        setError('Prediction failed. Please try again.');
        setState('error');
      }
    } catch {
      setError('Could not connect to backend. Please try again.');
      setState('error');
    }
  };

  const probColor = (p: number) => p >= 65 ? '#4caf82' : p >= 40 ? '#e8a030' : '#e05252';
  const probBg = (p: number) => p >= 65 ? 'rgba(76,175,130,0.08)' : p >= 40 ? 'rgba(232,160,48,0.08)' : 'rgba(224,82,82,0.08)';
  const probBorder = (p: number) => p >= 65 ? 'rgba(76,175,130,0.25)' : p >= 40 ? 'rgba(232,160,48,0.25)' : 'rgba(224,82,82,0.25)';

  const TABS = ['⚖️ Applicable Laws', '📚 Precedents', '💪 Strengths & Weaknesses', '🗺️ Strategy'];

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
        @keyframes progress{from{width:0}to{width:100%}}
        .nav-a:hover{background:#161b28 !important;color:#e8eaf0 !important}
        .tab-btn:hover{color:#e8eaf0 !important}
        .row-hover:hover{background:rgba(255,255,255,0.02) !important}
        textarea::placeholder{color:#4a5568} textarea,select{outline:none}

        .pred-md h1,.pred-md h2,.pred-md h3{font-family:'Cormorant Garamond',serif;font-weight:500;color:#e8eaf0;margin:14px 0 8px;line-height:1.3}
        .pred-md h1{font-size:22px}.pred-md h2{font-size:18px}.pred-md h3{font-size:16px}
        .pred-md p{margin-bottom:10px;line-height:1.75;font-weight:300;color:#e8eaf0}
        .pred-md strong{color:#e8eaf0;font-weight:600}
        .pred-md ul{padding-left:0;margin-bottom:12px;list-style:none}
        .pred-md ul li{margin-bottom:7px;line-height:1.65;color:#e8eaf0;padding-left:18px;position:relative;font-weight:300}
        .pred-md ul li::before{content:'•';position:absolute;left:0;color:#c9a84c;font-size:16px;line-height:1.4}
        .pred-md ol{padding-left:20px;margin-bottom:12px}
        .pred-md ol li{margin-bottom:7px;line-height:1.65;color:#e8eaf0;font-weight:300}
        .pred-md table{width:100%;border-collapse:collapse;margin:14px 0;border:1px solid #1e2535;border-radius:8px;overflow:hidden;font-size:13px}
        .pred-md th{background:#161b28;padding:9px 14px;text-align:left;font-weight:600;color:#9aa3b2;font-size:11px;letter-spacing:0.07em;text-transform:uppercase;border-bottom:1px solid #1e2535}
        .pred-md td{padding:9px 14px;border-bottom:1px solid rgba(30,37,53,0.5);color:#e8eaf0;font-weight:300}
        .pred-md tr:last-child td{border-bottom:none}
      `}</style>

      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', minWidth: 0 }}>
        {/* Topbar */}
        <div style={{ height: '56px', minHeight: '56px', background: '#0d1018', borderBottom: '1px solid #1e2535', display: 'flex', alignItems: 'center', padding: '0 20px', gap: '14px' }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', color: '#9aa3b2', cursor: 'pointer', fontSize: '18px' }}>☰</button>
          <span style={{ fontSize: '15px', fontWeight: 500, color: '#e8eaf0' }}>🔮 Case Predictor</span>
          {state === 'done' && (
            <button onClick={() => { setState('idle'); setResult(null); setDescription(''); setActiveTab(0); }}
              style={{ marginLeft: 'auto', padding: '6px 14px', borderRadius: '7px', border: '1px solid #1e2535', background: 'none', color: '#9aa3b2', fontSize: '13px', cursor: 'pointer', fontFamily: "'Outfit',sans-serif" }}>
              ← New Prediction
            </button>
          )}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '32px 40px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>

            {/* IDLE FORM */}
            {(state === 'idle' || state === 'error') && (
              <div style={{ animation: 'fadeUp 0.35s ease' }}>
                <div style={{ marginBottom: '32px' }}>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '32px', fontWeight: 300, fontStyle: 'italic', color: '#e8eaf0', marginBottom: '8px' }}>
                    Predict your <span style={{ background: 'linear-gradient(135deg,#c9a84c,#e8c96d)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>case outcome</span>
                  </div>
                  <p style={{ fontSize: '14px', color: '#9aa3b2', fontWeight: 300 }}>Describe your case and get AI-powered win probability, applicable laws, real court precedents, and full legal strategy.</p>
                </div>

                {error && (
                  <div style={{ padding: '12px 16px', borderRadius: '10px', background: 'rgba(224,82,82,0.08)', border: '1px solid rgba(224,82,82,0.25)', color: '#e05252', fontSize: '13.5px', marginBottom: '20px' }}>⚠ {error}</div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: '#9aa3b2', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 500 }}>Case Type</label>
                    <select value={caseType} onChange={e => setCaseType(e.target.value)}
                      style={{ width: '100%', background: '#111520', border: '1.5px solid #1e2535', borderRadius: '10px', color: '#e8eaf0', fontFamily: "'Outfit',sans-serif", fontSize: '14px', padding: '12px 14px', cursor: 'pointer' }}>
                      {CASE_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: '#9aa3b2', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 500 }}>Your Side</label>
                    <div style={{ display: 'flex', border: '1.5px solid #1e2535', borderRadius: '10px', overflow: 'hidden', height: '46px' }}>
                      {(['plaintiff', 'defendant'] as const).map(s => (
                        <button key={s} onClick={() => setSide(s)}
                          style={{ flex: 1, fontSize: '13.5px', fontFamily: "'Outfit',sans-serif", border: 'none', cursor: 'pointer', background: side === s ? '#1a2030' : '#111520', color: side === s ? '#e8eaf0' : '#9aa3b2', fontWeight: side === s ? 500 : 300, borderRight: s === 'plaintiff' ? '1px solid #1e2535' : 'none', transition: 'all 0.18s' }}>
                          {s === 'plaintiff' ? '⚡ Plaintiff' : '🛡️ Defendant'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '11px', color: '#9aa3b2', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 500 }}>Case Description</label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)}
                    placeholder="Describe your case in detail — what happened, who is involved, what outcome you want, FIR numbers, relevant dates, and key facts. The more detail you provide, the better the prediction."
                    rows={9}
                    style={{ width: '100%', background: '#111520', border: '1.5px solid #1e2535', borderRadius: '12px', color: '#e8eaf0', fontFamily: "'Outfit',sans-serif", fontSize: '14px', fontWeight: 300, lineHeight: 1.75, padding: '18px 20px', resize: 'vertical', transition: 'border-color 0.2s' }} />
                  <div style={{ fontSize: '12px', color: '#3a4258', marginTop: '6px', textAlign: 'right' }}>{description.length} characters {description.length < 30 ? `(need ${30 - description.length} more)` : '✓'}</div>
                </div>

                <button onClick={predict} disabled={description.trim().length < 30}
                  style={{ width: '100%', padding: '14px', borderRadius: '11px', background: description.trim().length >= 30 ? 'linear-gradient(135deg,#c9a84c,#e8c96d)' : '#1e2535', border: 'none', color: description.trim().length >= 30 ? '#000' : '#4a5568', fontSize: '15px', fontWeight: 600, cursor: description.trim().length >= 30 ? 'pointer' : 'not-allowed', fontFamily: "'Outfit',sans-serif", letterSpacing: '0.02em' }}>
                  🔮 Predict Case Outcome
                </button>

                <p style={{ fontSize: '12px', color: '#3a4258', textAlign: 'center', marginTop: '12px', fontWeight: 300 }}>
                  AI prediction based on Indian law precedents. Not a substitute for professional legal advice.
                </p>
              </div>
            )}

            {/* PREDICTING */}
            {state === 'predicting' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 20px', gap: '24px' }}>
                <div style={{ position: 'relative', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1.5px solid rgba(201,168,76,0.2)', animation: 'ring-pulse 1.8s ease-in-out infinite' }}></div>
                  <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1.5px solid rgba(201,168,76,0.15)', animation: 'ring-pulse 1.8s ease-in-out 0.6s infinite' }}></div>
                  <span style={{ fontSize: '32px', animation: 'gavel-swing 1.2s ease-in-out infinite alternate', transformOrigin: 'bottom right', display: 'inline-block' }}>🔮</span>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '16px', color: '#e8eaf0', fontWeight: 400, marginBottom: '6px' }}>Analyzing your case…</div>
                  <div style={{ fontSize: '13px', color: '#4a5568', fontWeight: 300 }}>Searching Indian law precedents and court judgments</div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[0, 1, 2].map(i => <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#c9a84c', animation: `dot-bounce 1.2s ease-in-out ${i * 0.2}s infinite` }}></div>)}
                </div>
              </div>
            )}

            {/* RESULTS */}
            {state === 'done' && result && (
              <div style={{ animation: 'fadeUp 0.4s ease' }}>

                {/* Win Probability Hero Card */}
                <div style={{ background: probBg(result.win_probability), border: `1px solid ${probBorder(result.win_probability)}`, borderRadius: '16px', padding: '32px', marginBottom: '24px', display: 'flex', gap: '40px', alignItems: 'center' }}>
                  <div style={{ textAlign: 'center', flexShrink: 0 }}>
                    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '72px', fontWeight: 300, color: probColor(result.win_probability), lineHeight: 1 }}>{result.win_probability}%</div>
                    <div style={{ fontSize: '11px', color: '#4a5568', letterSpacing: '1.5px', textTransform: 'uppercase', marginTop: '6px' }}>Win Probability</div>
                    <div style={{ marginTop: '14px', height: '5px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden', width: '130px' }}>
                      <div style={{ height: '100%', width: `${result.win_probability}%`, background: `linear-gradient(90deg,${probColor(result.win_probability)},${probColor(result.win_probability)}88)`, borderRadius: '3px', transition: 'width 1.2s cubic-bezier(0.4,0,0.2,1)' }}></div>
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '18px' }}>
                      {[
                        { label: caseType, color: '#e8c96d', bg: 'rgba(201,168,76,0.1)', border: 'rgba(201,168,76,0.25)' },
                        { label: side.charAt(0).toUpperCase() + side.slice(1), color: '#7eb8f7', bg: 'rgba(126,184,247,0.1)', border: 'rgba(126,184,247,0.25)' },
                        { label: `${result.confidence} Confidence`, color: result.confidence === 'HIGH' ? '#4caf82' : '#e8a030', bg: result.confidence === 'HIGH' ? 'rgba(76,175,130,0.1)' : 'rgba(232,160,48,0.1)', border: result.confidence === 'HIGH' ? 'rgba(76,175,130,0.25)' : 'rgba(232,160,48,0.25)' },
                      ].map(tag => (
                        <span key={tag.label} style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '11.5px', fontWeight: 500, background: tag.bg, color: tag.color, border: `1px solid ${tag.border}` }}>{tag.label}</span>
                      ))}
                    </div>
                    {result.recommended_action && (
                      <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '14px 16px', marginBottom: '12px', borderLeft: '3px solid #c9a84c' }}>
                        <div style={{ fontSize: '11px', color: '#c9a84c', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500, marginBottom: '5px' }}>Recommended Next Step</div>
                        <div style={{ fontSize: '14px', color: '#e8eaf0', fontWeight: 300, lineHeight: 1.6 }}>{result.recommended_action}</div>
                      </div>
                    )}
                    {result.timeline && (
                      <div style={{ fontSize: '13px', color: '#9aa3b2', fontWeight: 300 }}>⏱ Estimated Timeline: <strong style={{ color: '#e8eaf0', fontWeight: 400 }}>{result.timeline}</strong></div>
                    )}
                  </div>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', borderBottom: '1px solid #1e2535', marginBottom: '20px', overflowX: 'auto' }}>
                  {TABS.map((t, i) => (
                    <button key={t} onClick={() => setActiveTab(i)} className="tab-btn"
                      style={{ padding: '10px 20px', fontSize: '13px', background: 'none', border: 'none', borderBottom: activeTab === i ? '2px solid #c9a84c' : '2px solid transparent', color: activeTab === i ? '#e8c96d' : '#9aa3b2', cursor: 'pointer', fontFamily: "'Outfit',sans-serif", fontWeight: activeTab === i ? 500 : 300, marginBottom: '-1px', whiteSpace: 'nowrap', transition: 'color 0.18s' }}>
                      {t}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div style={{ background: '#0d1018', border: '1px solid #1e2535', borderRadius: '14px', overflow: 'hidden' }}>

                  {/* Laws */}
                  {activeTab === 0 && (
                    result.applicable_laws?.length > 0 ? result.applicable_laws.map((law, i) => (
                      <div key={i} className="row-hover" style={{ padding: '18px 22px', borderBottom: i < result.applicable_laws.length - 1 ? '1px solid #1e2535' : 'none', display: 'flex', gap: '16px', alignItems: 'flex-start', transition: 'background 0.15s' }}>
                        <span style={{ padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontFamily: "'JetBrains Mono',monospace", color: '#7eb8f7', background: 'rgba(126,184,247,0.08)', border: '1px solid rgba(126,184,247,0.2)', flexShrink: 0, whiteSpace: 'nowrap', marginTop: '2px' }}>{law.section}</span>
                        <span style={{ fontSize: '14px', color: '#9aa3b2', fontWeight: 300, lineHeight: 1.65 }}>{law.relevance}</span>
                      </div>
                    )) : <div style={{ padding: '40px', textAlign: 'center', color: '#4a5568' }}>No applicable laws found</div>
                  )}

                  {/* Precedents */}
                  {activeTab === 1 && (
                    result.similar_cases?.length > 0 ? result.similar_cases.map((c, i) => (
                      <div key={i} className="row-hover" style={{ padding: '20px 22px', borderBottom: i < result.similar_cases.length - 1 ? '1px solid #1e2535' : 'none', transition: 'background 0.15s' }}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'baseline', marginBottom: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '15px', fontWeight: 500, color: '#e8eaf0', fontFamily: "'Cormorant Garamond',serif" }}>{c.name}</span>
                          <span style={{ fontSize: '11px', color: '#4a5568', fontFamily: "'JetBrains Mono',monospace" }}>{c.court} · {c.year}</span>
                        </div>
                        <div style={{ display: 'inline-flex', padding: '3px 10px', borderRadius: '20px', background: 'rgba(76,175,130,0.08)', color: '#4caf82', fontSize: '12px', border: '1px solid rgba(76,175,130,0.2)', marginBottom: '8px', fontWeight: 400 }}>
                          Outcome: {c.outcome}
                        </div>
                        <div style={{ fontSize: '13.5px', color: '#9aa3b2', fontWeight: 300, lineHeight: 1.6 }}>{c.relevance}</div>
                      </div>
                    )) : <div style={{ padding: '40px', textAlign: 'center', color: '#4a5568' }}>No similar cases found</div>
                  )}

                  {/* Strengths & Weaknesses */}
                  {activeTab === 2 && (
                    <div>
                      {result.strengths?.length > 0 && (
                        <div style={{ padding: '18px 22px', borderBottom: '1px solid #1e2535' }}>
                          <div style={{ fontSize: '11px', color: '#4caf82', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '14px' }}>✓ Strengths</div>
                          {result.strengths.map((s, i) => (
                            <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: '10px', alignItems: 'flex-start' }}>
                              <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(76,175,130,0.12)', border: '1px solid rgba(76,175,130,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#4caf82', flexShrink: 0, marginTop: '1px' }}>✓</span>
                              <span style={{ fontSize: '14px', color: '#e8eaf0', fontWeight: 300, lineHeight: 1.65 }}>{s}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {result.weaknesses?.length > 0 && (
                        <div style={{ padding: '18px 22px' }}>
                          <div style={{ fontSize: '11px', color: '#e05252', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '14px' }}>✕ Weaknesses</div>
                          {result.weaknesses.map((w, i) => (
                            <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: '10px', alignItems: 'flex-start' }}>
                              <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(224,82,82,0.1)', border: '1px solid rgba(224,82,82,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#e05252', flexShrink: 0, marginTop: '1px' }}>✕</span>
                              <span style={{ fontSize: '14px', color: '#9aa3b2', fontWeight: 300, lineHeight: 1.65 }}>{w}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Strategy */}
                  {activeTab === 3 && (
                    result.strategy?.length > 0 ? result.strategy.map((step, i) => (
                      <div key={i} className="row-hover" style={{ padding: '18px 22px', borderBottom: i < result.strategy.length - 1 ? '1px solid #1e2535' : 'none', display: 'flex', gap: '16px', alignItems: 'flex-start', transition: 'background 0.15s' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg,#c9a84c,#e8c96d)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: '#000', flexShrink: 0 }}>{i + 1}</div>
                        <span style={{ fontSize: '14px', color: '#e8eaf0', fontWeight: 300, lineHeight: 1.7 }}>{step}</span>
                      </div>
                    )) : <div style={{ padding: '40px', textAlign: 'center', color: '#4a5568' }}>No strategy available</div>
                  )}
                </div>

                {/* Disclaimer */}
                <div style={{ marginTop: '20px', padding: '14px 18px', borderRadius: '10px', background: 'rgba(126,184,247,0.04)', border: '1px solid rgba(126,184,247,0.1)', fontSize: '12px', color: '#3a4258', lineHeight: 1.65 }}>
                  <strong style={{ color: 'rgba(126,184,247,0.5)' }}>Legal Notice —</strong> This AI prediction is based on patterns from Indian court judgments and is for informational purposes only. Always consult a qualified advocate before taking legal action.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}