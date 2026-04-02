'use client';

import { useState, useEffect } from 'react';

const MARQUEE_ITEMS = [
  'Bharatiya Nyaya Sanhita 2023', 'Indian Penal Code', 'Constitution of India',
  'CrPC / BNSS', 'Consumer Protection Act', 'Transfer of Property Act',
  'Contract Act 1872', 'RTI Act', 'Labour Laws', 'IT Act 2000',
  'POCSO Act', 'Motor Vehicles Act', 'RERA', 'Negotiable Instruments Act',
];

const FEATURES = [
  {
    icon: '💬', title: 'Legal Q&A',
    desc: 'Ask any question about Indian law in plain language. Get expert, structured answers with section references, confidence levels, and source documents — delivered instantly.',
    tags: ['Section references', 'Live streaming', 'Source documents'],
  },
  {
    icon: '📄', title: 'Contract Analyzer',
    desc: 'Upload any contract and receive a complete clause-by-clause breakdown with risk levels, missing protections, and specific recommendations under Indian contract law.',
    tags: ['Risk scoring', 'Clause breakdown', 'PDF report'],
  },
  {
    icon: '📝', title: 'Document Generator',
    desc: 'Generate court-ready legal documents — affidavits, FIRs, rental agreements, legal notices, and more. Complete with proper seals, stamps, and formatting.',
    tags: ['Court-ready', '12+ types', 'Proper format'],
  },
  {
    icon: '🔮', title: 'Case Predictor',
    desc: 'Describe your situation or upload an FIR. Get win probability, real precedent cases, applicable legal sections, and a complete step-by-step strategy.',
    tags: ['Win probability', 'Real precedents', 'Full strategy'],
  },
];

const STEPS = [
  { num: '01', title: 'Ask or upload', desc: 'Type your legal question in everyday language — or upload a contract, FIR, or court document directly.' },
  { num: '02', title: 'AI reads the law', desc: 'Zolvyn searches across all Indian laws — BNS, IPC, Constitution, BNSS — finding exactly what applies to you.' },
  { num: '03', title: 'Expert answer arrives', desc: 'A structured, referenced answer appears with exact law sections, a confidence score, and linked source documents.' },
  { num: '04', title: 'Take action', desc: 'Download your analysis, generate a ready-to-file document, or ask follow-up questions until you have full clarity.' },
];

const FAQS = [
  { q: 'Which Indian laws does Zolvyn cover?', a: 'Zolvyn covers Bharatiya Nyaya Sanhita 2023, Indian Penal Code, Constitution of India, CrPC / BNSS, Consumer Protection Act, Transfer of Property Act, Contract Act 1872, RTI Act, IT Act 2000, Labour Laws, and more — with regular updates.' },
  { q: 'Is my personal data safe with Zolvyn?', a: 'Completely. Your queries and documents are processed securely. We never sell, share, or misuse your data. Guest users leave zero trace. Logged-in users can delete their history anytime.' },
  { q: 'Can I use Zolvyn documents for real court filings?', a: 'Yes — Zolvyn generates properly formatted documents with correct Indian legal headers, stamps, and structure. For high-stakes filings, we recommend a lawyer do a final review.' },
  { q: 'What payment methods are accepted?', a: 'All payments via Razorpay — UPI (GPay, PhonePe, Paytm), debit card, credit card, or net banking. Cancel anytime from your dashboard.' },
  { q: 'What is the difference between Standard and Pro?', a: 'Standard gives 50 queries/day, all templates, PDF downloads. Pro is unlimited queries, case predictor, FIR analyzer, similar past cases, and priority AI speed.' },
  { q: 'Can I try before I pay?', a: 'Absolutely. The Free plan gives you 5 queries per day with no time limit — experience full Zolvyn quality before spending a single rupee.' },
];

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [yearly, setYearly] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div style={{ background: '#080a0f', color: '#e8eaf0', fontFamily: "'Outfit', sans-serif", overflowX: 'hidden' }}>

      {/* ── NAV ── */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, height: '68px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 60px', background: scrolled ? 'rgba(8,10,15,0.92)' : 'transparent', backdropFilter: scrolled ? 'blur(20px)' : 'none', borderBottom: scrolled ? '1px solid rgba(30,37,53,0.6)' : 'none', transition: 'all 0.3s' }}>
        <a href="/landing" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontWeight: 300, fontSize: '18px', letterSpacing: '0.26em', color: '#e8eaf0', display: 'flex', alignItems: 'center' }}>
            Z<span style={{ display: 'inline-block', width: '15px', height: '15px', border: '1.5px solid #7eb8f7', borderRadius: '50%', margin: '0 1px', boxShadow: '0 0 8px rgba(126,184,247,0.3)' }}></span>LVY N
          </div>
          <div style={{ width: '1px', height: '18px', background: '#2a3347' }}></div>
          <div style={{ fontSize: '9.5px', letterSpacing: '0.18em', color: '#4a5568', textTransform: 'uppercase' as const, fontWeight: 300 }}>Legal Intelligence</div>
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <a href="#features" style={{ fontSize: '13px', color: '#9aa3b2', textDecoration: 'none' }}>Features</a>
          <a href="#pricing" style={{ fontSize: '13px', color: '#9aa3b2', textDecoration: 'none' }}>Pricing</a>
          <a href="#faq" style={{ fontSize: '13px', color: '#9aa3b2', textDecoration: 'none' }}>FAQ</a>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <a href="/chat" style={{ padding: '8px 20px', border: '1px solid #2a3347', background: 'transparent', color: '#9aa3b2', borderRadius: '7px', fontSize: '13px', textDecoration: 'none', transition: 'all 0.2s' }}>Sign in</a>
          <a href="/chat" style={{ padding: '8px 22px', background: 'linear-gradient(135deg, #c9a84c, #e8c96d)', border: 'none', color: '#0d0a00', borderRadius: '7px', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>Try free →</a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '120px 60px 80px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: '700px', height: '700px', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(126,184,247,0.07) 0%, transparent 70%)', pointerEvents: 'none' }}></div>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 14px', borderRadius: '20px', border: '1px solid rgba(126,184,247,0.2)', background: 'rgba(126,184,247,0.06)', fontSize: '11px', letterSpacing: '0.12em', color: '#7eb8f7', textTransform: 'uppercase' as const, fontWeight: 500, marginBottom: '32px' }}>
          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#7eb8f7', animation: 'pulse 2s ease infinite', display: 'inline-block' }}></span>
          India's most advanced legal AI platform
        </div>

        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(3rem, 7vw, 6rem)', fontWeight: 300, lineHeight: 1.05, color: '#fff', letterSpacing: '-0.01em', marginBottom: '12px' }}>
          Know Your Rights.<br /><em style={{ fontStyle: 'italic', color: '#7eb8f7' }}>Instantly.</em>
        </h1>

        <p style={{ fontSize: '1.05rem', fontWeight: 300, color: '#9aa3b2', maxWidth: '560px', lineHeight: 1.75, margin: '0 auto 48px' }}>
          <strong style={{ color: '#e8eaf0', fontWeight: 400 }}>Zolvyn</strong> gives every Indian access to expert legal intelligence — understand any law, analyze contracts, generate court-ready documents, and get clarity on your case outcomes. All in seconds.
        </p>

        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', marginBottom: '64px', flexWrap: 'wrap' as const }}>
          <a href="/chat" style={{ padding: '14px 36px', background: 'linear-gradient(135deg, #c9a84c, #e8c96d)', border: 'none', color: '#0d0a00', borderRadius: '9px', fontSize: '15px', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', letterSpacing: '0.02em' }}>
            Start for free →
          </a>
          <a href="#features" style={{ padding: '14px 36px', background: 'transparent', border: '1px solid #2a3347', color: '#9aa3b2', borderRadius: '9px', fontSize: '15px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            See how it works
          </a>
        </div>

        <div style={{ display: 'flex', gap: '48px', justifyContent: 'center', flexWrap: 'wrap' as const }}>
          {[['50+', 'Indian laws covered'], ['12+', 'Document templates'], ['100%', 'Private & secure'], ['₹0', 'To start today']].map(([num, label]) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2rem', fontWeight: 600, color: '#fff', lineHeight: 1 }}>{num}</div>
              <div style={{ fontSize: '11px', color: '#4a5568', letterSpacing: '0.08em', marginTop: '4px', textTransform: 'uppercase' as const }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <div style={{ padding: '20px 0', borderTop: '1px solid #1e2535', borderBottom: '1px solid #1e2535', overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: '48px', whiteSpace: 'nowrap' as const, animation: 'marquee 25s linear infinite' }}>
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} style={{ fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: '#4a5568', flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#7eb8f7', display: 'inline-block' }}></span>
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: '100px 60px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ fontSize: '11px', letterSpacing: '0.16em', textTransform: 'uppercase' as const, color: '#7eb8f7', fontWeight: 500, marginBottom: '16px' }}>What Zolvyn does</div>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 300, color: '#fff', lineHeight: 1.15, marginBottom: '16px' }}>
          One platform.<br /><em style={{ fontStyle: 'italic', color: '#7eb8f7' }}>Every legal need.</em>
        </h2>
        <p style={{ fontSize: '15px', color: '#9aa3b2', maxWidth: '500px', lineHeight: 1.75, fontWeight: 300, marginBottom: '64px' }}>Built for citizens, lawyers, law students, and professionals across India.</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px', border: '1px solid #1e2535', borderRadius: '16px', overflow: 'hidden' }}>
          {FEATURES.map((f, i) => (
            <div key={i} style={{ padding: '40px', background: '#0d1018', borderRight: i % 2 === 0 ? '1px solid #1e2535' : 'none', borderBottom: i < 2 ? '1px solid #1e2535' : 'none', transition: 'background 0.25s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#161b28'}
              onMouseLeave={e => e.currentTarget.style.background = '#0d1018'}>
              <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(126,184,247,0.08)', border: '1px solid rgba(126,184,247,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', marginBottom: '20px' }}>{f.icon}</div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.4rem', fontWeight: 500, color: '#fff', marginBottom: '10px' }}>{f.title}</div>
              <p style={{ fontSize: '14px', color: '#9aa3b2', lineHeight: 1.75, fontWeight: 300, marginBottom: '16px' }}>{f.desc}</p>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' as const }}>
                {f.tags.map(tag => <span key={tag} style={{ padding: '3px 10px', borderRadius: '4px', fontSize: '11px', fontFamily: 'monospace', background: 'rgba(126,184,247,0.06)', color: '#7eb8f7', border: '1px solid rgba(126,184,247,0.12)' }}>{tag}</span>)}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: '100px 60px', background: '#0d1018', borderTop: '1px solid #1e2535', borderBottom: '1px solid #1e2535' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ fontSize: '11px', letterSpacing: '0.16em', textTransform: 'uppercase' as const, color: '#7eb8f7', fontWeight: 500, marginBottom: '16px' }}>Simple process</div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 300, color: '#fff', lineHeight: 1.15, marginBottom: '64px' }}>
            From question to<br /><em style={{ fontStyle: 'italic', color: '#7eb8f7' }}>clarity in seconds.</em>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', border: '1px solid #1e2535', borderRadius: '14px', overflow: 'hidden' }}>
            {STEPS.map((step, i) => (
              <div key={i} style={{ padding: '36px 28px', background: '#0d1018', borderRight: i < 3 ? '1px solid #1e2535' : 'none' }}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '3rem', fontWeight: 300, color: '#2a3347', lineHeight: 1, marginBottom: '16px' }}>{step.num}</div>
                <div style={{ fontSize: '14px', fontWeight: 500, color: '#e8eaf0', marginBottom: '8px' }}>{step.title}</div>
                <p style={{ fontSize: '13px', color: '#9aa3b2', lineHeight: 1.7, fontWeight: 300 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" style={{ padding: '100px 60px', background: '#0d1018', borderBottom: '1px solid #1e2535' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ fontSize: '11px', letterSpacing: '0.16em', textTransform: 'uppercase' as const, color: '#7eb8f7', fontWeight: 500, marginBottom: '16px', textAlign: 'center' }}>Simple, honest pricing</div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 300, color: '#fff', lineHeight: 1.15, marginBottom: '24px', textAlign: 'center' }}>
            Start free.<br /><em style={{ fontStyle: 'italic', color: '#7eb8f7' }}>Scale when you're ready.</em>
          </h2>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', fontSize: '14px', color: '#9aa3b2', marginBottom: '40px' }}>
            <span>Monthly</span>
            <button onClick={() => setYearly(!yearly)} style={{ width: '44px', height: '24px', borderRadius: '12px', background: yearly ? 'linear-gradient(135deg, #c9a84c, #e8c96d)' : '#1e2535', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
              <div style={{ position: 'absolute', top: '4px', left: yearly ? '22px' : '4px', width: '16px', height: '16px', borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }}></div>
            </button>
            <span>Yearly <span style={{ padding: '2px 8px', borderRadius: '4px', background: 'rgba(76,175,130,0.1)', color: '#4caf82', border: '1px solid rgba(76,175,130,0.2)', fontSize: '11px', fontWeight: 600 }}>Save 25%</span></span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', border: '1px solid #1e2535', borderRadius: '16px', overflow: 'hidden' }}>
            {[
              { name: 'Free', price: '₹0', yearSub: 'Forever free · No card needed', monthSub: 'Forever free · No card needed', color: '#9aa3b2', features: ['5 legal queries per day', 'Legal Q&A with law references', 'Basic contract summary', '2 document templates', 'Chat history — 7 days'], missing: ['PDF downloads', 'Unlimited queries', 'Full case analysis'], btn: 'Get started free', btnStyle: 'ghost' },
              { name: 'Standard', price: yearly ? '₹299/yr' : '₹49/mo', yearSub: 'Billed annually · Cancel anytime', monthSub: 'Billed monthly · Cancel anytime', color: '#7eb8f7', popular: false, features: ['50 queries per day', 'Full structured legal answers', 'Complete contract analysis', 'All 12+ document templates', 'PDF downloads', 'Chat history forever'], missing: ['Unlimited queries', 'Case predictor + FIR analyzer'], btn: 'Get Standard →', btnStyle: 'blue' },
              { name: 'Pro', price: yearly ? '₹899/yr' : '₹299/mo', yearSub: 'Billed annually · Cancel anytime', monthSub: 'Billed monthly · Cancel anytime', color: '#e8c96d', popular: true, features: ['Unlimited queries, always', 'Full answers with all sources', 'Deep contract analysis + PDF', 'All 12+ templates + priority', 'Case predictor + FIR analyzer', 'Similar past case outcomes', 'Priority AI speed', 'Email support'], missing: [], btn: 'Upgrade to Pro →', btnStyle: 'gold' },
            ].map((plan, i) => (
              <div key={i} style={{ padding: '40px 32px', background: plan.popular ? 'linear-gradient(170deg, #111828, #0f1520)' : '#0d1018', borderRight: i < 2 ? '1px solid #1e2535' : 'none', position: 'relative', outline: plan.popular ? '1px solid rgba(201,168,76,0.25)' : 'none' }}>
                {plan.popular && <div style={{ position: 'absolute', top: '20px', right: '20px', padding: '3px 10px', background: 'linear-gradient(135deg, #c9a84c, #e8c96d)', borderRadius: '4px', fontSize: '10px', fontWeight: 700, color: '#0d0a00', letterSpacing: '0.08em' }}>MOST POPULAR</div>}
                <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: plan.color, marginBottom: '20px' }}>{plan.name}</div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2.6rem', fontWeight: 300, color: '#fff', lineHeight: 1, marginBottom: '6px' }}>{plan.price}</div>
                <div style={{ fontSize: '12px', color: '#4a5568', marginBottom: '24px' }}>{yearly ? plan.yearSub : plan.monthSub}</div>
                <div style={{ height: '1px', background: '#1e2535', marginBottom: '24px' }}></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
                  {plan.features.map((f, j) => <div key={j} style={{ display: 'flex', gap: '8px', fontSize: '13px', color: '#9aa3b2', fontWeight: 300 }}><span style={{ color: '#4caf82' }}>✓</span>{f}</div>)}
                  {plan.missing.map((f, j) => <div key={j} style={{ display: 'flex', gap: '8px', fontSize: '13px', color: '#4a5568', fontWeight: 300 }}><span>—</span>{f}</div>)}
                </div>
                <a href="/chat" style={{
                  display: 'block', textAlign: 'center', padding: '12px',
                  background: plan.btnStyle === 'gold' ? 'linear-gradient(135deg, #c9a84c, #e8c96d)' : plan.btnStyle === 'blue' ? 'rgba(126,184,247,0.06)' : 'transparent',
                  border: plan.btnStyle === 'gold' ? 'none' : plan.btnStyle === 'blue' ? '1px solid rgba(126,184,247,0.3)' : '1px solid #2a3347',
                  color: plan.btnStyle === 'gold' ? '#0d0a00' : plan.btnStyle === 'blue' ? '#7eb8f7' : '#9aa3b2',
                  borderRadius: '8px', fontSize: '13.5px', fontWeight: plan.btnStyle === 'gold' ? 700 : 500,
                  textDecoration: 'none', transition: 'all 0.2s',
                }}>{plan.btn}</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" style={{ padding: '100px 60px', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ fontSize: '11px', letterSpacing: '0.16em', textTransform: 'uppercase' as const, color: '#7eb8f7', fontWeight: 500, marginBottom: '16px', textAlign: 'center' }}>FAQ</div>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2.5rem', fontWeight: 300, color: '#fff', marginBottom: '48px', textAlign: 'center' }}>Questions <em style={{ fontStyle: 'italic', color: '#7eb8f7' }}>answered.</em></h2>
        {FAQS.map((faq, i) => (
          <div key={i} style={{ borderBottom: '1px solid #1e2535', overflow: 'hidden' }}>
            <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', padding: '22px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '15px', fontWeight: 400, color: '#e8eaf0', fontFamily: 'inherit', textAlign: 'left', gap: '16px' }}>
              {faq.q}
              <span style={{ color: '#4a5568', transition: 'transform 0.25s', transform: openFaq === i ? 'rotate(180deg)' : 'none', flexShrink: 0 }}>∨</span>
            </button>
            {openFaq === i && <div style={{ paddingBottom: '20px', fontSize: '14px', color: '#9aa3b2', lineHeight: 1.8, fontWeight: 300 }}>{faq.a}</div>}
          </div>
        ))}
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#0d1018', borderTop: '1px solid #1e2535', padding: '60px 60px 32px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ background: 'rgba(126,184,247,0.03)', border: '1px solid rgba(126,184,247,0.08)', borderLeft: '3px solid rgba(126,184,247,0.2)', borderRadius: '7px', padding: '12px 16px', fontSize: '12px', color: '#4a5568', lineHeight: 1.6, marginBottom: '40px' }}>
            <strong style={{ color: 'rgba(126,184,247,0.6)' }}>Legal Notice —</strong> Zolvyn provides legal intelligence for informational purposes. For matters involving court proceedings, consulting a qualified advocate is always recommended. Zolvyn is not a law firm.
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '48px', marginBottom: '40px' }}>
            <div>
              <div style={{ fontWeight: 300, fontSize: '18px', letterSpacing: '0.26em', color: '#e8eaf0', display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                Z<span style={{ display: 'inline-block', width: '14px', height: '14px', border: '1.5px solid #7eb8f7', borderRadius: '50%', margin: '0 1px' }}></span>LVY N
              </div>
              <p style={{ fontSize: '13px', color: '#4a5568', lineHeight: 1.7, maxWidth: '260px', fontWeight: 300, marginBottom: '20px' }}>India's AI-powered legal intelligence platform. Understand your rights, analyze contracts, and navigate Indian law.</p>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['Instagram', 'X', 'Reddit', 'LinkedIn'].map(s => (
                  <div key={s} style={{ width: '34px', height: '34px', borderRadius: '7px', border: '1px solid #2a3347', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#4a5568', cursor: 'pointer' }}>
                    {s[0]}
                  </div>
                ))}
              </div>
            </div>
            {[
              { title: 'Product', links: ['Legal Q&A', 'Contract Analyzer', 'Document Generator', 'Case Predictor', 'Bare Act Search'] },
              { title: 'Company', links: ['About Zolvyn', 'Pricing', 'Blog', 'Careers', 'Contact us'] },
              { title: 'Legal', links: ['Privacy Policy', 'Terms of Service', 'Refund Policy', 'zolvynai@gmail.com'] },
            ].map(col => (
              <div key={col.title}>
                <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: '#4a5568', marginBottom: '16px' }}>{col.title}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {col.links.map(link => <a key={link} href="#" style={{ fontSize: '13px', color: '#4a5568', textDecoration: 'none', fontWeight: 300 }}>{link}</a>)}
                </div>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid #1e2535', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' as const, gap: '12px' }}>
            <p style={{ fontSize: '12px', color: '#4a5568', fontWeight: 300 }}>© 2026 Zolvyn AI — Legal Intelligence · Made for India 🇮🇳</p>
            <div style={{ display: 'flex', gap: '20px' }}>
              {['Privacy', 'Terms', 'Refund'].map(l => <a key={l} href="#" style={{ fontSize: '12px', color: '#4a5568', textDecoration: 'none' }}>{l}</a>)}
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Outfit:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #1e2535; border-radius: 4px; }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(.7)} }
        @keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        a { transition: opacity 0.2s; }
        a:hover { opacity: 0.8; }
        @media (max-width: 768px) {
          nav { padding: 0 20px !important; }
          nav > div:nth-child(2) { display: none; }
          section { padding: 60px 20px !important; }
          h1 { font-size: 2.8rem !important; }
          div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
          div[style*="grid-template-columns: repeat(4"] { grid-template-columns: 1fr 1fr !important; }
          div[style*="grid-template-columns: 1fr 1fr 1fr"] { grid-template-columns: 1fr !important; }
          div[style*="grid-template-columns: 2fr 1fr 1fr 1fr"] { grid-template-columns: 1fr 1fr !important; }
          footer { padding: 40px 20px 24px !important; }
        }
      `}</style>
    </div>
  );
}