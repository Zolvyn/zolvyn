'use client';

import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const SIDEBAR_ITEMS = [
  { href: '/chat', icon: '💬', label: 'Legal Q&A' },
  { href: '/contract', icon: '📄', label: 'Contract Analyzer' },
  { href: '/generator', icon: '📝', label: 'Document Generator', active: true },
  { href: '/predictor', icon: '🔮', label: 'Case Predictor' },
  { href: '/bareacts', icon: '📚', label: 'Bare Acts' },
  { href: '/upgrade', icon: '⚡', label: 'Upgrade to Pro' },
];

const TEMPLATES = [
  { key: 'nda', icon: '🤝', label: 'NDA', desc: 'Non-Disclosure Agreement', fields: ['party_1_name', 'party_2_name', 'purpose', 'duration', 'governing_law'] },
  { key: 'rental', icon: '🏠', label: 'Rental Agreement', desc: 'Residential Lease', fields: ['landlord_name', 'tenant_name', 'property_address', 'monthly_rent', 'deposit', 'start_date', 'duration'] },
  { key: 'employment', icon: '💼', label: 'Employment Contract', desc: 'Job Agreement', fields: ['employer_name', 'employee_name', 'designation', 'salary', 'start_date', 'notice_period', 'work_location'] },
  { key: 'affidavit', icon: '📋', label: 'Affidavit', desc: 'Sworn Statement', fields: ['deponent_name', 'deponent_address', 'purpose', 'statement'] },
  { key: 'mou', icon: '📑', label: 'MOU', desc: 'Memorandum of Understanding', fields: ['party_1_name', 'party_2_name', 'purpose', 'obligations', 'duration'] },
  { key: 'legal_notice', icon: '⚠️', label: 'Legal Notice', desc: 'Formal Notice', fields: ['sender_name', 'recipient_name', 'recipient_address', 'subject', 'facts', 'demand', 'response_days'] },
  { key: 'poa', icon: '✍️', label: 'Power of Attorney', desc: 'Authorization Document', fields: ['principal_name', 'agent_name', 'purpose', 'powers', 'validity'] },
  { key: 'fir_draft', icon: '🚨', label: 'FIR Draft', desc: 'First Information Report', fields: ['complainant_name', 'complainant_address', 'accused_name', 'incident_date', 'incident_location', 'incident_description', 'sections'] },
  { key: 'consumer_complaint', icon: '🛒', label: 'Consumer Complaint', desc: 'Consumer Forum', fields: ['complainant_name', 'opposite_party', 'product_service', 'issue', 'relief_sought', 'amount'] },
  { key: 'bail_application', icon: '⚖️', label: 'Bail Application', desc: 'Court Application', fields: ['accused_name', 'fir_number', 'police_station', 'offence', 'grounds', 'surety_name'] },
  { key: 'divorce_petition', icon: '💔', label: 'Divorce Petition', desc: 'Family Court', fields: ['petitioner_name', 'respondent_name', 'marriage_date', 'marriage_place', 'grounds', 'children'] },
  { key: 'partnership_deed', icon: '🤝', label: 'Partnership Deed', desc: 'Business Partnership', fields: ['firm_name', 'partner_1', 'partner_2', 'business_nature', 'capital', 'profit_ratio', 'start_date'] },
];

const FIELD_LABELS: Record<string, string> = {
  party_1_name: 'Party 1 Name', party_2_name: 'Party 2 Name', purpose: 'Purpose',
  duration: 'Duration', governing_law: 'Governing Law State', landlord_name: 'Landlord Name',
  tenant_name: 'Tenant Name', property_address: 'Property Address', monthly_rent: 'Monthly Rent (₹)',
  deposit: 'Security Deposit (₹)', start_date: 'Start Date', employer_name: 'Employer Name',
  employee_name: 'Employee Name', designation: 'Designation/Role', salary: 'Monthly Salary (₹)',
  notice_period: 'Notice Period', work_location: 'Work Location', deponent_name: 'Deponent Name',
  deponent_address: 'Deponent Address', statement: 'Statement/Facts', obligations: 'Key Obligations',
  sender_name: 'Sender Name', recipient_name: 'Recipient Name', recipient_address: 'Recipient Address',
  subject: 'Subject', facts: 'Facts', demand: 'Demand/Relief', response_days: 'Response Days',
  principal_name: 'Principal Name', agent_name: 'Agent/Attorney Name', powers: 'Powers Granted',
  validity: 'Validity Period', complainant_name: 'Complainant Name', complainant_address: 'Complainant Address',
  accused_name: 'Accused Name / Opposite Party', incident_date: 'Date of Incident',
  incident_location: 'Location of Incident', incident_description: 'Description of Incident',
  sections: 'Applicable IPC/BNS Sections', opposite_party: 'Opposite Party Name',
  product_service: 'Product / Service', issue: 'Issue / Complaint', relief_sought: 'Relief Sought',
  amount: 'Amount Involved (₹)', fir_number: 'FIR Number', police_station: 'Police Station',
  offence: 'Offence Charged', grounds: 'Grounds', surety_name: 'Surety Name',
  petitioner_name: 'Petitioner Name', respondent_name: 'Respondent Name',
  marriage_date: 'Date of Marriage', marriage_place: 'Place of Marriage', children: 'Children (if any)',
  firm_name: 'Firm / Partnership Name', partner_1: 'Partner 1 Name', partner_2: 'Partner 2 Name',
  business_nature: 'Nature of Business', capital: 'Total Capital (₹)', profit_ratio: 'Profit/Loss Ratio',
};

export default function GeneratorPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<typeof TEMPLATES[0] | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  const selectTemplate = (t: typeof TEMPLATES[0]) => {
    setSelectedTemplate(t);
    setFields({});
    setResult('');
    setError('');
  };

  const generate = async () => {
    if (!selectedTemplate) return;
    setLoading(true); setError(''); setResult('');
    try {
      const res = await fetch(`${API_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template_type: selectedTemplate.key, fields, language: 'English' }),
      });
      const json = await res.json();
      if (json.status === 'success') setResult(json.document);
      else setError('Generation failed. Try again.');
    } catch {
      setError('Cannot connect to backend. Make sure it is running on port 8000.');
    }
    setLoading(false);
  };

  const downloadDoc = () => {
    const blob = new Blob([result], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedTemplate?.key || 'document'}.txt`;
    a.click();
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
          <span style={{ fontSize: '15px', fontWeight: 500 }}>Document Generator</span>
          {selectedTemplate && (
            <button onClick={() => { setSelectedTemplate(null); setResult(''); }} style={{ marginLeft: 'auto', padding: '5px 14px', background: 'none', border: '1px solid #2a3347', borderRadius: '7px', color: '#9aa3b2', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit' }}>← All Templates</button>
          )}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '32px 40px' }}>
          <div style={{ maxWidth: '920px', margin: '0 auto' }}>

            {!selectedTemplate ? (
              <>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', fontWeight: 300, fontStyle: 'italic', marginBottom: '6px' }}>
                  Generate <span style={{ color: '#e8c96d' }}>legal documents</span>
                </div>
                <div style={{ fontSize: '14px', color: '#9aa3b2', fontWeight: 300, marginBottom: '28px' }}>Choose a template to generate a complete, court-ready Indian legal document.</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  {TEMPLATES.map(t => (
                    <div key={t.key} onClick={() => selectTemplate(t)} style={{ background: '#0d1018', border: '1px solid #1e2535', borderRadius: '12px', padding: '20px', cursor: 'pointer', transition: 'all 0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.3)'; e.currentTarget.style.background = 'rgba(201,168,76,0.03)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e2535'; e.currentTarget.style.background = '#0d1018'; }}>
                      <div style={{ fontSize: '24px', marginBottom: '10px' }}>{t.icon}</div>
                      <div style={{ fontSize: '14px', fontWeight: 500, color: '#e8eaf0', marginBottom: '4px' }}>{t.label}</div>
                      <div style={{ fontSize: '12px', color: '#4a5568', fontWeight: 300 }}>{t.desc}</div>
                    </div>
                  ))}
                </div>
              </>
            ) : !result ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                  <span style={{ fontSize: '28px' }}>{selectedTemplate.icon}</span>
                  <div>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '24px', fontWeight: 300 }}>{selectedTemplate.label}</div>
                    <div style={{ fontSize: '13px', color: '#4a5568', fontWeight: 300 }}>{selectedTemplate.desc}</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '24px' }}>
                  {selectedTemplate.fields.map(field => (
                    <div key={field}>
                      <div style={{ fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#4a5568', marginBottom: '6px' }}>{FIELD_LABELS[field] || field}</div>
                      {field === 'statement' || field === 'facts' || field === 'incident_description' || field === 'obligations' || field === 'grounds' ? (
                        <textarea value={fields[field] || ''} onChange={e => setFields(p => ({ ...p, [field]: e.target.value }))} rows={3} style={{ width: '100%', background: '#0d1018', border: '1px solid #2a3347', borderRadius: '8px', padding: '10px 12px', fontSize: '13.5px', color: '#e8eaf0', fontFamily: 'inherit', fontWeight: 300, resize: 'vertical', outline: 'none' }} />
                      ) : (
                        <input type="text" value={fields[field] || ''} onChange={e => setFields(p => ({ ...p, [field]: e.target.value }))} style={{ width: '100%', background: '#0d1018', border: '1px solid #2a3347', borderRadius: '8px', padding: '10px 12px', fontSize: '13.5px', color: '#e8eaf0', fontFamily: 'inherit', fontWeight: 300, outline: 'none' }} />
                      )}
                    </div>
                  ))}
                </div>

                {error && <div style={{ background: 'rgba(224,82,82,0.08)', border: '1px solid rgba(224,82,82,0.2)', borderRadius: '10px', padding: '12px', color: '#e05252', fontSize: '13px', marginBottom: '16px' }}>{error}</div>}

                <button onClick={generate} disabled={loading} style={{ padding: '13px 36px', background: 'linear-gradient(135deg, #c9a84c, #e8c96d)', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 600, color: '#0d0a04', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: loading ? 0.6 : 1 }}>
                  {loading ? 'Generating document…' : `Generate ${selectedTemplate.label} →`}
                </button>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', fontWeight: 300 }}>Generated: <em style={{ color: '#e8c96d' }}>{selectedTemplate.label}</em></div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => setResult('')} style={{ padding: '8px 16px', background: 'none', border: '1px solid #2a3347', borderRadius: '8px', color: '#9aa3b2', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>Edit Fields</button>
                    <button onClick={downloadDoc} style={{ padding: '8px 20px', background: 'linear-gradient(135deg, #c9a84c, #e8c96d)', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: '#0d0a04', cursor: 'pointer', fontFamily: 'inherit' }}>⬇ Download</button>
                  </div>
                </div>
                <div style={{ background: '#ffffff', color: '#1a1a1a', borderRadius: '12px', padding: '48px', fontFamily: 'Georgia, serif', fontSize: '14px', lineHeight: 1.8, whiteSpace: 'pre-wrap' as const, boxShadow: '0 4px 32px rgba(0,0,0,0.4)' }}>
                  {result}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Outfit:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #1e2535; border-radius: 4px; }
        input::placeholder, textarea::placeholder { color: #4a5568; }
        a { color: inherit; }
      `}</style>
    </div>
  );
}