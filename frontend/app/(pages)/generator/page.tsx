'use client';
import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const NAV = [
  { icon: '💬', label: 'Legal Q&A', href: '/chat' },
  { icon: '📄', label: 'Contract Analyzer', href: '/contract' },
  { icon: '📝', label: 'Document Generator', href: '/generator', active: true },
  { icon: '🔮', label: 'Case Predictor', href: '/predictor' },
  { icon: '⚖️', label: 'Bare Acts', href: '/bareacts' },
];

const TEMPLATES = [
  { key: 'nda', icon: '🤝', label: 'NDA', desc: 'Non-Disclosure Agreement', fields: ['Party A Name', 'Party B Name', 'Purpose', 'Duration', 'Governing State'] },
  { key: 'rental', icon: '🏠', label: 'Rental Agreement', desc: 'Residential Tenancy', fields: ['Landlord Name', 'Tenant Name', 'Property Address', 'Monthly Rent', 'Security Deposit', 'Duration', 'State'] },
  { key: 'employment', icon: '💼', label: 'Employment Contract', desc: 'Job Agreement', fields: ['Employer Name', 'Employee Name', 'Designation', 'Monthly Salary', 'Joining Date', 'Notice Period'] },
  { key: 'affidavit', icon: '📋', label: 'Affidavit', desc: 'Sworn Statement', fields: ['Deponent Name', 'Age', 'Address', 'Purpose', 'State'] },
  { key: 'mou', icon: '🤲', label: 'MOU', desc: 'Memorandum of Understanding', fields: ['Party A', 'Party B', 'Purpose', 'Duration', 'Key Terms'] },
  { key: 'legal_notice', icon: '⚠️', label: 'Legal Notice', desc: 'Formal Notice', fields: ['Sender Name', 'Recipient Name', 'Subject', 'Grievance', 'Demand', 'Reply Deadline'] },
  { key: 'poa', icon: '✍️', label: 'Power of Attorney', desc: 'Legal Authority', fields: ['Principal Name', 'Agent Name', 'Scope', 'Duration', 'State'] },
  { key: 'fir_draft', icon: '🚨', label: 'FIR Draft', desc: 'Police Complaint', fields: ['Complainant Name', 'Incident Date', 'Incident Location', 'Description', 'Accused (if known)', 'Police Station'] },
  { key: 'consumer_complaint', icon: '🛡️', label: 'Consumer Complaint', desc: 'Consumer Forum', fields: ['Complainant Name', 'Opposite Party', 'Product/Service', 'Issue', 'Amount Involved', 'Relief Sought'] },
  { key: 'bail_application', icon: '⚖️', label: 'Bail Application', desc: 'Court Application', fields: ['Accused Name', 'FIR Number', 'Police Station', 'Offence', 'Court Name', 'Grounds'] },
  { key: 'divorce_petition', icon: '🏛️', label: 'Divorce Petition', desc: 'Family Court', fields: ['Petitioner Name', 'Respondent Name', 'Marriage Date', 'Grounds', 'Court District'] },
  { key: 'partnership_deed', icon: '🤝', label: 'Partnership Deed', desc: 'Business Partnership', fields: ['Partner 1', 'Partner 2', 'Business Name', 'Capital Contribution', 'Profit Sharing', 'Duration'] },
];

type State = 'select' | 'form' | 'generating' | 'done';

export default function GeneratorPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [state, setState] = useState<State>('select');
  const [selected, setSelected] = useState<typeof TEMPLATES[0] | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [document, setDocument] = useState('');
  const [language, setLanguage] = useState('English');

  const selectTemplate = (t: typeof TEMPLATES[0]) => {
    setSelected(t);
    setFields({});
    setState('form');
  };

  const generate = async () => {
    if (!selected) return;
    setState('generating');
    try {
      const res = await fetch(`${API_URL}/api/generate`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template_type: selected.key, fields, language }),
      });
      const json = await res.json();
      if (json.status === 'success') { setDocument(json.document); setState('done'); }
      else { setState('form'); }
    } catch { setState('form'); }
  };

  const copyToClipboard = () => { navigator.clipboard.writeText(document); };

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
        .tmpl-card:hover{border-color:#2a3347 !important;background:#161b28 !important;transform:translateY(-2px)}
        .nav-item:hover{background:#161b28 !important;color:#e8eaf0 !important}
        input::placeholder,textarea::placeholder{color:#4a5568}
        input,textarea{outline:none}
        input:focus,textarea:focus{border-color:#2a3347 !important}
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
          <span style={{ fontSize: '15px', fontWeight: 500, color: '#e8eaf0' }}>Document Generator</span>
          {state !== 'select' && (
            <button onClick={() => { setState('select'); setSelected(null); setDocument(''); }} style={{ marginLeft: 'auto', padding: '6px 14px', borderRadius: '7px', border: '1px solid #1e2535', background: 'none', color: '#9aa3b2', fontSize: '13px', cursor: 'pointer', fontFamily: "'Outfit',sans-serif" }}>← Back</button>
          )}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '32px 40px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>

            {state === 'select' && (
              <>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '30px', fontWeight: 300, fontStyle: 'italic', color: '#e8eaf0', marginBottom: '6px' }}>
                  Generate any <span style={{ background: 'linear-gradient(135deg,#c9a84c,#e8c96d)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>legal document</span>
                </div>
                <p style={{ fontSize: '14px', color: '#9aa3b2', fontWeight: 300, marginBottom: '32px' }}>Court-ready Indian legal documents in seconds. Choose a template to begin.</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '14px' }}>
                  {TEMPLATES.map(t => (
                    <div key={t.key} onClick={() => selectTemplate(t)} className="tmpl-card" style={{ background: '#111520', border: '1px solid #1e2535', borderRadius: '12px', padding: '20px', cursor: 'pointer', transition: 'all 0.2s' }}>
                      <div style={{ fontSize: '28px', marginBottom: '12px' }}>{t.icon}</div>
                      <div style={{ fontSize: '14px', fontWeight: 500, color: '#e8eaf0', marginBottom: '4px' }}>{t.label}</div>
                      <div style={{ fontSize: '12px', color: '#9aa3b2', fontWeight: 300 }}>{t.desc}</div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {state === 'form' && selected && (
              <div style={{ animation: 'fadeUp 0.35s ease' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                  <span style={{ fontSize: '32px' }}>{selected.icon}</span>
                  <div>
                    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '26px', fontWeight: 300, fontStyle: 'italic', color: '#e8eaf0' }}>{selected.label}</div>
                    <div style={{ fontSize: '13px', color: '#9aa3b2', fontWeight: 300 }}>{selected.desc}</div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  {selected.fields.map(field => (
                    <div key={field}>
                      <label style={{ display: 'block', fontSize: '12px', color: '#9aa3b2', letterSpacing: '0.5px', marginBottom: '7px', fontWeight: 400 }}>{field}</label>
                      <input value={fields[field] || ''} onChange={e => setFields(prev => ({ ...prev, [field]: e.target.value }))} placeholder={`Enter ${field.toLowerCase()}…`} style={{ width: '100%', background: '#111520', border: '1.5px solid #1e2535', borderRadius: '9px', color: '#e8eaf0', fontFamily: "'Outfit',sans-serif", fontSize: '14px', fontWeight: 300, padding: '10px 14px', transition: 'border-color 0.15s' }} />
                    </div>
                  ))}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#9aa3b2', letterSpacing: '0.5px', marginBottom: '7px' }}>Language</label>
                    <select value={language} onChange={e => setLanguage(e.target.value)} style={{ width: '100%', background: '#111520', border: '1.5px solid #1e2535', borderRadius: '9px', color: '#e8eaf0', fontFamily: "'Outfit',sans-serif", fontSize: '14px', padding: '10px 14px', cursor: 'pointer', outline: 'none' }}>
                      <option>English</option><option>Hindi</option><option>Marathi</option><option>Gujarati</option><option>Tamil</option><option>Telugu</option>
                    </select>
                  </div>
                </div>
                <button onClick={generate} style={{ width: '100%', padding: '13px', borderRadius: '10px', background: 'linear-gradient(135deg,#c9a84c,#e8c96d)', border: 'none', color: '#000', fontSize: '14.5px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Outfit',sans-serif", letterSpacing: '0.3px' }}>
                  📝 Generate {selected.label}
                </button>
              </div>
            )}

            {state === 'generating' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', gap: '22px' }}>
                <div style={{ position: 'relative', width: '70px', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1.5px solid rgba(201,168,76,0.2)', animation: 'ring-pulse 1.8s ease-in-out infinite' }}></div>
                  <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1.5px solid rgba(201,168,76,0.2)', animation: 'ring-pulse 1.8s ease-in-out 0.6s infinite' }}></div>
                  <span style={{ fontSize: '30px', animation: 'gavel-swing 1.2s ease-in-out infinite alternate', transformOrigin: 'bottom right', display: 'inline-block' }}>📝</span>
                </div>
                <div style={{ fontSize: '14px', color: '#9aa3b2', fontWeight: 300 }}>Drafting your {selected?.label}…</div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {[0, 1, 2].map(i => <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#c9a84c', animation: `dot-bounce 1.2s ease-in-out ${i * 0.2}s infinite` }}></div>)}
                </div>
              </div>
            )}

            {state === 'done' && document && (
              <div style={{ animation: 'fadeUp 0.4s ease' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <div>
                    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '26px', fontWeight: 300, fontStyle: 'italic', color: '#e8eaf0' }}>Document Ready</div>
                    <div style={{ fontSize: '13px', color: '#9aa3b2', fontWeight: 300 }}>Review and download your {selected?.label}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={copyToClipboard} style={{ padding: '8px 18px', borderRadius: '8px', border: '1px solid #1e2535', background: 'none', color: '#9aa3b2', fontSize: '13px', cursor: 'pointer', fontFamily: "'Outfit',sans-serif" }}>📋 Copy</button>
                    <button onClick={() => { setState('select'); setSelected(null); setDocument(''); }} style={{ padding: '8px 18px', borderRadius: '8px', background: 'linear-gradient(135deg,#c9a84c,#e8c96d)', border: 'none', color: '#000', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Outfit',sans-serif" }}>New Document</button>
                  </div>
                </div>
                <div style={{ background: '#111520', border: '1px solid #1e2535', borderRadius: '14px', padding: '32px', fontFamily: "'Outfit',sans-serif", fontSize: '14px', lineHeight: 1.8, color: '#e8eaf0', whiteSpace: 'pre-wrap', fontWeight: 300 }}>
                  {document}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}