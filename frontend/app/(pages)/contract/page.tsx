'use client';
import { useState, useRef } from 'react';

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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tab, setTab] = useState<Tab>('paste');
  const [text, setText] = useState('');
  const [state, setState] = useState<State>('idle');
  const [result, setResult] = useState<ContractResult | null>(null);
  const [error, setError] = useState('');
  const [activeResultTab, setActiveResultTab] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleFile = async (file: File) => {
    if (!file) return;
    const maxSize = 5 * 1024 * 1024; // 5MB limit
    if (file.size > maxSize) {
      setError('File too large. Maximum size is 5MB.');
      return;
    }
    const allowed = ['.pdf', '.docx', '.txt', '.doc'];
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowed.includes(ext)) {
      setError('Only PDF, DOCX, and TXT files are supported.');
      return;
    }
    setUploadedFile({ name: file.name, size: formatFileSize(file.size) });
    setError('');

    // Read as text for TXT files, otherwise send to backend upload endpoint
    if (ext === '.txt') {
      const reader = new FileReader();
      reader.onload = (e) => {
        setText(e.target?.result as string);
        setTab('paste');
      };
      reader.readAsText(file);
    } else {
      // For PDF/DOCX — send to backend /api/contract/upload
      setState('analyzing');
      setError('');
      setResult(null);
      try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch(`${API_URL}/api/contract/upload`, {
          method: 'POST',
          body: formData,
        });
        const json = await res.json();
        if (json.status === 'success') {
          setResult(json.data);
          setState('done');
        } else {
          throw new Error(json.detail || 'Analysis failed');
        }
      } catch (e: any) {
        setError(e.message || 'Failed to analyze file');
        setState('error');
        setUploadedFile(null);
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const analyze = async () => {
    if (!text.trim() || text.trim().length < 50) {
      setError('Please paste at least 50 characters of contract text.');
      return;
    }
    setState('analyzing');
    setError('');
    setResult(null);
    try {
      const res = await fetch(`${API_URL}/api/contract`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, analysis_type: 'full' }),
      });
      const json = await res.json();
      if (json.status === 'success') {
        setResult(json.data);
        setState('done');
      } else {
        throw new Error('Analysis failed');
      }
    } catch (e: any) {
      setError(e.message || 'Failed to analyze');
      setState('error');
    }
  };

  const reset = () => {
    setState('idle');
    setResult(null);
    setText('');
    setUploadedFile(null);
    setError('');
    setActiveResultTab(0);
  };

  const riskColor = (r: string) =>
    r === 'HIGH' ? '#f04444' : r === 'MEDIUM' ? '#f59e0b' : '#22c55e';
  const riskBg = (r: string) =>
    r === 'HIGH' ? 'rgba(240,68,68,0.06)' : r === 'MEDIUM' ? 'rgba(245,158,11,0.06)' : 'rgba(34,197,94,0.06)';
  const riskBorder = (r: string) =>
    r === 'HIGH' ? 'rgba(240,68,68,0.2)' : r === 'MEDIUM' ? 'rgba(245,158,11,0.2)' : 'rgba(34,197,94,0.2)';

  const sevColor = (s: string) =>
    s === 'HIGH' ? '#f04444' : s === 'MEDIUM' ? '#f59e0b' : '#22c55e';

  const statusColor = (s: string) =>
    s === 'COMPLIANT' ? '#22c55e' : s === 'NON_COMPLIANT' ? '#f04444' : '#f59e0b';

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#080a0f', color: '#e8eaf0', fontFamily: "'Inter',sans-serif", overflow: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-thumb{background:#2a3347;border-radius:4px}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        .nav-item:hover{background:#161b28 !important;color:#e8eaf0 !important}
        .tab-btn:hover{color:#e8eaf0 !important}
        .row-hover:hover{background:rgba(255,255,255,0.018) !important}
        textarea::placeholder{color:#3a4258}
        .upload-zone:hover{border-color:#2a3a55 !important;background:#0f1420 !important}
      `}</style>

      {/* SIDEBAR */}
      <div style={{ width: sidebarOpen ? '252px' : '0', minWidth: sidebarOpen ? '252px' : '0', background: '#0a0d14', borderRight: '1px solid #1a2030', display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', transition: 'width 0.25s, min-width 0.25s', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 14px', borderBottom: '1px solid #1a2030' }}>
          <a href="/landing" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 200, fontSize: '15px', color: '#e8eaf0', letterSpacing: '0.22em', display: 'flex', alignItems: 'center' }}>
              <span>Z</span>
              <span style={{ display: 'inline-block', width: '11px', height: '11px', border: '1.5px solid #7eb8f7', borderRadius: '50%', margin: '0 3px', boxShadow: '0 0 6px rgba(126,184,247,0.3)' }}></span>
              <span>LVYN</span>
            </div>
            <div style={{ width: '1px', height: '18px', background: '#1a2030' }}></div>
            <div style={{ fontSize: '9px', letterSpacing: '0.14em', color: '#3a4258', textTransform: 'uppercase', fontWeight: 400 }}>Legal Intelligence</div>
          </a>
          <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', color: '#4a5568', cursor: 'pointer', fontSize: '13px' }}>◀</button>
        </div>
        <div style={{ padding: '8px 8px 6px', borderBottom: '1px solid #1a2030' }}>
          {NAV.map(item => (
            <a key={item.href} href={item.href} className="nav-item" style={{ display: 'flex', alignItems: 'center', gap: '9px', padding: '7px 10px', borderRadius: '6px', color: item.active ? '#e8eaf0' : '#6b7280', background: item.active ? '#161b28' : 'transparent', fontSize: '13px', textDecoration: 'none', fontWeight: item.active ? 500 : 400, marginBottom: '1px', transition: 'all 0.15s' }}>
              <span style={{ fontSize: '13px' }}>{item.icon}</span><span>{item.label}</span>
            </a>
          ))}
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ borderTop: '1px solid #1a2030', padding: '12px' }}>
          <button onClick={() => window.location.href = '/upgrade'} style={{ width: '100%', padding: '9px', borderRadius: '7px', background: 'linear-gradient(135deg,#c9a84c,#e8c96d)', border: 'none', cursor: 'pointer', fontSize: '12.5px', fontWeight: 600, color: '#0d0a04', fontFamily: "'Inter',sans-serif" }}>👑 Upgrade to Pro</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px', marginTop: '10px' }}>
            <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'linear-gradient(135deg,#c9a84c,#e8c96d)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: '#0d0a04' }}>Z</div>
            <div><div style={{ fontSize: '12.5px', color: '#e8eaf0', fontWeight: 500 }}>Zolvyn User</div><div style={{ fontSize: '11px', color: '#3a4258' }}>Free plan</div></div>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', minWidth: 0 }}>

        {/* Topbar */}
        <div style={{ height: '52px', minHeight: '52px', background: '#0a0d14', borderBottom: '1px solid #1a2030', display: 'flex', alignItems: 'center', padding: '0 20px', gap: '12px' }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '16px', padding: '4px' }}>☰</button>
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#e8eaf0', letterSpacing: '0.01em' }}>Contract Analyzer</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '4px', background: '#111520', border: '1px solid #1a2030', fontSize: '11px', color: '#6b7280', fontFamily: "'JetBrains Mono',monospace" }}>
            <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#22c55e' }}></div>
            Indian Contract Act 1872
          </div>
          <div style={{ marginLeft: 'auto' }}>
            {result && (
              <button onClick={reset} style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid #1a2030', background: 'none', color: '#9aa3b2', fontSize: '12.5px', cursor: 'pointer', fontFamily: "'Inter',sans-serif", fontWeight: 500 }}>
                + New Analysis
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '28px 36px' }}>
          <div style={{ maxWidth: '880px', margin: '0 auto' }}>

            {/* ── IDLE / ERROR STATE ── */}
            {(state === 'idle' || state === 'error') && (
              <div style={{ animation: 'fadeUp 0.3s ease' }}>
                <div style={{ marginBottom: '24px' }}>
                  <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#e8eaf0', marginBottom: '4px', letterSpacing: '-0.02em' }}>
                    Contract Risk Analysis
                  </h1>
                  <p style={{ fontSize: '13.5px', color: '#6b7280', fontWeight: 400 }}>
                    Upload or paste any Indian contract for AI-powered risk analysis under Indian Contract Act 1872.
                  </p>
                </div>

                {error && (
                  <div style={{ padding: '11px 14px', borderRadius: '8px', background: 'rgba(240,68,68,0.06)', border: '1px solid rgba(240,68,68,0.2)', color: '#f87171', fontSize: '13px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>⚠</span> {error}
                  </div>
                )}

                {/* Tab Switcher */}
                <div style={{ display: 'flex', borderBottom: '1px solid #1a2030', marginBottom: '20px', gap: '0' }}>
                  {(['paste', 'upload'] as Tab[]).map(t => (
                    <button key={t} onClick={() => setTab(t)} className="tab-btn" style={{ padding: '9px 18px', fontSize: '13px', fontWeight: tab === t ? 500 : 400, color: tab === t ? '#e8eaf0' : '#6b7280', background: 'none', border: 'none', borderBottom: tab === t ? '2px solid #c9a84c' : '2px solid transparent', cursor: 'pointer', fontFamily: "'Inter',sans-serif", marginBottom: '-1px', transition: 'color 0.15s' }}>
                      {t === 'paste' ? '📋 Paste Text' : '📎 Upload File'}
                    </button>
                  ))}
                </div>

                {tab === 'paste' ? (
                  <div>
                    <textarea
                      value={text}
                      onChange={e => setText(e.target.value)}
                      placeholder="Paste your contract text here — NDA, rental agreement, employment contract, MOU, or any Indian legal document…"
                      style={{ width: '100%', minHeight: '280px', background: '#0d1018', border: '1px solid #1a2030', borderRadius: '10px', color: '#d1d5db', fontFamily: "'Inter',sans-serif", fontSize: '13.5px', fontWeight: 400, lineHeight: 1.75, padding: '16px 18px', resize: 'vertical', outline: 'none', transition: 'border-color 0.2s' }}
                      onFocus={e => e.target.style.borderColor = '#2a3a55'}
                      onBlur={e => e.target.style.borderColor = '#1a2030'}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                      <span style={{ fontSize: '11.5px', color: '#3a4258', fontFamily: "'JetBrains Mono',monospace" }}>
                        {text.length.toLocaleString()} characters
                        {text.length >= 50 && <span style={{ color: '#22c55e', marginLeft: '8px' }}>✓ Ready to analyze</span>}
                      </span>
                      <button
                        onClick={analyze}
                        disabled={text.trim().length < 50}
                        style={{ padding: '10px 28px', borderRadius: '8px', background: text.trim().length >= 50 ? 'linear-gradient(135deg,#c9a84c,#e8c96d)' : '#1a2030', border: 'none', color: text.trim().length >= 50 ? '#0d0a04' : '#3a4258', fontSize: '13.5px', fontWeight: 600, cursor: text.trim().length >= 50 ? 'pointer' : 'not-allowed', fontFamily: "'Inter',sans-serif', transition: 'opacity 0.2s" }}
                      >
                        Analyze Contract →
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <input ref={fileInputRef} type="file" accept=".pdf,.docx,.doc,.txt" onChange={handleFileInput} style={{ display: 'none' }} />
                    <div
                      className="upload-zone"
                      onDrop={handleDrop}
                      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onClick={() => fileInputRef.current?.click()}
                      style={{ border: `1.5px dashed ${dragOver ? '#4a6080' : '#1a2030'}`, borderRadius: '12px', background: dragOver ? '#0f1420' : '#0d1018', padding: '48px 32px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                      {uploadedFile ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '48px', height: '48px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>📄</div>
                          <div style={{ fontSize: '14px', fontWeight: 500, color: '#e8eaf0' }}>{uploadedFile.name}</div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>{uploadedFile.size}</div>
                          <div style={{ fontSize: '12px', color: '#22c55e' }}>✓ File ready</div>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '52px', height: '52px', background: '#111520', border: '1px solid #1a2030', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>📂</div>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: 500, color: '#e8eaf0', marginBottom: '4px' }}>Drop contract file here</div>
                            <div style={{ fontSize: '12.5px', color: '#6b7280' }}>or click to browse — PDF, DOCX, TXT up to 5MB</div>
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            {['PDF', 'DOCX', 'TXT'].map(f => (
                              <span key={f} style={{ padding: '3px 10px', borderRadius: '4px', border: '1px solid #1a2030', background: '#111520', fontSize: '10.5px', fontFamily: "'JetBrains Mono',monospace", color: '#6b7280', fontWeight: 500 }}>{f}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── ANALYZING STATE ── */}
            {state === 'analyzing' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 20px', gap: '16px', animation: 'fadeUp 0.3s ease' }}>
                <div style={{ width: '40px', height: '40px', border: '2px solid #1a2030', borderTop: '2px solid #c9a84c', borderRadius: '50%', animation: 'spin 0.9s linear infinite' }}></div>
                <div style={{ fontSize: '14px', fontWeight: 500, color: '#9aa3b2' }}>Analyzing contract…</div>
                <div style={{ fontSize: '12.5px', color: '#3a4258' }}>Running risk analysis under Indian Contract Act 1872</div>
              </div>
            )}

            {/* ── RESULTS STATE ── */}
            {state === 'done' && result && (
              <div style={{ animation: 'fadeUp 0.35s ease' }}>

                {/* ── RISK HEADER ── */}
                <div style={{ background: riskBg(result.overall_risk), border: `1px solid ${riskBorder(result.overall_risk)}`, borderRadius: '10px', padding: '20px 24px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ flexShrink: 0 }}>
                    <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6b7280', marginBottom: '6px' }}>Overall Risk</div>
                    <div style={{ padding: '5px 14px', borderRadius: '5px', background: `${riskColor(result.overall_risk)}15`, border: `1px solid ${riskColor(result.overall_risk)}30`, color: riskColor(result.overall_risk), fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', display: 'inline-block' }}>
                      {result.overall_risk}
                    </div>
                  </div>
                  <div style={{ width: '1px', height: '40px', background: '#1a2030', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13.5px', color: '#d1d5db', fontWeight: 400, lineHeight: 1.6 }}>{result.summary}</div>
                    <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                      <span style={{ fontSize: '11.5px', color: '#f04444' }}>● {result.red_flags?.length || 0} red flags</span>
                      <span style={{ fontSize: '11.5px', color: '#f59e0b' }}>● {result.missing_clauses?.length || 0} missing clauses</span>
                      <span style={{ fontSize: '11.5px', color: '#6b7280' }}>● {result.compliance?.length || 0} laws checked</span>
                    </div>
                  </div>
                  <div style={{ flexShrink: 0, textAlign: 'center', padding: '0 8px' }}>
                    <div style={{ fontSize: '36px', fontWeight: 700, color: riskColor(result.overall_risk), lineHeight: 1, fontFamily: "'JetBrains Mono',monospace" }}>{result.score}</div>
                    <div style={{ fontSize: '10px', color: '#3a4258', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: '3px' }}>Risk Score</div>
                  </div>
                </div>

                {/* ── STAT CARDS ── */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px', marginBottom: '20px' }}>
                  {[
                    { val: result.red_flags?.length || 0, label: 'Red Flags', color: '#f04444', bg: 'rgba(240,68,68,0.06)' },
                    { val: result.missing_clauses?.length || 0, label: 'Missing Clauses', color: '#f59e0b', bg: 'rgba(245,158,11,0.06)' },
                    { val: result.key_terms?.length || 0, label: 'Key Terms', color: '#7eb8f7', bg: 'rgba(126,184,247,0.06)' },
                    { val: result.recommendations?.length || 0, label: 'Recommendations', color: '#22c55e', bg: 'rgba(34,197,94,0.06)' },
                  ].map(stat => (
                    <div key={stat.label} style={{ background: stat.bg, border: `1px solid ${stat.color}20`, borderRadius: '8px', padding: '14px 16px' }}>
                      <div style={{ fontSize: '26px', fontWeight: 700, color: stat.color, fontFamily: "'JetBrains Mono',monospace", lineHeight: 1, marginBottom: '5px' }}>{stat.val}</div>
                      <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 500, letterSpacing: '0.03em' }}>{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* ── RESULT TABS ── */}
                <div style={{ display: 'flex', borderBottom: '1px solid #1a2030', marginBottom: '16px' }}>
                  {['Red Flags', 'Missing Clauses', 'Key Terms', 'Compliance', 'Recommendations'].map((t, i) => (
                    <button key={t} onClick={() => setActiveResultTab(i)} className="tab-btn" style={{ padding: '9px 16px', fontSize: '12.5px', background: 'none', border: 'none', borderBottom: activeResultTab === i ? '2px solid #c9a84c' : '2px solid transparent', color: activeResultTab === i ? '#e8c96d' : '#6b7280', cursor: 'pointer', fontFamily: "'Inter',sans-serif", fontWeight: activeResultTab === i ? 600 : 400, marginBottom: '-1px', transition: 'all 0.15s' }}>
                      {t}
                      {i === 0 && result.red_flags?.length > 0 && (
                        <span style={{ marginLeft: '6px', padding: '1px 6px', borderRadius: '3px', background: 'rgba(240,68,68,0.12)', color: '#f04444', fontSize: '10px', fontWeight: 700 }}>{result.red_flags.length}</span>
                      )}
                    </button>
                  ))}
                </div>

                {/* ── TAB CONTENT ── */}
                <div style={{ background: '#0d1018', border: '1px solid #1a2030', borderRadius: '10px', overflow: 'hidden' }}>

                  {/* Red Flags */}
                  {activeResultTab === 0 && (
                    result.red_flags?.length > 0 ? result.red_flags.map((flag, i) => (
                      <div key={i} className="row-hover" style={{ padding: '16px 20px', borderBottom: i < result.red_flags.length - 1 ? '1px solid #1a2030' : 'none', display: 'flex', gap: '14px', alignItems: 'flex-start', transition: 'background 0.15s' }}>
                        <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em', flexShrink: 0, marginTop: '3px', background: `${sevColor(flag.severity)}12`, color: sevColor(flag.severity), border: `1px solid ${sevColor(flag.severity)}25` }}>{flag.severity}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#e8eaf0', marginBottom: '4px' }}>{flag.clause}</div>
                          <div style={{ fontSize: '13px', color: '#9aa3b2', fontWeight: 400, lineHeight: 1.6, marginBottom: '8px' }}>{flag.issue}</div>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', padding: '8px 12px', background: 'rgba(34,197,94,0.04)', border: '1px solid rgba(34,197,94,0.12)', borderRadius: '6px' }}>
                            <span style={{ color: '#22c55e', fontSize: '11px', marginTop: '1px', flexShrink: 0 }}>→</span>
                            <span style={{ fontSize: '12.5px', color: '#86efac', fontWeight: 400, lineHeight: 1.55 }}>{flag.recommendation}</span>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div style={{ padding: '32px', textAlign: 'center', color: '#3a4258', fontSize: '13.5px' }}>No red flags identified.</div>
                    )
                  )}

                  {/* Missing Clauses */}
                  {activeResultTab === 1 && (
                    result.missing_clauses?.length > 0 ? result.missing_clauses.map((clause, i) => (
                      <div key={i} className="row-hover" style={{ padding: '13px 20px', borderBottom: i < result.missing_clauses.length - 1 ? '1px solid #1a2030' : 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ width: '18px', height: '18px', borderRadius: '4px', background: 'rgba(240,68,68,0.08)', border: '1px solid rgba(240,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#f04444', flexShrink: 0, fontWeight: 700 }}>✕</span>
                        <span style={{ fontSize: '13.5px', color: '#d1d5db', fontWeight: 400 }}>{clause}</span>
                        <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#3a4258', fontStyle: 'italic' }}>Missing</span>
                      </div>
                    )) : (
                      <div style={{ padding: '32px', textAlign: 'center', color: '#3a4258', fontSize: '13.5px' }}>No missing clauses identified.</div>
                    )
                  )}

                  {/* Key Terms */}
                  {activeResultTab === 2 && (
                    result.key_terms?.length > 0 ? result.key_terms.map((term, i) => (
                      <div key={i} className="row-hover" style={{ padding: '14px 20px', borderBottom: i < result.key_terms.length - 1 ? '1px solid #1a2030' : 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                          <span style={{ fontSize: '11px', fontFamily: "'JetBrains Mono',monospace", color: '#7eb8f7', fontWeight: 500, background: 'rgba(126,184,247,0.06)', border: '1px solid rgba(126,184,247,0.15)', padding: '2px 8px', borderRadius: '4px' }}>{term.term}</span>
                        </div>
                        <div style={{ fontSize: '13px', color: '#9aa3b2', fontWeight: 400, lineHeight: 1.65 }}>{term.explanation}</div>
                      </div>
                    )) : (
                      <div style={{ padding: '32px', textAlign: 'center', color: '#3a4258', fontSize: '13.5px' }}>No key terms identified.</div>
                    )
                  )}

                  {/* Compliance */}
                  {activeResultTab === 3 && (
                    result.compliance?.length > 0 ? result.compliance.map((item, i) => (
                      <div key={i} className="row-hover" style={{ padding: '14px 20px', borderBottom: i < result.compliance.length - 1 ? '1px solid #1a2030' : 'none', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                        <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.05em', flexShrink: 0, marginTop: '3px', background: `${statusColor(item.status)}10`, color: statusColor(item.status), border: `1px solid ${statusColor(item.status)}25`, whiteSpace: 'nowrap' }}>
                          {item.status.replace('_', ' ')}
                        </span>
                        <div>
                          <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#e8eaf0', marginBottom: '4px' }}>{item.law}</div>
                          <div style={{ fontSize: '13px', color: '#9aa3b2', fontWeight: 400, lineHeight: 1.6 }}>{item.note}</div>
                        </div>
                      </div>
                    )) : (
                      <div style={{ padding: '32px', textAlign: 'center', color: '#3a4258', fontSize: '13.5px' }}>No compliance data.</div>
                    )
                  )}

                  {/* Recommendations */}
                  {activeResultTab === 4 && (
                    result.recommendations?.length > 0 ? result.recommendations.map((rec, i) => (
                      <div key={i} className="row-hover" style={{ padding: '14px 20px', borderBottom: i < result.recommendations.length - 1 ? '1px solid #1a2030' : 'none', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                        <span style={{ width: '22px', height: '22px', borderRadius: '5px', background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', color: '#c9a84c', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>{i + 1}</span>
                        <span style={{ fontSize: '13.5px', color: '#d1d5db', fontWeight: 400, lineHeight: 1.65 }}>{rec}</span>
                      </div>
                    )) : (
                      <div style={{ padding: '32px', textAlign: 'center', color: '#3a4258', fontSize: '13.5px' }}>No recommendations.</div>
                    )
                  )}
                </div>

                {/* Footer note */}
                <div style={{ marginTop: '16px', padding: '10px 14px', borderRadius: '7px', background: '#0d1018', border: '1px solid #1a2030', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px' }}>⚠️</span>
                  <span style={{ fontSize: '11.5px', color: '#3a4258' }}>This analysis is for informational purposes only. Consult a qualified advocate before taking legal action.</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}