'use client';

import { useState } from 'react';

const SIDEBAR_ITEMS = [
  { href: '/chat', icon: '💬', label: 'Legal Q&A' },
  { href: '/contract', icon: '📄', label: 'Contract Analyzer' },
  { href: '/generator', icon: '📝', label: 'Document Generator' },
  { href: '/predictor', icon: '🔮', label: 'Case Predictor' },
  { href: '/bareacts', icon: '📚', label: 'Bare Acts' },
  { href: '/upgrade', icon: '⚡', label: 'Upgrade to Pro', active: true },
];

const PLANS = [
  {
    key: 'free', name: 'Free', price: '₹0', period: 'forever', color: '#9aa3b2',
    features: ['5 legal queries per day', 'Legal Q&A with law references', 'Basic contract summary', '2 document templates', 'Chat history — 7 days'],
    missing: ['PDF report downloads', 'Unlimited queries', 'Full case analysis'],
    btn: 'Current Plan', btnStyle: 'ghost',
  },
  {
    key: 'standard', name: 'Standard', price: '₹49', period: '/month', yearPrice: '₹299/year', color: '#7eb8f7', popular: false,
    features: ['50 queries per day', 'Full structured legal answers', 'Complete contract analysis', 'All 12+ document templates', 'PDF downloads', 'Chat history forever'],
    missing: ['Unlimited queries', 'Case predictor + FIR analyzer'],
    btn: 'Get Standard — Razorpay', btnStyle: 'blue',
  },
  {
    key: 'pro', name: 'Pro', price: '₹299', period: '/month', yearPrice: '₹899/year', color: '#e8c96d', popular: true,
    features: ['Unlimited queries, always', 'Full answers with all sources', 'Deep contract analysis + PDF', 'All 12+ templates + priority', 'Case predictor + FIR analyzer', 'Similar past case outcomes', 'Priority AI speed', 'Email support'],
    missing: [],
    btn: 'Upgrade to Pro — Razorpay', btnStyle: 'gold',
  },
];

export default function UpgradePage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [yearly, setYearly] = useState(true);

  const handlePayment = (plan: string) => {
    if (plan === 'free') return;
    alert(`Razorpay integration coming soon!\nPlan: ${plan}\nPrice: ${yearly ? 'yearly' : 'monthly'}`);
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
      </div>

      {/* MAIN */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', minWidth: 0 }}>
        <div style={{ height: '56px', minHeight: '56px', borderBottom: '1px solid #1e2535', display: 'flex', alignItems: 'center', padding: '0 24px', gap: '12px' }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', color: '#7a8499', cursor: 'pointer', fontSize: '18px' }}>☰</button>
          <span style={{ fontSize: '15px', fontWeight: 500 }}>Upgrade to Pro</span>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '40px' }}>
          <div style={{ maxWidth: '960px', margin: '0 auto' }}>

            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '36px', fontWeight: 300, marginBottom: '10px' }}>
                Simple, <em style={{ fontStyle: 'italic', color: '#e8c96d' }}>honest pricing</em>
              </div>
              <div style={{ fontSize: '15px', color: '#9aa3b2', fontWeight: 300, marginBottom: '24px' }}>Start free. Scale when you're ready. All payments via Razorpay.</div>

              {/* Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', fontSize: '14px', color: '#9aa3b2' }}>
                <span style={{ color: !yearly ? '#e8eaf0' : '#9aa3b2' }}>Monthly</span>
                <button onClick={() => setYearly(!yearly)} style={{ width: '44px', height: '24px', borderRadius: '12px', background: yearly ? 'linear-gradient(135deg, #c9a84c, #e8c96d)' : '#1e2535', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
                  <div style={{ position: 'absolute', top: '4px', left: yearly ? '22px' : '4px', width: '16px', height: '16px', borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }}></div>
                </button>
                <span style={{ color: yearly ? '#e8eaf0' : '#9aa3b2' }}>Yearly <span style={{ padding: '2px 8px', borderRadius: '4px', background: 'rgba(76,175,130,0.1)', color: '#4caf82', border: '1px solid rgba(76,175,130,0.2)', fontSize: '11px', fontWeight: 600 }}>Save 25%</span></span>
              </div>
            </div>

            {/* Plans */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0', border: '1px solid #1e2535', borderRadius: '16px', overflow: 'hidden' }}>
              {PLANS.map((plan, i) => (
                <div key={plan.key} style={{ padding: '32px 28px', background: plan.popular ? 'linear-gradient(170deg, #111828, #0f1520)' : '#0d1018', borderRight: i < 2 ? '1px solid #1e2535' : 'none', position: 'relative', border: plan.popular ? '1px solid rgba(201,168,76,0.2)' : undefined }}>
                  {plan.popular && <div style={{ position: 'absolute', top: '16px', right: '16px', padding: '3px 10px', background: 'linear-gradient(135deg, #c9a84c, #e8c96d)', borderRadius: '4px', fontSize: '10px', fontWeight: 700, color: '#0d0a04', letterSpacing: '0.08em' }}>MOST POPULAR</div>}

                  <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: plan.color, marginBottom: '16px' }}>{plan.name}</div>

                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2.6rem', fontWeight: 300, color: '#e8eaf0', lineHeight: 1, marginBottom: '4px' }}>
                    {plan.key === 'free' ? plan.price : yearly && plan.yearPrice ? plan.yearPrice.split('/')[0] : plan.price}
                    {plan.key !== 'free' && <span style={{ fontSize: '14px', color: '#4a5568', fontFamily: 'inherit' }}>{yearly ? '/year' : plan.period}</span>}
                  </div>

                  {plan.key !== 'free' && yearly && <div style={{ fontSize: '12px', color: '#4a5568', marginBottom: '20px' }}>Billed annually · Cancel anytime</div>}
                  {plan.key === 'free' && <div style={{ fontSize: '12px', color: '#4a5568', marginBottom: '20px' }}>Forever free · No card needed</div>}
                  {plan.key !== 'free' && !yearly && <div style={{ fontSize: '12px', color: '#4a5568', marginBottom: '20px' }}>Billed monthly · Cancel anytime</div>}

                  <div style={{ height: '1px', background: '#1e2535', marginBottom: '20px' }}></div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
                    {plan.features.map((f, j) => (
                      <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: '#9aa3b2', fontWeight: 300 }}>
                        <span style={{ color: '#4caf82', flexShrink: 0, marginTop: '1px' }}>✓</span>{f}
                      </div>
                    ))}
                    {plan.missing.map((f, j) => (
                      <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: '#4a5568', fontWeight: 300 }}>
                        <span style={{ flexShrink: 0, marginTop: '1px' }}>—</span>{f}
                      </div>
                    ))}
                  </div>

                  <button onClick={() => handlePayment(plan.key)} style={{
                    width: '100%', padding: '12px',
                    background: plan.btnStyle === 'gold' ? 'linear-gradient(135deg, #c9a84c, #e8c96d)' : plan.btnStyle === 'blue' ? 'rgba(126,184,247,0.06)' : 'transparent',
                    border: plan.btnStyle === 'gold' ? 'none' : plan.btnStyle === 'blue' ? '1px solid rgba(126,184,247,0.3)' : '1px solid #2a3347',
                    color: plan.btnStyle === 'gold' ? '#0d0a04' : plan.btnStyle === 'blue' ? '#7eb8f7' : '#9aa3b2',
                    borderRadius: '8px', fontSize: '13.5px', fontWeight: plan.btnStyle === 'gold' ? 700 : 500,
                    cursor: plan.key === 'free' ? 'default' : 'pointer', fontFamily: 'inherit',
                    transition: 'all 0.2s',
                  }}>{plan.btn}</button>

                  {plan.key !== 'free' && <div style={{ fontSize: '11px', color: '#4a5568', textAlign: 'center', marginTop: '8px' }}>Secure · UPI / Card / NetBanking</div>}
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Outfit:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #1e2535; border-radius: 4px; }
        a { color: inherit; }
      `}</style>
    </div>
  );
}