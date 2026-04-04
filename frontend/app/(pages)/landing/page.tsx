'use client';
import { useState, useEffect } from 'react';
import { getStoredUser, createUser, storeUser, trackPageVisit } from '../../lib/supabase';

const MARQUEE_ITEMS = ['Bharatiya Nyaya Sanhita 2023', 'Indian Penal Code', 'Constitution of India', 'CrPC / BNSS', 'Consumer Protection Act', 'Transfer of Property Act', 'Contract Act 1872', 'RTI Act', 'Labour Laws', 'IT Act 2000', 'POCSO Act', 'Motor Vehicles Act', 'RERA', 'Negotiable Instruments Act'];

const FEATURES = [
  { icon: '💬', title: 'Legal Q&A', desc: 'Ask any question about Indian law in plain language. Get expert answers with exact section references instantly.', tags: ['Section references', 'Live streaming', 'Source documents'], href: '/chat' },
  { icon: '📄', title: 'Contract Analyzer', desc: 'Upload any contract for a complete clause-by-clause breakdown with risk levels and recommendations under Indian law.', tags: ['Risk scoring', 'Clause breakdown', 'PDF report'], href: '/contract' },
  { icon: '📝', title: 'Document Generator', desc: 'Generate court-ready legal documents — affidavits, FIRs, rental agreements, legal notices, and more.', tags: ['Court-ready', '12+ types', 'Proper format'], href: '/generator' },
  { icon: '🔮', title: 'Case Predictor', desc: 'Describe your situation and get win probability, real precedent cases, applicable sections, and strategy.', tags: ['Win probability', 'Real precedents', 'Full strategy'], href: '/predictor' },
];

const STEPS = [
  { num: '01', title: 'Ask or upload', desc: 'Type your legal question or upload a contract, FIR, or court document directly.' },
  { num: '02', title: 'AI reads the law', desc: 'Zolvyn searches across all Indian laws — BNS, IPC, Constitution, BNSS — finding exactly what applies.' },
  { num: '03', title: 'Expert answer arrives', desc: 'A structured, referenced answer appears with exact law sections and a confidence score.' },
  { num: '04', title: 'Take action', desc: 'Download your analysis, generate a ready-to-file document, or ask follow-up questions.' },
];

const FAQ = [
  { q: 'Which Indian laws does Zolvyn cover?', a: 'Zolvyn covers 50+ Indian laws including BNS 2023, BNSS 2023, Constitution of India, IPC 1860, CrPC, Consumer Protection Act, RERA, RTI Act, Labour Laws, IT Act 2000, POCSO Act, Motor Vehicles Act, and more.' },
  { q: 'Is my personal data safe with Zolvyn?', a: 'Yes. Your conversations and documents are encrypted and never sold or shared. We do not use your data to train AI models.' },
  { q: 'Can I use Zolvyn documents for real court filings?', a: 'Yes — Zolvyn generates properly formatted documents with correct Indian legal headers and structure. For high-stakes filings, we recommend a lawyer do a final review.' },
  { q: 'What payment methods are accepted?', a: 'All payments are processed via Razorpay — UPI, debit card, credit card, or net banking. No international cards required.' },
  { q: 'Can I try before I pay?', a: 'Absolutely. The Free plan gives you 5 queries per day with no time limit — use it as long as you like before upgrading.' },
];

// Name Popup Component
function NamePopup({ onComplete }: { onComplete: (name: string) => void }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const trimmed = name.trim() || 'User';
    setLoading(true);
    const user = await createUser(trimmed);
    if (!user) storeUser({ id: crypto.randomUUID(), name: trimmed });
    setLoading(false);
    onComplete(trimmed);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(8,10,15,0.9)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#0d1018', border: '1px solid #2a3347', borderRadius: '20px', padding: '48px 44px', width: '100%', maxWidth: '420px', boxShadow: '0 32px 80px rgba(0,0,0,0.6)', position: 'relative', animation: 'slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1)' }}>
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '200px', height: '1px', background: 'linear-gradient(90deg,transparent,rgba(201,168,76,0.5),transparent)' }}></div>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 200, fontSize: '20px', letterSpacing: '0.26em', color: '#e8eaf0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
            <span style={{ letterSpacing: '0.18em' }}>Z</span>
            <span style={{ display: 'inline-block', width: '14px', height: '14px', border: '1.5px solid #7eb8f7', borderRadius: '50%', margin: '0 3px', boxShadow: '0 0 8px rgba(126,184,247,0.3)' }}></span>
            <span style={{ letterSpacing: '0.18em' }}>LVYN</span>
          </div>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '26px', fontWeight: 300, color: '#e8eaf0', marginBottom: '8px' }}>
            Welcome to <em style={{ color: '#e8c96d', fontStyle: 'italic' }}>Zolvyn AI</em>
          </div>
          <p style={{ fontSize: '13.5px', color: '#7a8499', fontWeight: 300, lineHeight: 1.65 }}>India's legal intelligence platform. What should we call you?</p>
        </div>
        <input
          value={name} onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          placeholder="Enter your name…" autoFocus
          style={{ width: '100%', background: '#111520', border: '1.5px solid #1e2535', borderRadius: '11px', color: '#e8eaf0', fontFamily: "'Outfit',sans-serif", fontSize: '15px', fontWeight: 300, padding: '13px 16px', outline: 'none', marginBottom: '12px' }}
        />
        <button onClick={handleSubmit} disabled={loading}
          style={{ width: '100%', padding: '13px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg,#c9a84c,#e8c96d)', color: '#0d0a00', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Outfit',sans-serif", marginBottom: '12px' }}>
          {loading ? 'Setting up…' : 'Start for free →'}
        </button>
        <div style={{ textAlign: 'center' }}>
          <button onClick={() => { storeUser({ id: crypto.randomUUID(), name: 'User' }); onComplete('User'); }}
            style={{ background: 'none', border: 'none', color: '#4a5568', fontSize: '12.5px', cursor: 'pointer', fontFamily: "'Outfit',sans-serif" }}>
            Skip for now
          </button>
        </div>
        <div style={{ marginTop: '18px', paddingTop: '14px', borderTop: '1px solid #1e2535', fontSize: '11px', color: '#3a4258', textAlign: 'center' }}>
          No account needed · No password · No spam
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [yearly, setYearly] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const user = getStoredUser();
    if (user) {
      setUserName(user.name);
      trackPageVisit('landing');
    } else {
      setTimeout(() => setShowPopup(true), 1000);
    }
  }, []);

  const handleNameComplete = (name: string) => {
    setUserName(name);
    setShowPopup(false);
    trackPageVisit('landing');
  };

  const prices = {
    std: yearly ? { price: '299', period: '/year' } : { price: '49', period: '/month' },
    pro: yearly ? { price: '899', period: '/year' } : { price: '299', period: '/month' },
  };

  return (
    <div style={{ background: '#080a0f', color: '#e8eaf0', fontFamily: "'Outfit',sans-serif", overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,600&family=Outfit:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-thumb{background:#2a3347;border-radius:2px}
        @keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.7)}}
        @keyframes slideUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        .nav-link:hover{color:#e8eaf0 !important}
        .feat-card:hover{background:#111520 !important;cursor:pointer}
        .plan-card:hover{transform:translateY(-4px)}
        .faq-btn:hover{color:#e8eaf0 !important}
        .footer-link:hover{color:#9aa3b2 !important}
        input::placeholder{color:#4a5568}
        input{outline:none}
      `}</style>

      {showPopup && <NamePopup onComplete={handleNameComplete} />}

      {/* NAV */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, height: '68px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 60px', background: 'rgba(8,10,15,0.88)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(30,37,53,0.6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 300, fontSize: '1.05rem', letterSpacing: '0.26em', color: '#fff', display: 'flex', alignItems: 'center' }}>
            <span style={{ letterSpacing: '0.18em' }}>Z</span>
            <span style={{ display: 'inline-block', width: '13px', height: '13px', border: '1.5px solid #7eb8f7', borderRadius: '50%', margin: '0 3px', boxShadow: '0 0 8px rgba(126,184,247,0.3)' }}></span>
            <span style={{ letterSpacing: '0.18em', paddingRight: '0.18em' }}>LVYN</span>
          </div>
          <div style={{ width: '1px', height: '18px', background: '#2a3347' }}></div>
          <div style={{ fontSize: '9px', letterSpacing: '0.18em', color: '#3a4258', textTransform: 'uppercase', fontWeight: 300 }}>Legal Intelligence</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          {[['Features', '#features'], ['How it works', '#how'], ['Pricing', '#pricing'], ['FAQ', '#faq']].map(([l, h]) => (
            <a key={l} href={h} className="nav-link" style={{ fontSize: '0.8rem', color: '#7a8499', textDecoration: 'none', transition: 'color .2s' }}>{l}</a>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <a href="/chat" style={{ padding: '8px 20px', border: '1px solid #252d40', background: 'transparent', color: '#7a8499', borderRadius: '7px', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'none', fontFamily: "'Outfit',sans-serif" }}>
            {userName ? `Hi, ${userName}` : 'Sign in'}
          </a>
          <a href="/chat" style={{ padding: '8px 22px', background: 'linear-gradient(135deg,#c9a84c,#e8c96d)', border: 'none', color: '#0d0a00', borderRadius: '7px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', textDecoration: 'none', fontFamily: "'Outfit',sans-serif" }}>Try free →</a>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '120px 60px 80px', position: 'relative', overflow: 'hidden', textAlign: 'center' }}>
        <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: '700px', height: '700px', borderRadius: '50%', background: 'radial-gradient(ellipse,rgba(126,184,247,0.07) 0%,transparent 70%)', pointerEvents: 'none' }}></div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 14px', borderRadius: '20px', border: '1px solid rgba(126,184,247,0.2)', background: 'rgba(126,184,247,0.06)', fontSize: '0.7rem', letterSpacing: '0.12em', color: '#7eb8f7', textTransform: 'uppercase', fontWeight: 500, marginBottom: '32px' }}>
          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#7eb8f7', animation: 'pulse 2s ease infinite', display: 'inline-block' }}></span>
          India's most advanced legal AI platform
        </div>
        <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(3rem,7vw,6rem)', fontWeight: 300, lineHeight: 1.05, color: '#fff', marginBottom: '12px' }}>
          Know Your Rights.<br /><em style={{ fontStyle: 'italic', color: '#7eb8f7' }}>Instantly.</em>
        </h1>
        <p style={{ fontSize: '1.05rem', fontWeight: 300, color: '#7a8499', maxWidth: '560px', lineHeight: 1.75, margin: '0 auto 48px' }}>
          <strong style={{ color: '#e8eaf0', fontWeight: 400 }}>Zolvyn</strong> gives every Indian access to expert legal intelligence — understand any law, analyze contracts, generate real court-ready documents, and get clarity on your case outcomes.
        </p>
        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '64px' }}>
          <a href="/chat" style={{ padding: '14px 36px', background: 'linear-gradient(135deg,#c9a84c,#e8c96d)', border: 'none', color: '#0d0a00', borderRadius: '9px', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', fontFamily: "'Outfit',sans-serif" }}>Start for free →</a>
          <a href="#how" style={{ padding: '14px 36px', background: 'transparent', border: '1px solid #252d40', color: '#7a8499', borderRadius: '9px', fontSize: '0.95rem', cursor: 'pointer', textDecoration: 'none', fontFamily: "'Outfit',sans-serif" }}>▶ See how it works</a>
        </div>
        <div style={{ display: 'flex', gap: '48px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {[['50+', 'Indian laws covered'], ['12+', 'Document templates'], ['100%', 'Private & secure'], ['₹0', 'To start today']].map(([num, label]) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '2rem', fontWeight: 600, color: '#fff', lineHeight: 1 }}>{num}</div>
              <div style={{ fontSize: '0.72rem', color: '#3a4258', letterSpacing: '0.08em', marginTop: '4px' }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* MARQUEE */}
      <div style={{ padding: '20px 0', borderTop: '1px solid #1e2535', borderBottom: '1px solid #1e2535', overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: '48px', whiteSpace: 'nowrap', animation: 'marquee 25s linear infinite' }}>
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} style={{ fontSize: '0.72rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#3a4258', flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#7eb8f7', display: 'inline-block' }}></span>
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <section id="features" style={{ padding: '100px 60px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ fontSize: '0.68rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#7eb8f7', fontWeight: 500, marginBottom: '16px' }}>What Zolvyn does</div>
        <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(2rem,4vw,3.2rem)', fontWeight: 300, color: '#fff', lineHeight: 1.15, marginBottom: '16px' }}>One platform. <em style={{ fontStyle: 'italic', color: '#7eb8f7' }}>Every legal need.</em></h2>
        <p style={{ fontSize: '0.95rem', color: '#7a8499', maxWidth: '500px', lineHeight: 1.75, fontWeight: 300, marginBottom: '64px' }}>Built for citizens, lawyers, law students, and professionals across India.</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px', border: '1px solid #1e2535', borderRadius: '16px', overflow: 'hidden' }}>
          {FEATURES.map((f, i) => (
            <a key={f.title} href={f.href} className="feat-card" style={{ padding: '40px', background: '#0d1018', transition: 'background .25s', borderRight: i % 2 === 0 ? '1px solid #1e2535' : 'none', borderBottom: i < 2 ? '1px solid #1e2535' : 'none', textDecoration: 'none', display: 'block' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(126,184,247,0.08)', border: '1px solid rgba(126,184,247,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', fontSize: '20px' }}>{f.icon}</div>
              <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.4rem', fontWeight: 500, color: '#fff', marginBottom: '10px' }}>{f.title}</h3>
              <p style={{ fontSize: '0.85rem', color: '#7a8499', lineHeight: 1.75, fontWeight: 300, marginBottom: '16px' }}>{f.desc}</p>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {f.tags.map(tag => <span key={tag} style={{ padding: '3px 10px', borderRadius: '4px', fontSize: '0.68rem', fontFamily: "'JetBrains Mono',monospace", background: 'rgba(126,184,247,0.08)', color: '#7eb8f7', border: '1px solid rgba(126,184,247,0.12)' }}>{tag}</span>)}
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* HOW */}
      <section id="how" style={{ padding: '100px 60px', background: '#0d1018', borderTop: '1px solid #1e2535', borderBottom: '1px solid #1e2535' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ fontSize: '0.68rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#7eb8f7', fontWeight: 500, marginBottom: '16px' }}>Simple process</div>
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(2rem,4vw,3.2rem)', fontWeight: 300, color: '#fff', marginBottom: '64px' }}>From question to <em style={{ fontStyle: 'italic', color: '#7eb8f7' }}>clarity in seconds.</em></h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', border: '1px solid #1e2535', borderRadius: '14px', overflow: 'hidden' }}>
            {STEPS.map((step, i) => (
              <div key={step.num} style={{ padding: '36px 28px', background: '#0d1018', borderRight: i < 3 ? '1px solid #1e2535' : 'none' }}>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '3rem', fontWeight: 300, color: '#2a3347', lineHeight: 1, marginBottom: '16px' }}>{step.num}</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 500, color: '#e8eaf0', marginBottom: '8px' }}>{step.title}</div>
                <div style={{ fontSize: '0.8rem', color: '#7a8499', lineHeight: 1.7, fontWeight: 300 }}>{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{ padding: '100px 60px', background: '#0d1018', borderTop: '1px solid #1e2535' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ fontSize: '0.68rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#7eb8f7', fontWeight: 500, marginBottom: '16px', textAlign: 'center' }}>Simple pricing</div>
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(2rem,4vw,3.2rem)', fontWeight: 300, color: '#fff', textAlign: 'center', marginBottom: '32px' }}>Start free. <em style={{ fontStyle: 'italic', color: '#7eb8f7' }}>Scale when ready.</em></h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', marginBottom: '56px' }}>
            <span style={{ fontSize: '13px', color: yearly ? '#7a8499' : '#e8eaf0' }}>Monthly</span>
            <div onClick={() => setYearly(!yearly)} style={{ width: '44px', height: '24px', borderRadius: '12px', background: yearly ? 'linear-gradient(135deg,#c9a84c,#e8c96d)' : '#1e2535', cursor: 'pointer', position: 'relative', transition: 'background 0.25s' }}>
              <div style={{ position: 'absolute', top: '3px', left: yearly ? '23px' : '3px', width: '18px', height: '18px', borderRadius: '50%', background: '#fff', transition: 'left 0.25s' }}></div>
            </div>
            <span style={{ fontSize: '13px', color: yearly ? '#e8eaf0' : '#7a8499' }}>Yearly</span>
            {yearly && <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', background: 'rgba(76,175,130,0.1)', color: '#4caf82', border: '1px solid rgba(76,175,130,0.25)' }}>Save 25%</span>}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', border: '1px solid #1e2535', borderRadius: '16px', overflow: 'hidden' }}>
            {[
              { name: 'Free', price: '0', period: '', sub: 'Forever free · No card needed', color: '#7a8499', features: ['5 legal queries per day', 'Legal Q&A with law references', 'Basic contract summary', '2 document templates', 'Chat history — 7 days'], cta: 'Get started free', href: '/chat', gold: false },
              { name: 'Standard', price: prices.std.price, period: prices.std.period, sub: yearly ? 'Billed annually' : 'Billed monthly', color: '#c9a84c', features: ['50 queries per day', 'Full structured legal answers', 'Complete contract analysis', 'All 12+ document templates', 'PDF downloads', 'Chat history forever'], cta: 'Get Standard →', href: '/chat', gold: true },
              { name: 'Pro', price: prices.pro.price, period: prices.pro.period, sub: yearly ? 'Billed annually' : 'Billed monthly', color: '#e8c96d', popular: true, features: ['Unlimited queries, always', 'Full answers with all sources', 'Deep contract analysis + PDF', 'All 12+ templates + priority', 'Case predictor + FIR analyzer', 'Similar past case outcomes', 'Priority AI speed', 'Email support'], cta: 'Upgrade to Pro →', href: '/upgrade', gold: true },
            ].map((plan, i) => (
              <div key={plan.name} className="plan-card" style={{ padding: '40px 32px', background: i === 2 ? 'linear-gradient(135deg,rgba(201,168,76,0.05),rgba(126,184,247,0.02))' : '#0d1018', borderRight: i < 2 ? '1px solid #1e2535' : 'none', position: 'relative', transition: 'transform 0.2s' }}>
                {plan.popular && <div style={{ position: 'absolute', top: '-1px', left: '50%', transform: 'translateX(-50%)', padding: '4px 14px', borderRadius: '0 0 8px 8px', background: 'linear-gradient(135deg,#c9a84c,#e8c96d)', fontSize: '10px', fontWeight: 700, color: '#0d0a00', whiteSpace: 'nowrap' }}>MOST POPULAR</div>}
                <div style={{ fontSize: '13px', fontWeight: 500, color: plan.color, textTransform: 'uppercase', marginBottom: '16px' }}>{plan.name}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '6px' }}>
                  {plan.price !== '0' && <span style={{ fontSize: '18px', color: '#9aa3b2' }}>₹</span>}
                  <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '48px', fontWeight: 300, color: '#fff', lineHeight: 1 }}>{plan.price === '0' ? '₹0' : plan.price}</span>
                  <span style={{ fontSize: '14px', color: '#4a5568' }}>{plan.period}</span>
                </div>
                <div style={{ fontSize: '12px', color: '#4a5568', marginBottom: '24px' }}>{plan.sub}</div>
                <a href={plan.href} style={{ display: 'block', textAlign: 'center', padding: '11px', borderRadius: '9px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', marginBottom: '24px', fontFamily: "'Outfit',sans-serif", textDecoration: 'none', background: plan.gold ? 'linear-gradient(135deg,#c9a84c,#e8c96d)' : 'transparent', border: plan.gold ? 'none' : '1px solid #2a3347', color: plan.gold ? '#0d0a00' : '#9aa3b2' }}>{plan.cta}</a>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {plan.features.map(f => <div key={f} style={{ display: 'flex', gap: '10px', fontSize: '13px', color: '#9aa3b2', fontWeight: 300 }}><span style={{ color: '#4caf82', flexShrink: 0 }}>✓</span>{f}</div>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" style={{ padding: '100px 60px', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ fontSize: '0.68rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#7eb8f7', fontWeight: 500, marginBottom: '16px' }}>FAQ</div>
        <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(2rem,4vw,3.2rem)', fontWeight: 300, color: '#fff', marginBottom: '48px' }}>Questions <em style={{ fontStyle: 'italic', color: '#7eb8f7' }}>answered.</em></h2>
        {FAQ.map((item, i) => (
          <div key={i} style={{ borderBottom: '1px solid #1e2535' }}>
            <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="faq-btn" style={{ width: '100%', background: 'none', border: 'none', color: '#e8eaf0', fontFamily: "'Outfit',sans-serif", fontSize: '15px', fontWeight: 400, padding: '20px 0', textAlign: 'left', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', transition: 'color 0.2s' }}>
              {item.q}
              <span style={{ color: '#4a5568', fontSize: '18px', transform: openFaq === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.22s', flexShrink: 0 }}>∨</span>
            </button>
            <div style={{ maxHeight: openFaq === i ? '200px' : '0', overflow: 'hidden', transition: 'max-height 0.3s ease' }}>
              <div style={{ padding: '0 0 20px', fontSize: '14px', color: '#7a8499', fontWeight: 300, lineHeight: 1.75 }}>{item.a}</div>
            </div>
          </div>
        ))}
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '60px 60px 32px', borderTop: '1px solid #1e2535' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ background: 'rgba(126,184,247,0.03)', border: '1px solid rgba(126,184,247,0.08)', borderLeft: '3px solid rgba(126,184,247,0.2)', borderRadius: '7px', padding: '12px 16px', fontSize: '0.75rem', color: '#3a4258', lineHeight: 1.6, marginBottom: '48px' }}>
            <strong style={{ color: 'rgba(126,184,247,0.6)' }}>Legal Notice —</strong> Zolvyn provides legal intelligence for informational purposes. For matters involving court proceedings, consulting a qualified advocate is always recommended.
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '28px', borderTop: '1px solid #1e2535', flexWrap: 'wrap', gap: '12px' }}>
            <p style={{ fontSize: '0.72rem', color: '#3a4258', fontWeight: 300 }}>© 2026 Zolvyn AI — Legal Intelligence · Made for India 🇮🇳</p>
            <div style={{ display: 'flex', gap: '20px' }}>
              {['Privacy', 'Terms', 'Refund'].map(l => <a key={l} href="#" className="footer-link" style={{ fontSize: '0.72rem', color: '#3a4258', textDecoration: 'none', transition: 'color .2s' }}>{l}</a>)}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}