'use client';
import { useState } from 'react';

export default function UpgradePage() {
  const [yearly, setYearly] = useState(true);

  const prices = {
    std: yearly ? { price: '299', period: '/year', sub: 'Billed annually · Cancel anytime' } : { price: '49', period: '/month', sub: 'Billed monthly · Cancel anytime' },
    pro: yearly ? { price: '899', period: '/year', sub: 'Billed annually · Cancel anytime' } : { price: '299', period: '/month', sub: 'Billed monthly · Cancel anytime' },
  };

  const FREE_FEATURES = ['5 legal queries per day', 'Legal Q&A with law references', 'Basic contract summary', '2 document templates', 'Chat history — 7 days'];
  const STD_FEATURES = ['50 queries per day', 'Full structured legal answers', 'Complete contract analysis', 'All 12+ document templates', 'PDF downloads', 'Chat history forever'];
  const PRO_FEATURES = ['Unlimited queries, always', 'Full answers with all sources', 'Deep contract analysis + PDF', 'All 12+ templates + priority', 'Case predictor + FIR analyzer', 'Similar past case outcomes', 'Priority AI speed', 'Email support'];

  return (
    <div style={{ minHeight: '100vh', background: '#080a0f', color: '#e8eaf0', fontFamily: "'Outfit',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Outfit:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:5px} ::-webkit-scrollbar-thumb{background:#2a3347;border-radius:4px}
        .plan-card:hover{transform:translateY(-4px) !important}
        .faq-item{border-bottom:1px solid #1e2535}
        .faq-q{width:100%;background:none;border:none;color:#e8eaf0;font-family:'Outfit',sans-serif;font-size:15px;font-weight:400;padding:20px 0;text-align:left;cursor:pointer;display:flex;justify-content:space-between;align-items:center;gap:12px}
      `}</style>

      {/* Nav */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 60px', background: 'rgba(8,10,15,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(30,37,53,0.6)' }}>
        <a href="/landing" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 200, fontSize: '17px', color: '#e8eaf0', display: 'flex', alignItems: 'center' }}>
            <span style={{ letterSpacing: '0.18em' }}>Z</span>
            <span style={{ display: 'inline-block', width: '13px', height: '13px', border: '1.5px solid #7eb8f7', borderRadius: '50%', margin: '0 3px', boxShadow: '0 0 8px rgba(126,184,247,0.3)' }}></span>
            <span style={{ letterSpacing: '0.18em' }}>LVYN</span>
          </div>
          <div style={{ width: '1px', height: '18px', background: '#2a3347' }}></div>
          <div style={{ fontSize: '9.5px', letterSpacing: '0.14em', color: '#3a4258', textTransform: 'uppercase', fontWeight: 300 }}>Legal Intelligence</div>
        </a>
        <a href="/chat" style={{ padding: '8px 22px', background: 'linear-gradient(135deg,#c9a84c,#e8c96d)', border: 'none', color: '#0d0a00', borderRadius: '7px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', textDecoration: 'none', fontFamily: "'Outfit',sans-serif" }}>Back to App</a>
      </nav>

      {/* Hero */}
      <div style={{ paddingTop: '120px', paddingBottom: '60px', textAlign: 'center', padding: '120px 60px 60px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 14px', borderRadius: '20px', border: '1px solid rgba(201,168,76,0.25)', background: 'rgba(201,168,76,0.06)', fontSize: '11px', letterSpacing: '0.12em', color: '#c9a84c', textTransform: 'uppercase', fontWeight: 500, marginBottom: '28px' }}>
          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#c9a84c', display: 'inline-block' }}></span>
          Simple, honest pricing
        </div>
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(2.5rem,5vw,4rem)', fontWeight: 300, color: '#fff', lineHeight: 1.1, marginBottom: '16px' }}>
          Start free. <em style={{ fontStyle: 'italic', color: '#7eb8f7' }}>Scale when ready.</em>
        </div>
        <p style={{ fontSize: '1rem', color: '#7a8499', maxWidth: '480px', margin: '0 auto 40px', lineHeight: 1.75, fontWeight: 300 }}>Every Indian deserves access to legal intelligence. Start free, upgrade when you need more.</p>

        {/* Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', marginBottom: '60px' }}>
          <span style={{ fontSize: '13.5px', color: yearly ? '#7a8499' : '#e8eaf0', fontWeight: 300 }}>Monthly</span>
          <div onClick={() => setYearly(!yearly)} style={{ width: '44px', height: '24px', borderRadius: '12px', background: yearly ? 'linear-gradient(135deg,#c9a84c,#e8c96d)' : '#1e2535', cursor: 'pointer', position: 'relative', transition: 'background 0.25s' }}>
            <div style={{ position: 'absolute', top: '3px', left: yearly ? '23px' : '3px', width: '18px', height: '18px', borderRadius: '50%', background: '#fff', transition: 'left 0.25s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }}></div>
          </div>
          <span style={{ fontSize: '13.5px', color: yearly ? '#e8eaf0' : '#7a8499', fontWeight: 300 }}>Yearly</span>
          {yearly && <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', background: 'rgba(76,175,130,0.1)', color: '#4caf82', border: '1px solid rgba(76,175,130,0.25)', fontWeight: 500 }}>Save 25%</span>}
        </div>
      </div>

      {/* Plans */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '20px', maxWidth: '1100px', margin: '0 auto', padding: '0 40px 80px' }}>

        {/* Free */}
        <div className="plan-card" style={{ background: '#0d1018', border: '1px solid #1e2535', borderRadius: '16px', padding: '32px', display: 'flex', flexDirection: 'column', gap: '0', transition: 'transform 0.2s' }}>
          <div style={{ fontSize: '13px', fontWeight: 500, color: '#9aa3b2', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '16px' }}>Free</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '6px' }}>
            <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '48px', fontWeight: 300, color: '#fff', lineHeight: 1 }}>₹0</span>
          </div>
          <div style={{ fontSize: '13px', color: '#4a5568', marginBottom: '28px', fontWeight: 300 }}>Forever free · No card needed</div>
          <a href="/chat" style={{ display: 'block', textAlign: 'center', padding: '11px', borderRadius: '9px', border: '1px solid #2a3347', color: '#9aa3b2', fontSize: '14px', fontWeight: 500, textDecoration: 'none', marginBottom: '28px', fontFamily: "'Outfit',sans-serif", transition: 'all 0.2s' }}>Get started free</a>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
            {FREE_FEATURES.map(f => <div key={f} style={{ display: 'flex', gap: '10px', fontSize: '13.5px', color: '#9aa3b2', fontWeight: 300 }}><span style={{ color: '#4caf82', flexShrink: 0 }}>✓</span>{f}</div>)}
          </div>
        </div>

        {/* Standard */}
        <div className="plan-card" style={{ background: '#0d1018', border: '1px solid #2a3347', borderRadius: '16px', padding: '32px', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s' }}>
          <div style={{ fontSize: '13px', fontWeight: 500, color: '#c9a84c', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '16px' }}>Standard</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '6px' }}>
            <span style={{ fontSize: '20px', color: '#9aa3b2', fontWeight: 300 }}>₹</span>
            <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '48px', fontWeight: 300, color: '#fff', lineHeight: 1 }}>{prices.std.price}</span>
            <span style={{ fontSize: '14px', color: '#4a5568', fontWeight: 300 }}>{prices.std.period}</span>
          </div>
          <div style={{ fontSize: '13px', color: '#4a5568', marginBottom: '28px', fontWeight: 300 }}>{prices.std.sub}</div>
          <button style={{ padding: '11px', borderRadius: '9px', border: 'none', background: 'linear-gradient(135deg,#c9a84c,#e8c96d)', color: '#0d0a00', fontSize: '14px', fontWeight: 600, cursor: 'pointer', marginBottom: '28px', fontFamily: "'Outfit',sans-serif" }}>Get Standard →</button>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
            {STD_FEATURES.map(f => <div key={f} style={{ display: 'flex', gap: '10px', fontSize: '13.5px', color: '#9aa3b2', fontWeight: 300 }}><span style={{ color: '#4caf82', flexShrink: 0 }}>✓</span>{f}</div>)}
          </div>
        </div>

        {/* Pro */}
        <div className="plan-card" style={{ background: 'linear-gradient(135deg,rgba(201,168,76,0.06),rgba(126,184,247,0.03))', border: '1px solid rgba(201,168,76,0.3)', borderRadius: '16px', padding: '32px', display: 'flex', flexDirection: 'column', position: 'relative', transition: 'transform 0.2s' }}>
          <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', padding: '4px 14px', borderRadius: '20px', background: 'linear-gradient(135deg,#c9a84c,#e8c96d)', fontSize: '10.5px', fontWeight: 700, color: '#0d0a00', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>MOST POPULAR</div>
          <div style={{ fontSize: '13px', fontWeight: 500, color: '#e8c96d', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '16px' }}>Pro</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '6px' }}>
            <span style={{ fontSize: '20px', color: '#9aa3b2', fontWeight: 300 }}>₹</span>
            <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '48px', fontWeight: 300, color: '#fff', lineHeight: 1 }}>{prices.pro.price}</span>
            <span style={{ fontSize: '14px', color: '#4a5568', fontWeight: 300 }}>{prices.pro.period}</span>
          </div>
          <div style={{ fontSize: '13px', color: '#4a5568', marginBottom: '28px', fontWeight: 300 }}>{prices.pro.sub}</div>
          <button style={{ padding: '11px', borderRadius: '9px', border: 'none', background: 'linear-gradient(135deg,#c9a84c,#e8c96d)', color: '#0d0a00', fontSize: '14px', fontWeight: 600, cursor: 'pointer', marginBottom: '28px', fontFamily: "'Outfit',sans-serif", boxShadow: '0 0 30px rgba(201,168,76,0.2)' }}>Upgrade to Pro →</button>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
            {PRO_FEATURES.map(f => <div key={f} style={{ display: 'flex', gap: '10px', fontSize: '13.5px', color: '#e8eaf0', fontWeight: 300 }}><span style={{ color: '#e8c96d', flexShrink: 0 }}>✓</span>{f}</div>)}
          </div>
        </div>
      </div>

      {/* Footer note */}
      <div style={{ textAlign: 'center', padding: '0 40px 60px', fontSize: '13px', color: '#4a5568', fontWeight: 300 }}>
        All payments via Razorpay · UPI, Cards, Net Banking · Cancel anytime · 7-day refund policy
      </div>
    </div>
  );
}