'use client';
import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

type Tab = 'upload' | 'paste';
type State = 'idle' | 'analyzing' | 'done' | 'error';

interface ContractResult {
  overall_risk: string;
  score: number;
  summary: string;
  red_flags: { clause: string; issue: string; severity: string; recommendation: string }[];
  missing_clauses: string[];
  key_terms: { term: string; explanation: string }[];
  compliance: { law: string; status: string; note: string }[];
  recommendations: string[];
}

const NAV = [
  { icon: '💬', label: 'Legal Q&A', href: '/chat' },
  { icon: '📄', label: 'Contract Analyzer', href: '/contract', active: true },
  { icon: '📝', label: 'Document Generator', href: '/generator' },
  { icon: '🔮', label: 'Case Predictor', href: '/predictor' },
  { icon: '⚖️', label: 'Bare Acts', href: '/bareacts' },
];

export default function ContractPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [tab, setTab] = useState<Tab>('paste');
  const [text, setText] = useState('');
  const [state, setState] = useState<State>('idle');
  const [result, setResult] = useState<ContractResult | null>(null);
  const [error, setError] = useState('');
  const [activeResultTab, setActiveResultTab] = useState(0);

  const analyze = async () => {
    if (!text.trim() || text.trim().length < 50) { setError('Please paste at least 50 characters of contract text.'); return; }
    setState('analyzing'); setError(''); setResult(null);
    try {
      const res = await fetch(`${API_URL}/api/contract`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, analysis_type: 'full' }),
      });
      const json = await res.json();
      if (json.status === 'success') { setResult(json.data); setState('done'); }
      else { throw new Error('Analysis failed'); }
    } catch (e: any) { setError(e.message || 'Failed to analyze'); setState('error'); }
  };

  const riskColor = (r: string) => r === 'HIGH' ? '#e05252' : r === 'MEDIUM' ? '#e8a030' : '#4caf82';
  const riskBg = (r: string) => r === 'HIGH' ? 'rgba(224,82,82,0.1)' : r === 'MEDIUM' ? 'rgba(232,160,48,0.1)' : 'rgba(76,175,130,0.1)';

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
        .nav-item:hover{background:#161b28 !important;color:#e8eaf0 !important}
        .result-tab:hover{color:#e8eaf0 !important}
        .flag-row:hover{background:rgba(255,255,255,0.02) !important}
        textarea::placeholder{color:#4a5568}
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
        {/* Topbar */}
        <div style={{ height: '56px', minHeight: '56px', background: '#0d1018', borderBottom: '1px solid #1e2535', display: 'flex', alignItems: 'center', padding: '0 20px', gap: '14px' }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', color: '#9aa3b2', cursor: 'pointer', fontSize: '18px' }}>☰</button>
          <span style={{ fontSize: '15px', fontWeight: 500, color: '#e8eaf0' }}>Contract Analyzer</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 12px', borderRadius: '20px', background: '#161b28', border: '1px solid #1e2535', fontSize: '11.5px', color: '#9aa3b2' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4caf82' }}></div>
            Indian Contract Act 1872
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
            {result && <button onClick={() => { setState('idle'); setResult(null); setText(''); }} style={{ padding: '6px 14px', borderRadius: '7px', border: '1px solid #1e2535', background: 'none', color: '#9aa3b2', fontSize: '13px', cursor: 'pointer', fontFamily: "'Outfit',sans-serif" }}>New Analysis</button>}
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px 40px' }}>
          <div style={{ maxWidth: '860px', margin: '0 auto' }}>

            {state === 'idle' || state === 'error' ? (
              <>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '30px', fontWeight: 300, fontStyle: 'italic', color: '#e8eaf0', marginBottom: '6px' }}>
                  Analyze any <span style={{ background: 'linear-gradient(135deg,#c9a84c,#e8c96d)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>contract</span>
                </div>
                <p style={{ fontSize: '14px', color: '#9aa3b2', fontWeight: 300, marginBottom: '28px' }}>Paste contract text for instant AI-powered risk analysis under Indian law.</p>

                {error && <div style={{ padding: '12px 16px', borderRadius: '10px', background: 'rgba(224,82,82,0.08)', border: '1px solid rgba(224,82,82,0.25)', color: '#e05252', fontSize: '13.5px', marginBottom: '16px' }}>⚠ {error}</div>}

                {/* Tabs */}
                <div style={{ display: 'flex', border: '1px solid #1e2535', borderRadius: '9px', overflow: 'hidden', marginBottom: '20px', width: 'fit-content' }}>
                  {(['paste', 'upload'] as Tab[]).map(t => (
                    <button key={t} onClick={() => setTab(t)} style={{ padding: '8px 20px', fontSize: '13px', fontWeight: 400, color: tab === t ? '#e8eaf0' : '#9aa3b2', background: tab === t ? '#1a2030' : '#161b28', border: 'none', cursor: 'pointer', fontFamily: "'Outfit',sans-serif", borderRight: t === 'paste' ? '1px solid #1e2535' : 'none' }}>
                      {t === 'paste' ? '📋 Paste Text' : '📎 Upload File'}
                    </button>
                  ))}
                </div>

                {tab === 'paste' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Paste your contract text here — NDA, rental agreement, employment contract, MOU, or any legal document…" style={{ width: '100%', minHeight: '260px', background: '#111520', border: '1.5px solid #1e2535', borderRadius: '12px', color: '#e8eaf0', fontFamily: "'Outfit',sans-serif", fontSize: '14px', fontWeight: 300, lineHeight: 1.7, padding: '18px 20px', resize: 'vertical', outline: 'none' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', color: '#4a5568', fontFamily: "'JetBrains Mono',monospace" }}>{text.length} chars</span>
                      <button onClick={analyze} disabled={text.trim().length < 50} style={{ padding: '12px 32px', borderRadius: '10px', background: text.trim().length >= 50 ? 'linear-gradient(135deg,#c9a84c,#e8c96d)' : '#1e2535', border: 'none', color: text.trim().length >= 50 ? '#000' : '#4a5568', fontSize: '14px', fontWeight: 600, cursor: text.trim().length >= 50 ? 'pointer' : 'not-allowed', fontFamily: "'Outfit',sans-serif" }}>
                        🔍 Analyze Contract
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ border: '1.5px dashed #2a3347', borderRadius: '14px', background: '#111520', padding: '52px 40px', textAlign: 'center', cursor: 'pointer' }}>
                    <div style={{ width: '58px', height: '58px', background: '#161b28', border: '1px solid #2a3347', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', margin: '0 auto 18px' }}>📄</div>
                    <div style={{ fontSize: '16px', fontWeight: 400, color: '#e8eaf0', marginBottom: '6px' }}>Drop your contract here</div>
                    <div style={{ fontSize: '13px', color: '#9aa3b2', marginBottom: '20px' }}>or click to browse files</div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                      {['PDF', 'DOCX', 'TXT'].map(f => <span key={f} style={{ padding: '4px 12px', borderRadius: '20px', border: '1px solid #1e2535', background: '#161b28', fontSize: '11px', fontFamily: "'JetBrains Mono',monospace", color: '#9aa3b2' }}>{f}</span>)}
                    </div>
                    <div style={{ fontSize: '12px', color: '#4a5568', marginTop: '12px' }}>Upload coming soon — use paste tab for now</div>
                  </div>
                )}
              </>
            ) : state === 'analyzing' ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', gap: '22px', animation: 'fadeUp 0.4s ease' }}>
                <div style={{ position: 'relative', width: '70px', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1.5px solid rgba(201,168,76,0.2)', animation: 'ring-pulse 1.8s ease-in-out infinite' }}></div>
                  <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1.5px solid rgba(201,168,76,0.2)', animation: 'ring-pulse 1.8s ease-in-out 0.6s infinite' }}></div>
                  <span style={{ fontSize: '30px', animation: 'gavel-swing 1.2s ease-in-out infinite alternate', transformOrigin: 'bottom right', display: 'inline-block' }}>⚖️</span>
                </div>
                <div style={{ fontSize: '14px', color: '#9aa3b2', fontWeight: 300 }}>Analyzing under Indian Contract Act 1872…</div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {[0, 1, 2].map(i => <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#c9a84c', animation: `dot-bounce 1.2s ease-in-out ${i * 0.2}s infinite` }}></div>)}
                </div>
              </div>
            ) : result ? (
              <div style={{ animation: 'fadeUp 0.45s ease' }}>
                {/* Risk Banner */}
                <div style={{ borderRadius: '14px', padding: '24px 28px', display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '24px', background: riskBg(result.overall_risk), border: `1px solid ${riskColor(result.overall_risk)}40` }}>
                  <div style={{ padding: '8px 22px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', background: `${riskColor(result.overall_risk)}20`, color: riskColor(result.overall_risk), border: `1px solid ${riskColor(result.overall_risk)}40`, flexShrink: 0 }}>{result.overall_risk} RISK</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '22px', fontWeight: 400, fontStyle: 'italic', color: '#e8eaf0', marginBottom: '5px' }}>{result.summary?.split('.')[0]}.</div>
                    <div style={{ fontSize: '13.5px', color: '#9aa3b2', fontWeight: 300 }}>{result.red_flags?.length || 0} red flags · {result.missing_clauses?.length || 0} missing clauses</div>
                  </div>
                  <div style={{ flexShrink: 0, textAlign: 'center' }}>
                    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '42px', fontWeight: 300, color: riskColor(result.overall_risk), lineHeight: 1 }}>{result.score}</div>
                    <div style={{ fontSize: '10px', color: '#4a5568', letterSpacing: '1px', textTransform: 'uppercase' }}>Risk Score</div>
                  </div>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '24px' }}>
                  {[
                    { val: result.red_flags?.length || 0, label: 'Red Flags', color: '#e05252' },
                    { val: result.missing_clauses?.length || 0, label: 'Missing Clauses', color: '#e8a030' },
                    { val: result.key_terms?.length || 0, label: 'Key Terms', color: '#7eb8f7' },
                    { val: result.recommendations?.length || 0, label: 'Recommendations', color: '#4caf82' },
                  ].map(stat => (
                    <div key={stat.label} style={{ background: '#111520', border: '1px solid #1e2535', borderRadius: '12px', padding: '18px 20px' }}>
                      <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '32px', fontWeight: 300, color: stat.color, marginBottom: '4px' }}>{stat.val}</div>
                      <div style={{ fontSize: '11px', color: '#4a5568', letterSpacing: '0.5px' }}>{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Result Tabs */}
                <div style={{ display: 'flex', borderBottom: '1px solid #1e2535', marginBottom: '24px', gap: '0' }}>
                  {['Red Flags', 'Missing Clauses', 'Key Terms', 'Compliance', 'Recommendations'].map((t, i) => (
                    <button key={t} onClick={() => setActiveResultTab(i)} className="result-tab" style={{ padding: '10px 18px', fontSize: '13px', background: 'none', border: 'none', borderBottom: activeResultTab === i ? '2px solid #c9a84c' : '2px solid transparent', color: activeResultTab === i ? '#e8c96d' : '#9aa3b2', cursor: 'pointer', fontFamily: "'Outfit',sans-serif", fontWeight: activeResultTab === i ? 500 : 300, marginBottom: '-1px' }}>
                      {t}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div style={{ background: '#111520', border: '1px solid #1e2535', borderRadius: '14px', overflow: 'hidden' }}>
                  {activeResultTab === 0 && result.red_flags?.map((flag, i) => (
                    <div key={i} className="flag-row" style={{ padding: '18px 22px', borderBottom: i < result.red_flags.length - 1 ? '1px solid #1e2535' : 'none', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                      <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '10.5px', fontWeight: 500, flexShrink: 0, marginTop: '2px', background: flag.severity === 'HIGH' ? 'rgba(224,82,82,0.1)' : flag.severity === 'MEDIUM' ? 'rgba(232,160,48,0.1)' : 'rgba(76,175,130,0.1)', color: flag.severity === 'HIGH' ? '#e05252' : flag.severity === 'MEDIUM' ? '#e8a030' : '#4caf82', border: `1px solid ${flag.severity === 'HIGH' ? 'rgba(224,82,82,0.25)' : flag.severity === 'MEDIUM' ? 'rgba(232,160,48,0.25)' : 'rgba(76,175,130,0.25)'}` }}>{flag.severity}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: 500, color: '#e8eaf0', marginBottom: '4px' }}>{flag.clause}</div>
                        <div style={{ fontSize: '13.5px', color: '#9aa3b2', fontWeight: 300, marginBottom: '6px' }}>{flag.issue}</div>
                        <div style={{ fontSize: '12.5px', color: '#4caf82', fontWeight: 300 }}>💡 {flag.recommendation}</div>
                      </div>
                    </div>
                  ))}
                  {activeResultTab === 1 && result.missing_clauses?.map((clause, i) => (
                    <div key={i} style={{ padding: '14px 22px', borderBottom: i < result.missing_clauses.length - 1 ? '1px solid #1e2535' : 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ color: '#e05252', fontSize: '16px' }}>✕</span>
                      <span style={{ fontSize: '14px', color: '#e8eaf0', fontWeight: 300 }}>{clause}</span>
                    </div>
                  ))}
                  {activeResultTab === 2 && result.key_terms?.map((term, i) => (
                    <div key={i} style={{ padding: '16px 22px', borderBottom: i < result.key_terms.length - 1 ? '1px solid #1e2535' : 'none' }}>
                      <div style={{ fontSize: '13px', fontFamily: "'JetBrains Mono',monospace", color: '#7eb8f7', marginBottom: '5px' }}>{term.term}</div>
                      <div style={{ fontSize: '13.5px', color: '#9aa3b2', fontWeight: 300, lineHeight: 1.6 }}>{term.explanation}</div>
                    </div>
                  ))}
                  {activeResultTab === 3 && result.compliance?.map((item, i) => (
                    <div key={i} style={{ padding: '16px 22px', borderBottom: i < result.compliance.length - 1 ? '1px solid #1e2535' : 'none', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                      <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: 600, letterSpacing: '0.5px', flexShrink: 0, marginTop: '2px', background: item.status === 'COMPLIANT' ? 'rgba(76,175,130,0.1)' : item.status === 'NON_COMPLIANT' ? 'rgba(224,82,82,0.1)' : 'rgba(232,160,48,0.1)', color: item.status === 'COMPLIANT' ? '#4caf82' : item.status === 'NON_COMPLIANT' ? '#e05252' : '#e8a030', border: `1px solid ${item.status === 'COMPLIANT' ? 'rgba(76,175,130,0.25)' : item.status === 'NON_COMPLIANT' ? 'rgba(224,82,82,0.25)' : 'rgba(232,160,48,0.25)'}` }}>{item.status.replace('_', ' ')}</span>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 500, color: '#e8eaf0', marginBottom: '4px' }}>{item.law}</div>
                        <div style={{ fontSize: '13.5px', color: '#9aa3b2', fontWeight: 300 }}>{item.note}</div>
                      </div>
                    </div>
                  ))}
                  {activeResultTab === 4 && result.recommendations?.map((rec, i) => (
                    <div key={i} style={{ padding: '14px 22px', borderBottom: i < result.recommendations.length - 1 ? '1px solid #1e2535' : 'none', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <span style={{ color: '#c9a84c', fontWeight: 600, flexShrink: 0 }}>{i + 1}.</span>
                      <span style={{ fontSize: '14px', color: '#e8eaf0', fontWeight: 300, lineHeight: 1.65 }}>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}