'use client';
import { useState, useEffect } from 'react';
import { getStoredUser, createUser, storeUser, trackPageVisit, getBlogs, createBlog, likeBlog } from '../../lib/supabase';
import type { BlogPost } from '../../lib/supabase';

const MARQUEE_ITEMS = ['Bharatiya Nyaya Sanhita 2023','Indian Penal Code','Constitution of India','CrPC / BNSS','Consumer Protection Act','Transfer of Property Act','Contract Act 1872','RTI Act','Labour Laws','IT Act 2000','POCSO Act','Motor Vehicles Act','RERA','Negotiable Instruments Act'];
const FEATURES = [
  { icon:'💬', title:'Legal Q&A', desc:'Ask any question about Indian law in plain language. Get expert answers with exact section references instantly.', tags:['Section references','Live streaming','Source documents'], href:'/chat' },
  { icon:'📄', title:'Contract Analyzer', desc:'Upload any contract for a complete clause-by-clause breakdown with risk levels and recommendations under Indian law.', tags:['Risk scoring','Clause breakdown','PDF report'], href:'/contract' },
  { icon:'📝', title:'Document Generator', desc:'Generate court-ready legal documents — affidavits, FIRs, rental agreements, legal notices, and more.', tags:['Court-ready','12+ types','Proper format'], href:'/generator' },
  { icon:'🔮', title:'Case Predictor', desc:'Describe your situation and get win probability, real precedent cases, applicable sections, and strategy.', tags:['Win probability','Real precedents','Full strategy'], href:'/predictor' },
];
const STEPS = [
  { num:'01', title:'Ask or upload', desc:'Type your legal question or upload a contract, FIR, or court document directly.' },
  { num:'02', title:'AI reads the law', desc:'Zolvyn searches across all Indian laws — BNS, IPC, Constitution, BNSS — finding exactly what applies.' },
  { num:'03', title:'Expert answer arrives', desc:'A structured, referenced answer appears with exact law sections and a confidence score.' },
  { num:'04', title:'Take action', desc:'Download your analysis, generate a ready-to-file document, or ask follow-up questions.' },
];
const FAQ = [
  { q:'Which Indian laws does Zolvyn cover?', a:'Zolvyn covers 50+ Indian laws including BNS 2023, BNSS 2023, Constitution of India, IPC 1860, CrPC, Consumer Protection Act, RERA, RTI Act, Labour Laws, IT Act 2000, POCSO Act, Motor Vehicles Act, and more.' },
  { q:'Is my personal data safe with Zolvyn?', a:'Yes. Your conversations and documents are encrypted and never sold or shared. We do not use your data to train AI models.' },
  { q:'Can I use Zolvyn documents for real court filings?', a:'Yes — Zolvyn generates properly formatted documents with correct Indian legal headers and structure. For high-stakes filings, we recommend a lawyer do a final review.' },
  { q:'What payment methods are accepted?', a:'All payments are processed via Razorpay — UPI, debit card, credit card, or net banking. No international cards required.' },
  { q:'Can I try before I pay?', a:'Absolutely. The Free plan gives you 5 queries per day with no time limit — use it as long as you like before upgrading.' },
];
const ABOUT_STATS = [{ num:'50+', label:'Indian Laws Covered' },{ num:'12+', label:'Document Templates' },{ num:'4', label:'AI-Powered Modules' },{ num:'100%', label:'Private & Secure' }];
const ABOUT_FEATURES_DEEP = [
  { icon:'💬', title:'Legal Q&A — RAG + Direct Mode', desc:'RAG Mode searches uploaded legal PDFs through FAISS vector database. Direct Mode uses our fine-tuned legal LLM. Both cite exact section numbers, acts, and court precedents.', details:['FAISS vector search across your documents','HuggingFace sentence-transformers embeddings','Llama 3.3 70B with 128K context window','Cites IPC, BNS, CrPC, Constitution sections','Multi-turn conversation with memory'] },
  { icon:'📄', title:'Contract Analyzer — Deep Risk Intelligence', desc:'Upload any PDF contract and get a clause-by-clause legal breakdown. Our AI identifies red flags, missing clauses, one-sided terms, liability exposure, and IP grabs. Every finding is mapped to Indian law sections.', details:['7-section structured analysis output','Risk score from 1–10 with visual indicator','Red flags with real-world consequence explanation','Missing clause detection with risk explanation','Download full report as PDF or TXT'] },
  { icon:'📝', title:'Document Generator — Court-Ready Output', desc:'Generate 12+ types of legally structured documents. Every document follows Indian legal formatting with proper recitals, numbered clauses, jurisdiction, governing law, and signature blocks.', details:['12+ document types with dedicated form fields','Proper WHEREAS recitals and numbered clauses','Dispute resolution and jurisdiction clauses','Downloadable as PDF with Zolvyn branding','Built under Indian Contract Act 1872 standards'] },
  { icon:'🔮', title:'Case Predictor — AI Legal Strategy', desc:'Describe your legal situation across 15 case types. Get win probability (0–100%), case strength, urgency level, applicable laws, strengths/weaknesses, step-by-step action plan, and realistic cost/timeline.', details:['15 case types including MACT, POCSO, NI Act','Win probability with bar visualization','Strengths, weaknesses, and opponent arguments','Step-by-step numbered action plan','Links to eCourts for district court access'] },
  { icon:'⚡', title:'Bare Act Search — Instant Law Lookup', desc:'Look up any section of any Indian law instantly — IPC, CrPC, BNS, BNSS, Constitution, Consumer Protection Act, RTI, IT Act and more.', details:['50+ acts indexed and searchable','Plain-language explanation alongside bare text','Cross-references to related sections','Covers new BNS 2023 and BNSS 2023','Search by keyword, topic, or section number'] },
  { icon:'🔒', title:'Privacy & Security — Zero Data Retention', desc:'Your documents, conversations, and case details are never stored after your session ends. We do not sell data, share it with third parties, or use it to train our AI models.', details:['No document storage after session ends','No user data sold or shared','Conversations not used for model training','Encrypted in transit and at rest','No login required for free tier'] },
];
const TECH_STACK = [{ name:'Llama 3.3 70B', desc:'Core LLM via Groq' },{ name:'LangChain RAG', desc:'Document retrieval pipeline' },{ name:'FAISS', desc:'Vector database search' },{ name:'HuggingFace', desc:'Text embeddings' },{ name:'Next.js', desc:'Frontend framework' },{ name:'Supabase', desc:'Database & auth' },{ name:'Razorpay', desc:'Indian payment gateway' },{ name:'Groq API', desc:'128K context, ultra-fast' }];
const BLOG_CATEGORIES = ['All','Legal Rights','Criminal Law','Contract Law','Consumer Law','Family Law','Property Law','Labour Law','RTI & Government','Cybercrime','Startup & Business'];
const SEED_POSTS: BlogPost[] = [
  { id:'seed-1', title:'Understanding Section 138 NI Act — When Your Cheque Bounces', author:'Zolvyn Legal Team', category:'Criminal Law', excerpt:'A cheque bounce is a criminal offence under Section 138 of the Negotiable Instruments Act. Here is everything you need to know.', content:'A cheque bounce is not just embarrassing — it is a criminal offence under Section 138 of the Negotiable Instruments Act, 1881.\n\n**What is Section 138 NI Act?**\nSection 138 makes it a criminal offence when a cheque issued for a legally enforceable debt is returned unpaid due to insufficient funds.\n\n**Key requirements:**\n1. The cheque must have been issued for a legally enforceable debt\n2. Present within 3 months of its date\n3. Send written demand notice within 30 days of the dishonour memo\n4. Drawer must fail to pay within 15 days of receiving the notice\n\n**Punishment:** Imprisonment up to 2 years, or fine up to twice the cheque amount, or both.\n\n**Tip:** Always send the legal notice via registered post AND email.', date:'2026-03-15', read_time:4, likes:47 },
  { id:'seed-2', title:'Your Rights as a Tenant in India — A Complete Guide', author:'Zolvyn Legal Team', category:'Property Law', excerpt:'Landlords cannot just throw you out. Indian law gives tenants strong protections. Here is what every tenant must know.', content:'Renting a home in India comes with both obligations and rights that many tenants are unaware of.\n\n**The Rental Agreement**\nAlways insist on a written rental agreement. An oral agreement is valid but nearly impossible to prove.\n\n**Security Deposit**\nYour landlord MUST return the deposit within a reasonable time after you vacate, after deducting legitimate damages.\n\n**Notice Period**\nYour landlord cannot evict you without proper notice — typically 1–3 months depending on the agreement.\n\n**What to Do If Your Landlord Refuses to Return Deposit**\nSend a legal notice via registered post. If they still refuse, file a complaint with the Rent Controller or consumer forum.', date:'2026-03-22', read_time:5, likes:83 },
  { id:'seed-3', title:'How to File an RTI Application — Step by Step', author:'Zolvyn Legal Team', category:'RTI & Government', excerpt:'The Right to Information Act 2005 is one of the most powerful tools available to Indian citizens. Here is exactly how to use it.', content:'The Right to Information Act, 2005 is one of the most powerful tools available to Indian citizens.\n\n**Who Can File?**\nAny Indian citizen can file an RTI against any public authority.\n\n**Steps:**\n1. Write your application in English, Hindi, or official state language\n2. Address it to the Public Information Officer (PIO)\n3. Pay the fee of Rs.10 via postal order or online\n4. Clearly state the information you seek\n\n**Time Limit:** The PIO must respond within 30 days.\n\n**Pro tip:** File your RTI online at rtionline.gov.in for central government information.', date:'2026-04-01', read_time:6, likes:112 },
  { id:'seed-4', title:'Consumer Rights in India — Know Before You Buy', author:'Zolvyn Legal Team', category:'Consumer Law', excerpt:'The Consumer Protection Act 2019 gives you powerful rights against defective products, deficient services, and unfair trade practices.', content:'The Consumer Protection Act, 2019 significantly strengthened consumer rights in India.\n\n**Your 6 Core Rights:**\n1. Right to Safety\n2. Right to Information\n3. Right to Choose\n4. Right to be Heard\n5. Right to Redressal\n6. Right to Consumer Education\n\n**Where to Complain:**\n- District Commission: Claims up to Rs.1 crore\n- State Commission: Rs.1–10 crore\n- National Commission: Above Rs.10 crore\n- File online at edaakhil.nic.in\n\n**You can file yourself without a lawyer. Do not let companies exploit you.**', date:'2026-04-05', read_time:5, likes:69 },
];

const IconX = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.26 5.632L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/></svg>);
const IconIG = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>);
const IconLI = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>);

const SOCIALS = [
  { icon:<IconX/>, href:'https://x.com/ZolvynAI', label:'X' },
  { icon:<IconIG/>, href:'https://www.instagram.com/zolvyn.ai?igsh=b2hlcTN0ZzEzNTNn', label:'Instagram' },
  { icon:<IconLI/>, href:'https://www.linkedin.com/company/zolvyn/', label:'LinkedIn' },
];

function NamePopup({ onComplete }: { onComplete: (name: string) => void }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const handleSubmit = async () => {
    if (!name.trim()) { setError(true); return; }
    setError(false); const trimmed = name.trim(); setLoading(true);
    const user = await createUser(trimmed);
    if (!user) storeUser({ id: crypto.randomUUID(), name: trimmed });
    setLoading(false); onComplete(trimmed);
  };
  return (
    <div style={{position:'fixed',inset:0,zIndex:9999,background:'rgba(8,10,15,0.9)',backdropFilter:'blur(10px)',display:'flex',alignItems:'center',justifyContent:'center',padding:'16px'}}>
      <div style={{background:'#0d1018',border:'1px solid #2a3347',borderRadius:'20px',padding:'40px 32px',width:'100%',maxWidth:'420px',position:'relative'}}>
        <div style={{position:'absolute',top:0,left:'50%',transform:'translateX(-50%)',width:'200px',height:'1px',background:'linear-gradient(90deg,transparent,rgba(201,168,76,0.5),transparent)'}}></div>
        <div style={{textAlign:'center',marginBottom:'28px'}}>
          <div style={{fontFamily:"'Outfit',sans-serif",fontWeight:200,fontSize:'18px',letterSpacing:'0.26em',color:'#e8eaf0',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'16px'}}>
            <span>Z</span><span style={{display:'inline-block',width:'13px',height:'13px',border:'1.5px solid #7eb8f7',borderRadius:'50%',margin:'0 3px'}}></span><span>LVYN</span>
          </div>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'24px',fontWeight:300,color:'#e8eaf0',marginBottom:'8px'}}>Welcome to <em style={{color:'#e8c96d'}}>Zolvyn AI</em></div>
          <p style={{fontSize:'13px',color:'#7a8499',fontWeight:300,lineHeight:1.65}}>India's legal intelligence platform. What should we call you?</p>
        </div>
        <input value={name} onChange={e=>{setName(e.target.value);if(error)setError(false);}} onKeyDown={e=>e.key==='Enter'&&handleSubmit()} placeholder="Enter your name…" autoFocus
          style={{width:'100%',background:'#111520',border:error?'1.5px solid #e24b4a':'1.5px solid #1e2535',borderRadius:'11px',color:'#e8eaf0',fontFamily:"'Outfit',sans-serif",fontSize:'15px',fontWeight:300,padding:'13px 16px',outline:'none',marginBottom:error?'6px':'12px'}}/>
        {error&&<p style={{color:'#e24b4a',fontSize:'12px',marginBottom:'10px'}}>Please enter your name to continue</p>}
        <button onClick={handleSubmit} disabled={loading} style={{width:'100%',padding:'13px',borderRadius:'10px',border:'none',background:'linear-gradient(135deg,#c9a84c,#e8c96d)',color:'#0d0a00',fontSize:'14px',fontWeight:600,cursor:'pointer',fontFamily:"'Outfit',sans-serif"}}>
          {loading?'Setting up…':'Start for free →'}
        </button>
        <div style={{marginTop:'16px',paddingTop:'14px',borderTop:'1px solid #1e2535',fontSize:'11px',color:'#3a4258',textAlign:'center'}}>No account needed · No password · No spam</div>
      </div>
    </div>
  );
}

function WriteBlogModal({ onClose, onPublish, authorName }: { onClose:()=>void; onPublish:(p:BlogPost)=>void; authorName:string }) {
  const [title,setTitle]=useState(''); const [category,setCategory]=useState('Legal Rights');
  const [content,setContent]=useState(''); const [loading,setLoading]=useState(false);
  const [errors,setErrors]=useState<Record<string,string>>({}); const [pubErr,setPubErr]=useState('');
  const wc=content.trim().split(/\s+/).filter(Boolean).length;
  const rt=Math.max(1,Math.ceil(wc/200));
  const validate=()=>{
    const e:Record<string,string>={};
    if(!title.trim()||title.trim().length<10) e.title='Title must be at least 10 characters';
    if(!content.trim()||wc<50) e.content='Content must be at least 50 words';
    setErrors(e); return Object.keys(e).length===0;
  };
  const handlePublish=async()=>{
    if(!validate()) return; setLoading(true); setPubErr('');
    const excerpt=content.trim().replace(/\*\*/g,'').slice(0,180)+'…';
    const saved=await createBlog({title:title.trim(),author:authorName||'Anonymous',category,content:content.trim(),excerpt,date:new Date().toISOString().split('T')[0],read_time:rt,likes:0});
    if(!saved){setPubErr('Could not publish. Please check your connection and try again.');setLoading(false);return;}
    setLoading(false); onPublish(saved); onClose();
  };
  return (
    <div style={{position:'fixed',inset:0,zIndex:9999,background:'rgba(8,10,15,0.95)',backdropFilter:'blur(12px)',display:'flex',alignItems:'flex-start',justifyContent:'center',overflowY:'auto',padding:'40px 16px'}}>
      <div style={{background:'#0d1018',border:'1px solid #1e2535',borderRadius:'20px',width:'100%',maxWidth:'760px',padding:'40px',position:'relative'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'32px'}}>
          <div>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'1.8rem',fontWeight:300,color:'#fff'}}>Write a Blog Post</div>
            <div style={{fontSize:'0.78rem',color:'#3a4258',marginTop:'4px'}}>Saved to Supabase — visible to all users immediately</div>
          </div>
          <button onClick={onClose} style={{background:'none',border:'1px solid #1e2535',borderRadius:'8px',color:'#7a8499',fontSize:'18px',width:'36px',height:'36px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>×</button>
        </div>
        <div style={{display:'inline-flex',alignItems:'center',gap:'8px',padding:'6px 14px',borderRadius:'20px',background:'rgba(126,184,247,0.06)',border:'1px solid rgba(126,184,247,0.15)',fontSize:'0.78rem',color:'#7eb8f7',marginBottom:'24px'}}>
          ✍ Writing as <strong style={{color:'#e8eaf0'}}>{authorName||'Anonymous'}</strong>
        </div>
        <div style={{marginBottom:'20px'}}>
          <label style={{fontSize:'0.72rem',letterSpacing:'0.12em',textTransform:'uppercase',color:'#3a4258',display:'block',marginBottom:'8px'}}>Blog Title *</label>
          <input value={title} onChange={e=>{setTitle(e.target.value);setErrors(v=>({...v,title:''}));}}
            placeholder="e.g. How to Protect Yourself Under the Consumer Protection Act 2019"
            style={{width:'100%',background:'#111520',border:errors.title?'1.5px solid #e05555':'1.5px solid #1e2535',borderRadius:'10px',color:'#e8eaf0',fontFamily:"'Outfit',sans-serif",fontSize:'15px',padding:'13px 16px',outline:'none'}}/>
          {errors.title&&<p style={{color:'#e05555',fontSize:'11px',marginTop:'5px'}}>{errors.title}</p>}
        </div>
        <div style={{marginBottom:'20px'}}>
          <label style={{fontSize:'0.72rem',letterSpacing:'0.12em',textTransform:'uppercase',color:'#3a4258',display:'block',marginBottom:'8px'}}>Category *</label>
          <select value={category} onChange={e=>setCategory(e.target.value)}
            style={{width:'100%',background:'#111520',border:'1.5px solid #1e2535',borderRadius:'10px',color:'#e8eaf0',fontFamily:"'Outfit',sans-serif",fontSize:'14px',padding:'13px 16px',outline:'none',cursor:'pointer'}}>
            {BLOG_CATEGORIES.filter(c=>c!=='All').map(c=><option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div style={{marginBottom:'12px'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'8px'}}>
            <label style={{fontSize:'0.72rem',letterSpacing:'0.12em',textTransform:'uppercase',color:'#3a4258'}}>Your Article *</label>
            <span style={{fontSize:'0.72rem',color:wc>=50?'#4caf82':'#3a4258'}}>{wc} words · ~{rt} min read</span>
          </div>
          <textarea value={content} onChange={e=>{setContent(e.target.value);setErrors(v=>({...v,content:''}));}}
            placeholder={'Write your full article here...\n\nTips:\n• Use **bold** for important terms\n• Break into clear paragraphs\n• Cite law sections like "Section 138 NI Act"\n• Write at least 50 words\n• Share practical advice readers can act on'}
            rows={16} style={{width:'100%',background:'#111520',border:errors.content?'1.5px solid #e05555':'1.5px solid #1e2535',borderRadius:'10px',color:'#e8eaf0',fontFamily:"'Outfit',sans-serif",fontSize:'14px',fontWeight:300,lineHeight:1.8,padding:'16px',outline:'none',resize:'vertical'}}/>
          {errors.content&&<p style={{color:'#e05555',fontSize:'11px',marginTop:'5px'}}>{errors.content}</p>}
        </div>
        <div style={{background:'rgba(201,168,76,0.04)',border:'1px solid rgba(201,168,76,0.1)',borderRadius:'8px',padding:'12px 16px',marginBottom:'16px',fontSize:'0.75rem',color:'#5a6478',lineHeight:1.7}}>
          <strong style={{color:'rgba(201,168,76,0.6)'}}>Community Guidelines —</strong> Write about Indian law topics only. Do not give specific legal advice to individuals. Always encourage readers to consult a qualified advocate.
        </div>
        {pubErr&&<div style={{background:'rgba(224,85,85,0.08)',border:'1px solid rgba(224,85,85,0.2)',borderRadius:'8px',padding:'12px 16px',marginBottom:'16px',fontSize:'0.82rem',color:'#e05555'}}>⚠️ {pubErr}</div>}
        <div style={{display:'flex',gap:'12px'}}>
          <button onClick={onClose} style={{flex:1,padding:'13px',borderRadius:'10px',border:'1px solid #1e2535',background:'transparent',color:'#7a8499',fontSize:'14px',cursor:'pointer',fontFamily:"'Outfit',sans-serif"}}>Cancel</button>
          <button onClick={handlePublish} disabled={loading} style={{flex:2,padding:'13px',borderRadius:'10px',border:'none',background:'linear-gradient(135deg,#c9a84c,#e8c96d)',color:'#0d0a00',fontSize:'14px',fontWeight:600,cursor:loading?'not-allowed':'pointer',fontFamily:"'Outfit',sans-serif",opacity:loading?0.7:1}}>
            {loading?'Publishing to Supabase…':'🚀 Publish Article'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ReadBlogModal({ post, onClose, onLike }: { post:BlogPost; onClose:()=>void; onLike:(id:string)=>void }) {
  const [liked,setLiked]=useState(false);
  const paragraphs=post.content.split('\n\n').filter(Boolean);
  const renderPara=(text:string,i:number)=>{
    const html=text.replace(/\*\*(.+?)\*\*/g,'<strong style="color:#e8eaf0">$1</strong>');
    if(text.match(/^\d+\./m)) return <div key={i} style={{margin:'12px 0'}}>{text.split('\n').map((l,j)=><div key={j} style={{fontSize:'0.9rem',color:'#9aa3b2',lineHeight:1.8,fontWeight:300,padding:'2px 0'}} dangerouslySetInnerHTML={{__html:l.replace(/\*\*(.+?)\*\*/g,'<strong style="color:#e8eaf0">$1</strong>')}}/>)}</div>;
    return <p key={i} style={{fontSize:'0.9rem',color:'#9aa3b2',lineHeight:1.85,fontWeight:300,margin:'12px 0'}} dangerouslySetInnerHTML={{__html:html}}/>;
  };
  return (
    <div style={{position:'fixed',inset:0,zIndex:9999,background:'rgba(8,10,15,0.97)',backdropFilter:'blur(12px)',display:'flex',alignItems:'flex-start',justifyContent:'center',overflowY:'auto',padding:'40px 16px'}} onClick={onClose}>
      <div style={{background:'#0d1018',border:'1px solid #1e2535',borderRadius:'20px',width:'100%',maxWidth:'720px',padding:'40px',position:'relative'}} onClick={e=>e.stopPropagation()}>
        <button onClick={onClose} style={{position:'absolute',top:'20px',right:'20px',background:'none',border:'1px solid #1e2535',borderRadius:'8px',color:'#7a8499',fontSize:'18px',width:'36px',height:'36px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>×</button>
        <div style={{display:'inline-block',padding:'3px 10px',borderRadius:'4px',background:'rgba(126,184,247,0.08)',border:'1px solid rgba(126,184,247,0.15)',fontSize:'0.68rem',color:'#7eb8f7',letterSpacing:'0.08em',marginBottom:'16px'}}>{post.category}</div>
        <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'clamp(1.5rem,4vw,2.2rem)',fontWeight:300,color:'#fff',lineHeight:1.2,marginBottom:'16px'}}>{post.title}</h2>
        <div style={{display:'flex',alignItems:'center',gap:'16px',marginBottom:'32px',paddingBottom:'24px',borderBottom:'1px solid #1e2535',flexWrap:'wrap'}}>
          <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
            <div style={{width:'28px',height:'28px',borderRadius:'50%',background:'rgba(201,168,76,0.15)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'11px',color:'#c9a84c',fontWeight:600}}>{post.author.charAt(0).toUpperCase()}</div>
            <span style={{fontSize:'13px',color:'#9aa3b2'}}>{post.author}</span>
          </div>
          <span style={{fontSize:'12px',color:'#3a4258'}}>{new Date(post.date).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}</span>
          <span style={{fontSize:'12px',color:'#3a4258'}}>{post.read_time} min read</span>
        </div>
        <div style={{marginBottom:'32px'}}>{paragraphs.map(renderPara)}</div>
        <div style={{paddingTop:'24px',borderTop:'1px solid #1e2535',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'12px'}}>
          <button onClick={()=>{if(!liked){setLiked(true);onLike(post.id);}}}
            style={{display:'flex',alignItems:'center',gap:'8px',background:liked?'rgba(201,168,76,0.1)':'rgba(201,168,76,0.06)',border:`1px solid rgba(201,168,76,${liked?'0.4':'0.15'})`,borderRadius:'8px',padding:'8px 18px',color:'#c9a84c',fontSize:'13px',cursor:liked?'default':'pointer',fontFamily:"'Outfit',sans-serif"}}>
            {liked?'♥':'♡'} {post.likes+(liked?1:0)} Helpful
          </button>
          <div style={{fontSize:'12px',color:'#3a4258'}}>⚖️ For informational purposes only. Consult a lawyer for specific advice.</div>
        </div>
      </div>
    </div>
  );
}

function BlogCard({ post, onClick }: { post:BlogPost; onClick:()=>void }) {
  return (
    <div onClick={onClick} style={{background:'#0d1018',border:'1px solid #1e2535',borderRadius:'14px',padding:'24px',cursor:'pointer',transition:'all 0.2s',display:'flex',flexDirection:'column',gap:'12px'}}
      onMouseEnter={e=>{const d=e.currentTarget as HTMLDivElement;d.style.borderColor='#2a3347';d.style.transform='translateY(-2px)';}}
      onMouseLeave={e=>{const d=e.currentTarget as HTMLDivElement;d.style.borderColor='#1e2535';d.style.transform='none';}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <span style={{padding:'3px 10px',borderRadius:'4px',background:'rgba(126,184,247,0.08)',border:'1px solid rgba(126,184,247,0.12)',fontSize:'0.68rem',color:'#7eb8f7'}}>{post.category}</span>
        <span style={{fontSize:'0.72rem',color:'#3a4258'}}>{post.read_time} min read</span>
      </div>
      <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'1.15rem',fontWeight:500,color:'#e8eaf0',lineHeight:1.3}}>{post.title}</h3>
      <p style={{fontSize:'0.82rem',color:'#7a8499',lineHeight:1.75,fontWeight:300,flex:1}}>{post.excerpt}</p>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',paddingTop:'12px',borderTop:'1px solid #1a2030'}}>
        <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
          <div style={{width:'22px',height:'22px',borderRadius:'50%',background:'rgba(201,168,76,0.12)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'9px',color:'#c9a84c',fontWeight:700}}>{post.author.charAt(0).toUpperCase()}</div>
          <span style={{fontSize:'0.75rem',color:'#4a5568'}}>{post.author}</span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
          <span style={{fontSize:'0.72rem',color:'#3a4258'}}>♥ {post.likes}</span>
          <span style={{fontSize:'0.72rem',color:'#4a5568'}}>{new Date(post.date).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</span>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [openFaq,setOpenFaq]=useState<number|null>(null);
  const [yearly,setYearly]=useState(true);
  const [showPopup,setShowPopup]=useState(false);
  const [userName,setUserName]=useState<string|null>(null);
  const [mobileMenuOpen,setMobileMenuOpen]=useState(false);
  const [blogCategory,setBlogCategory]=useState('All');
  const [showWriteModal,setShowWriteModal]=useState(false);
  const [selectedPost,setSelectedPost]=useState<BlogPost|null>(null);
  const [blogs,setBlogs]=useState<BlogPost[]>([]);
  const [blogsLoading,setBlogsLoading]=useState(true);
  const [blogSearch,setBlogSearch]=useState('');
  const [expandedFeature,setExpandedFeature]=useState<number|null>(null);
  const [activeSection,setActiveSection]=useState('home');

  useEffect(()=>{
    const user=getStoredUser();
    if(user){setUserName(user.name);trackPageVisit('landing');}
    else setTimeout(()=>setShowPopup(true),1000);
    loadBlogs();
    const handleScroll=()=>{
      const sections=['home','features','how','about','blog','pricing','faq'];
      for(const id of [...sections].reverse()){const el=document.getElementById(id);if(el&&window.scrollY>=el.offsetTop-100){setActiveSection(id);break;}}
    };
    window.addEventListener('scroll',handleScroll,{passive:true});
    return ()=>window.removeEventListener('scroll',handleScroll);
  },[]);

  const loadBlogs=async()=>{setBlogsLoading(true);const data=await getBlogs();setBlogs(data&&data.length>0?data:[]);setBlogsLoading(false);};
  const handleNameComplete=(name:string)=>{setUserName(name);setShowPopup(false);trackPageVisit('landing');};
  const handlePublish=(post:BlogPost)=>setBlogs(prev=>[post,...prev]);
  const handleLike=async(id:string)=>{
    setBlogs(prev=>prev.map(p=>p.id===id?{...p,likes:p.likes+1}:p));
    if(selectedPost?.id===id) setSelectedPost(prev=>prev?{...prev,likes:prev.likes+1}:null);
    await likeBlog(id);
  };

  const allPosts=blogs.length>0?blogs:SEED_POSTS;
  const filteredPosts=allPosts.filter(p=>{
    const mc=blogCategory==='All'||p.category===blogCategory;
    const ms=!blogSearch||p.title.toLowerCase().includes(blogSearch.toLowerCase())||p.excerpt.toLowerCase().includes(blogSearch.toLowerCase());
    return mc&&ms;
  });
  const prices={std:yearly?{price:'299',period:'/year'}:{price:'49',period:'/month'},pro:yearly?{price:'899',period:'/year'}:{price:'299',period:'/month'}};
  const NAV=[['Features','#features'],['How it works','#how'],['About','#about'],['Blog','#blog'],['Pricing','#pricing'],['FAQ','#faq']];

  const S=(href:string,children:React.ReactNode,extra?:React.CSSProperties)=>(
    <a href={href} target="_blank" rel="noopener noreferrer"
      style={{width:'38px',height:'38px',borderRadius:'9px',border:'1px solid #1e2535',background:'#0d1018',display:'flex',alignItems:'center',justifyContent:'center',color:'#4a5568',transition:'all 0.2s',cursor:'pointer',...extra}}
      onMouseEnter={e=>{(e.currentTarget as HTMLAnchorElement).style.color='#e8eaf0';(e.currentTarget as HTMLAnchorElement).style.borderColor='#4a5568';}}
      onMouseLeave={e=>{(e.currentTarget as HTMLAnchorElement).style.color='#4a5568';(e.currentTarget as HTMLAnchorElement).style.borderColor='#1e2535';}}>
      {children}
    </a>
  );

  return (
    <div style={{background:'#080a0f',color:'#e8eaf0',fontFamily:"'Outfit',sans-serif",overflowX:'hidden'}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,600&family=Outfit:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0} html{scroll-behavior:smooth}
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-thumb{background:#2a3347;border-radius:2px}
        @keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.7)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .nl:hover{color:#e8eaf0 !important} .fc:hover{background:#111520 !important;cursor:pointer}
        .pc:hover{transform:translateY(-4px)} .fq:hover{color:#e8eaf0 !important}
        .fl:hover{color:#9aa3b2 !important} input::placeholder{color:#4a5568} textarea::placeholder{color:#4a5568}
        input,textarea,select{outline:none} .tp:hover{border-color:#7eb8f7 !important}
        .af:hover{border-color:#2a3347 !important} .bc:hover{background:rgba(126,184,247,0.1) !important;color:#7eb8f7 !important}
        .ndl{display:flex} .ndc{display:flex} .nh{display:none} .mm{display:none}
        @media(max-width:768px){
          .ndl{display:none !important} .ndc{display:none !important} .nh{display:flex !important} .mm.open{display:flex !important}
          .hs{padding:100px 20px 60px !important} .ht{font-size:clamp(2.2rem,10vw,3.5rem) !important}
          .hb{flex-direction:column !important;width:100% !important} .hb a{width:100% !important;text-align:center !important}
          .hst{gap:20px !important} .sp{padding:60px 20px !important}
          .fg{grid-template-columns:1fr !important} .fc{border-right:none !important;border-bottom:1px solid #1e2535 !important}
          .hg{grid-template-columns:1fr !important} .hstep{border-right:none !important;border-bottom:1px solid #1e2535 !important}
          .pg{grid-template-columns:1fr !important;max-width:420px !important;margin:0 auto !important}
          .fi{flex-direction:column !important;gap:16px !important}
          .ag{grid-template-columns:1fr !important} .asg{grid-template-columns:1fr 1fr !important}
          .tg{grid-template-columns:1fr 1fr !important} .bg{grid-template-columns:1fr !important}
          nav{padding:0 20px !important} .fcg{grid-template-columns:1fr 1fr !important;gap:32px !important}
        }
      `}</style>

      {showPopup&&<NamePopup onComplete={handleNameComplete}/>}
      {showWriteModal&&<WriteBlogModal onClose={()=>setShowWriteModal(false)} onPublish={handlePublish} authorName={userName||'Anonymous'}/>}
      {selectedPost&&<ReadBlogModal post={selectedPost} onClose={()=>setSelectedPost(null)} onLike={handleLike}/>}

      {/* NAV */}
      <nav style={{position:'fixed',top:0,left:0,right:0,zIndex:100,height:'64px',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 60px',background:'rgba(8,10,15,0.88)',backdropFilter:'blur(20px)',borderBottom:'1px solid rgba(30,37,53,0.6)'}}>
        <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
          <div style={{fontFamily:"'Outfit',sans-serif",fontWeight:300,fontSize:'1.05rem',letterSpacing:'0.26em',color:'#fff',display:'flex',alignItems:'center'}}>
            <span>Z</span><span style={{display:'inline-block',width:'13px',height:'13px',border:'1.5px solid #7eb8f7',borderRadius:'50%',margin:'0 3px',boxShadow:'0 0 8px rgba(126,184,247,0.3)'}}></span><span style={{paddingRight:'0.18em'}}>LVYN</span>
          </div>
          <div style={{width:'1px',height:'18px',background:'#2a3347'}}></div>
          <div style={{fontSize:'9px',letterSpacing:'0.18em',color:'#3a4258',textTransform:'uppercase',fontWeight:300}}>Legal Intelligence</div>
        </div>
        <div className="ndl" style={{alignItems:'center',gap:'28px'}}>
          {NAV.map(([l,h])=><a key={l} href={h} className="nl" style={{fontSize:'0.8rem',color:activeSection===h.replace('#','')?'#e8eaf0':'#7a8499',textDecoration:'none',transition:'color .2s',borderBottom:activeSection===h.replace('#','')?'1px solid rgba(201,168,76,0.4)':'none',paddingBottom:'2px'}}>{l}</a>)}
        </div>
        <div className="ndc" style={{gap:'10px',alignItems:'center'}}>
          <a href="/chat" style={{padding:'8px 20px',border:'1px solid #252d40',background:'transparent',color:'#7a8499',borderRadius:'7px',fontSize:'0.8rem',textDecoration:'none'}}>{userName?`Hi, ${userName}`:'Sign in'}</a>
          <a href="/chat" style={{padding:'8px 22px',background:'linear-gradient(135deg,#c9a84c,#e8c96d)',color:'#0d0a00',borderRadius:'7px',fontSize:'0.8rem',fontWeight:600,textDecoration:'none'}}>Try free →</a>
        </div>
        <button className="nh" onClick={()=>setMobileMenuOpen(!mobileMenuOpen)} style={{display:'none',flexDirection:'column',gap:'5px',background:'none',border:'none',cursor:'pointer',padding:'4px',zIndex:110}}>
          <span style={{display:'block',width:'22px',height:'2px',background:mobileMenuOpen?'#c9a84c':'#e8eaf0',transition:'all 0.3s',transform:mobileMenuOpen?'translateY(7px) rotate(45deg)':'none'}}></span>
          <span style={{display:'block',width:'22px',height:'2px',background:'#e8eaf0',transition:'all 0.3s',opacity:mobileMenuOpen?0:1}}></span>
          <span style={{display:'block',width:'22px',height:'2px',background:mobileMenuOpen?'#c9a84c':'#e8eaf0',transition:'all 0.3s',transform:mobileMenuOpen?'translateY(-7px) rotate(-45deg)':'none'}}></span>
        </button>
      </nav>

      <div className={`mm ${mobileMenuOpen?'open':''}`} style={{position:'fixed',inset:0,zIndex:99,background:'rgba(8,10,15,0.97)',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'28px',display:'none'}}>
        {NAV.map(([l,h])=><a key={l} href={h} onClick={()=>setMobileMenuOpen(false)} style={{fontSize:'1.4rem',color:'#e8eaf0',textDecoration:'none',fontFamily:"'Cormorant Garamond',serif",fontWeight:300}}>{l}</a>)}
        <div style={{height:'1px',width:'60px',background:'#1e2535'}}></div>
        <a href="/chat" onClick={()=>setMobileMenuOpen(false)} style={{padding:'14px 48px',background:'linear-gradient(135deg,#c9a84c,#e8c96d)',color:'#0d0a00',borderRadius:'9px',fontSize:'1rem',fontWeight:600,textDecoration:'none'}}>Try free →</a>
      </div>

      {/* HERO */}
      <section id="home" className="hs" style={{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'120px 60px 80px',position:'relative',overflow:'hidden',textAlign:'center'}}>
        <div style={{position:'absolute',top:'20%',left:'50%',transform:'translateX(-50%)',width:'700px',height:'700px',borderRadius:'50%',background:'radial-gradient(ellipse,rgba(126,184,247,0.07) 0%,transparent 70%)',pointerEvents:'none'}}></div>
        <div style={{display:'inline-flex',alignItems:'center',gap:'8px',padding:'5px 14px',borderRadius:'20px',border:'1px solid rgba(126,184,247,0.2)',background:'rgba(126,184,247,0.06)',fontSize:'0.7rem',letterSpacing:'0.12em',color:'#7eb8f7',textTransform:'uppercase',fontWeight:500,marginBottom:'32px'}}>
          <span style={{width:'5px',height:'5px',borderRadius:'50%',background:'#7eb8f7',animation:'pulse 2s ease infinite',display:'inline-block'}}></span>
          India's most advanced legal AI platform
        </div>
        <h1 className="ht" style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'clamp(2.8rem,7vw,6rem)',fontWeight:300,lineHeight:1.05,color:'#fff',marginBottom:'12px'}}>
          Know Your Rights.<br/><em style={{fontStyle:'italic',color:'#7eb8f7'}}>Instantly.</em>
        </h1>
        <p style={{fontSize:'clamp(0.9rem,2.5vw,1.05rem)',fontWeight:300,color:'#7a8499',maxWidth:'560px',lineHeight:1.75,margin:'0 auto 48px',padding:'0 8px'}}>
          <strong style={{color:'#e8eaf0',fontWeight:400}}>Zolvyn</strong> gives every Indian access to expert legal intelligence — understand any law, analyze contracts, generate real court-ready documents, and get clarity on your case outcomes.
        </p>
        <div className="hb" style={{display:'flex',gap:'14px',justifyContent:'center',flexWrap:'wrap',marginBottom:'64px',width:'100%',maxWidth:'480px'}}>
          <a href="/chat" style={{padding:'14px 36px',background:'linear-gradient(135deg,#c9a84c,#e8c96d)',color:'#0d0a00',borderRadius:'9px',fontSize:'0.95rem',fontWeight:600,textDecoration:'none',fontFamily:"'Outfit',sans-serif"}}>Start for free →</a>
          <a href="#how" style={{padding:'14px 36px',background:'transparent',border:'1px solid #252d40',color:'#7a8499',borderRadius:'9px',fontSize:'0.95rem',textDecoration:'none',fontFamily:"'Outfit',sans-serif"}}>▶ See how it works</a>
        </div>
        <div className="hst" style={{display:'flex',gap:'48px',justifyContent:'center',flexWrap:'wrap'}}>
          {[['50+','Indian laws covered'],['12+','Document templates'],['100%','Private & secure'],['₹0','To start today']].map(([num,label])=>(
            <div key={label} style={{textAlign:'center'}}>
              <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'2rem',fontWeight:600,color:'#fff',lineHeight:1}}>{num}</div>
              <div style={{fontSize:'0.72rem',color:'#3a4258',letterSpacing:'0.08em',marginTop:'4px'}}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* MARQUEE */}
      <div style={{padding:'20px 0',borderTop:'1px solid #1e2535',borderBottom:'1px solid #1e2535',overflow:'hidden'}}>
        <div style={{display:'flex',gap:'48px',whiteSpace:'nowrap',animation:'marquee 25s linear infinite'}}>
          {[...MARQUEE_ITEMS,...MARQUEE_ITEMS].map((item,i)=>(
            <span key={i} style={{fontSize:'0.72rem',letterSpacing:'0.14em',textTransform:'uppercase',color:'#3a4258',flexShrink:0,display:'inline-flex',alignItems:'center',gap:'12px'}}>
              <span style={{width:'4px',height:'4px',borderRadius:'50%',background:'#7eb8f7',display:'inline-block'}}></span>{item}
            </span>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <section id="features" className="sp" style={{padding:'100px 60px',maxWidth:'1200px',margin:'0 auto'}}>
        <div style={{fontSize:'0.68rem',letterSpacing:'0.16em',textTransform:'uppercase',color:'#7eb8f7',fontWeight:500,marginBottom:'16px'}}>What Zolvyn does</div>
        <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'clamp(1.8rem,4vw,3.2rem)',fontWeight:300,color:'#fff',lineHeight:1.15,marginBottom:'16px'}}>One platform. <em style={{fontStyle:'italic',color:'#7eb8f7'}}>Every legal need.</em></h2>
        <p style={{fontSize:'0.95rem',color:'#7a8499',maxWidth:'500px',lineHeight:1.75,fontWeight:300,marginBottom:'48px'}}>Built for citizens, lawyers, law students, and professionals across India.</p>
        <div className="fg" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'2px',border:'1px solid #1e2535',borderRadius:'16px',overflow:'hidden'}}>
          {FEATURES.map((f,i)=>(
            <a key={f.title} href={f.href} className="fc" style={{padding:'36px 28px',background:'#0d1018',transition:'background .25s',borderRight:i%2===0?'1px solid #1e2535':'none',borderBottom:i<2?'1px solid #1e2535':'none',textDecoration:'none',display:'block'}}>
              <div style={{width:'44px',height:'44px',borderRadius:'10px',background:'rgba(126,184,247,0.08)',border:'1px solid rgba(126,184,247,0.15)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'18px',fontSize:'20px'}}>{f.icon}</div>
              <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'1.3rem',fontWeight:500,color:'#fff',marginBottom:'8px'}}>{f.title}</h3>
              <p style={{fontSize:'0.85rem',color:'#7a8499',lineHeight:1.75,fontWeight:300,marginBottom:'14px'}}>{f.desc}</p>
              <div style={{display:'flex',gap:'6px',flexWrap:'wrap'}}>
                {f.tags.map(tag=><span key={tag} style={{padding:'3px 10px',borderRadius:'4px',fontSize:'0.68rem',fontFamily:"'JetBrains Mono',monospace",background:'rgba(126,184,247,0.08)',color:'#7eb8f7',border:'1px solid rgba(126,184,247,0.12)'}}>{tag}</span>)}
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="sp" style={{padding:'100px 60px',background:'#0d1018',borderTop:'1px solid #1e2535',borderBottom:'1px solid #1e2535'}}>
        <div style={{maxWidth:'1200px',margin:'0 auto'}}>
          <div style={{fontSize:'0.68rem',letterSpacing:'0.16em',textTransform:'uppercase',color:'#7eb8f7',fontWeight:500,marginBottom:'16px'}}>Simple process</div>
          <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'clamp(1.8rem,4vw,3.2rem)',fontWeight:300,color:'#fff',marginBottom:'48px'}}>From question to <em style={{fontStyle:'italic',color:'#7eb8f7'}}>clarity in seconds.</em></h2>
          <div className="hg" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',border:'1px solid #1e2535',borderRadius:'14px',overflow:'hidden'}}>
            {STEPS.map((step,i)=>(
              <div key={step.num} className="hstep" style={{padding:'32px 24px',background:'#0d1018',borderRight:i<3?'1px solid #1e2535':'none'}}>
                <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'3rem',fontWeight:300,color:'#2a3347',lineHeight:1,marginBottom:'14px'}}>{step.num}</div>
                <div style={{fontSize:'0.9rem',fontWeight:500,color:'#e8eaf0',marginBottom:'8px'}}>{step.title}</div>
                <div style={{fontSize:'0.8rem',color:'#7a8499',lineHeight:1.7,fontWeight:300}}>{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="sp" style={{padding:'100px 60px'}}>
        <div style={{maxWidth:'1200px',margin:'0 auto'}}>
          <div style={{maxWidth:'680px',marginBottom:'64px'}}>
            <div style={{fontSize:'0.68rem',letterSpacing:'0.16em',textTransform:'uppercase',color:'#7eb8f7',fontWeight:500,marginBottom:'16px'}}>About Zolvyn</div>
            <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'clamp(1.8rem,4vw,3.2rem)',fontWeight:300,color:'#fff',lineHeight:1.15,marginBottom:'20px'}}>Built to make India's legal system <em style={{fontStyle:'italic',color:'#7eb8f7'}}>accessible to everyone.</em></h2>
            <p style={{fontSize:'0.95rem',color:'#7a8499',lineHeight:1.85,fontWeight:300,marginBottom:'16px'}}>Zolvyn was born from a simple observation: India has over 1.4 billion people and one of the world's most complex legal systems, yet legal help remains expensive, inaccessible, and intimidating for most citizens.</p>
            <p style={{fontSize:'0.95rem',color:'#7a8499',lineHeight:1.85,fontWeight:300}}>We built Zolvyn to change that. By combining the latest large language models with a deep understanding of Indian law, we give every citizen access to expert-level legal intelligence in seconds.</p>
          </div>
          <div className="asg" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'2px',border:'1px solid #1e2535',borderRadius:'14px',overflow:'hidden',marginBottom:'64px'}}>
            {ABOUT_STATS.map((s,i)=>(
              <div key={s.label} style={{padding:'28px 20px',background:'#0d1018',borderRight:i<3?'1px solid #1e2535':'none',textAlign:'center'}}>
                <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'2.8rem',fontWeight:300,color:'#c9a84c',lineHeight:1}}>{s.num}</div>
                <div style={{fontSize:'0.75rem',color:'#4a5568',marginTop:'6px',letterSpacing:'0.06em'}}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{marginBottom:'48px'}}>
            <div style={{fontSize:'0.75rem',letterSpacing:'0.12em',textTransform:'uppercase',color:'#4a5568',marginBottom:'24px'}}>Our Modules — In Deep Detail</div>
            <div className="ag" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
              {ABOUT_FEATURES_DEEP.map((f,i)=>(
                <div key={f.title} className="af" style={{border:'1px solid #1e2535',borderRadius:'12px',overflow:'hidden',transition:'border-color 0.2s',cursor:'pointer'}} onClick={()=>setExpandedFeature(expandedFeature===i?null:i)}>
                  <div style={{padding:'24px',display:'flex',alignItems:'flex-start',gap:'16px'}}>
                    <div style={{width:'40px',height:'40px',borderRadius:'10px',background:'rgba(201,168,76,0.08)',border:'1px solid rgba(201,168,76,0.15)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px',flexShrink:0}}>{f.icon}</div>
                    <div style={{flex:1}}>
                      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:'12px'}}>
                        <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'1.1rem',fontWeight:500,color:'#e8eaf0',lineHeight:1.3}}>{f.title}</h3>
                        <span style={{color:'#3a4258',fontSize:'14px',transform:expandedFeature===i?'rotate(180deg)':'none',transition:'transform 0.2s',flexShrink:0}}>∨</span>
                      </div>
                      <p style={{fontSize:'0.82rem',color:'#7a8499',lineHeight:1.7,fontWeight:300,marginTop:'8px'}}>{f.desc}</p>
                    </div>
                  </div>
                  {expandedFeature===i&&(
                    <div style={{padding:'0 24px 24px',paddingLeft:'80px'}}>
                      {f.details.map(d=>(
                        <div key={d} style={{display:'flex',alignItems:'flex-start',gap:'10px',fontSize:'0.8rem',color:'#9aa3b2',fontWeight:300,lineHeight:1.6,padding:'4px 0'}}>
                          <span style={{color:'#c9a84c',fontSize:'10px',marginTop:'4px',flexShrink:0}}>✦</span>{d}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div style={{borderTop:'1px solid #1e2535',paddingTop:'48px',marginBottom:'48px'}}>
            <div style={{fontSize:'0.75rem',letterSpacing:'0.12em',textTransform:'uppercase',color:'#4a5568',marginBottom:'20px'}}>Powered by</div>
            <div className="tg" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'10px'}}>
              {TECH_STACK.map(t=>(
                <div key={t.name} className="tp" style={{padding:'14px 18px',border:'1px solid #1e2535',borderRadius:'10px',background:'#0d1018',transition:'all 0.2s',cursor:'default'}}>
                  <div style={{fontSize:'0.85rem',fontWeight:500,color:'#e8eaf0',marginBottom:'3px',fontFamily:"'JetBrains Mono',monospace"}}>{t.name}</div>
                  <div style={{fontSize:'0.72rem',color:'#3a4258'}}>{t.desc}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{padding:'32px',background:'rgba(126,184,247,0.03)',border:'1px solid rgba(126,184,247,0.08)',borderLeft:'3px solid rgba(126,184,247,0.3)',borderRadius:'12px'}}>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'1.5rem',fontStyle:'italic',fontWeight:300,color:'#e8eaf0',lineHeight:1.5,marginBottom:'12px'}}>"Legal intelligence should not be a luxury. Every Indian deserves to know their rights."</div>
            <div style={{fontSize:'0.78rem',color:'#3a4258',letterSpacing:'0.08em'}}>— The Zolvyn Team · Made in India 🇮🇳</div>
          </div>
        </div>
      </section>

      {/* BLOG */}
      <section id="blog" className="sp" style={{padding:'100px 60px',background:'#0d1018',borderTop:'1px solid #1e2535'}}>
        <div style={{maxWidth:'1200px',margin:'0 auto'}}>
          <div style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',flexWrap:'wrap',gap:'20px',marginBottom:'40px'}}>
            <div>
              <div style={{fontSize:'0.68rem',letterSpacing:'0.16em',textTransform:'uppercase',color:'#7eb8f7',fontWeight:500,marginBottom:'16px'}}>Legal Blog</div>
              <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'clamp(1.8rem,4vw,3.2rem)',fontWeight:300,color:'#fff',lineHeight:1.15}}>Legal knowledge, <em style={{fontStyle:'italic',color:'#7eb8f7'}}>written by India.</em></h2>
              <p style={{fontSize:'0.88rem',color:'#7a8499',marginTop:'8px',fontWeight:300}}>Anyone can write and publish. Posts saved to Supabase — everyone sees every article instantly.</p>
            </div>
            <button onClick={()=>{if(!userName){setShowPopup(true);return;}setShowWriteModal(true);}}
              style={{padding:'12px 28px',background:'linear-gradient(135deg,#c9a84c,#e8c96d)',border:'none',color:'#0d0a00',borderRadius:'9px',fontSize:'0.88rem',fontWeight:600,cursor:'pointer',fontFamily:"'Outfit',sans-serif",whiteSpace:'nowrap',transition:'box-shadow 0.2s'}}
              onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.boxShadow='0 0 20px rgba(201,168,76,0.25)'}
              onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.boxShadow='none'}>
              ✍ Write an Article
            </button>
          </div>
          <div style={{display:'flex',gap:'12px',flexWrap:'wrap',marginBottom:'24px',alignItems:'center'}}>
            <div style={{flex:'1',minWidth:'220px',position:'relative'}}>
              <span style={{position:'absolute',left:'14px',top:'50%',transform:'translateY(-50%)',color:'#3a4258',fontSize:'14px'}}>🔍</span>
              <input value={blogSearch} onChange={e=>setBlogSearch(e.target.value)} placeholder="Search articles…"
                style={{width:'100%',background:'#111520',border:'1.5px solid #1e2535',borderRadius:'9px',color:'#e8eaf0',fontFamily:"'Outfit',sans-serif",fontSize:'14px',fontWeight:300,padding:'10px 14px 10px 38px'}}/>
            </div>
            <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
              {BLOG_CATEGORIES.slice(0,6).map(cat=>(
                <button key={cat} className="bc" onClick={()=>setBlogCategory(cat)}
                  style={{padding:'8px 14px',borderRadius:'20px',border:'1px solid #1e2535',background:blogCategory===cat?'rgba(126,184,247,0.1)':'transparent',color:blogCategory===cat?'#7eb8f7':'#4a5568',fontSize:'0.75rem',cursor:'pointer',fontFamily:"'Outfit',sans-serif",transition:'all 0.2s'}}>
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div style={{display:'flex',gap:'24px',marginBottom:'28px',padding:'12px 20px',background:'#080a0f',borderRadius:'10px',border:'1px solid #1a2030',flexWrap:'wrap',alignItems:'center'}}>
            <span style={{fontSize:'0.78rem',color:'#3a4258'}}>📚 {allPosts.length} articles</span>
            <span style={{fontSize:'0.78rem',color:'#3a4258'}}>✍ {blogs.length} from community</span>
            <span style={{fontSize:'0.78rem',color:'#3a4258'}}>♥ {allPosts.reduce((a,p)=>a+p.likes,0)} helpful votes</span>
            {blogsLoading&&<span style={{fontSize:'0.72rem',color:'#7eb8f7',display:'flex',alignItems:'center',gap:'6px'}}><span style={{width:'10px',height:'10px',border:'1.5px solid #7eb8f7',borderTopColor:'transparent',borderRadius:'50%',display:'inline-block',animation:'spin 0.8s linear infinite'}}></span>Loading from Supabase…</span>}
          </div>
          {filteredPosts.length>0?(
            <div className="bg" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'16px'}}>
              {filteredPosts.map(post=><BlogCard key={post.id} post={post} onClick={()=>setSelectedPost(post)}/>)}
            </div>
          ):(
            <div style={{textAlign:'center',padding:'60px 20px',border:'1px dashed #1e2535',borderRadius:'14px'}}>
              <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'1.5rem',color:'#2a3347',marginBottom:'8px'}}>No articles found</div>
              <p style={{fontSize:'0.85rem',color:'#3a4258'}}>Try a different search or category, or be the first to write one!</p>
              <button onClick={()=>{if(!userName){setShowPopup(true);return;}setShowWriteModal(true);}}
                style={{marginTop:'16px',padding:'10px 24px',background:'linear-gradient(135deg,#c9a84c,#e8c96d)',border:'none',color:'#0d0a00',borderRadius:'8px',fontSize:'0.85rem',fontWeight:600,cursor:'pointer',fontFamily:"'Outfit',sans-serif"}}>
                Write First Article
              </button>
            </div>
          )}
          <div style={{marginTop:'40px',padding:'28px 32px',background:'rgba(201,168,76,0.04)',border:'1px solid rgba(201,168,76,0.1)',borderRadius:'14px',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'16px'}}>
            <div>
              <div style={{fontSize:'1rem',fontWeight:500,color:'#e8eaf0',marginBottom:'4px'}}>Have legal knowledge to share?</div>
              <div style={{fontSize:'0.82rem',color:'#4a5568',fontWeight:300}}>Write about Indian laws, rights, procedures — your article goes live for all users immediately.</div>
            </div>
            <button onClick={()=>{if(!userName){setShowPopup(true);return;}setShowWriteModal(true);}}
              style={{padding:'11px 26px',background:'linear-gradient(135deg,#c9a84c,#e8c96d)',border:'none',color:'#0d0a00',borderRadius:'8px',fontSize:'0.85rem',fontWeight:600,cursor:'pointer',fontFamily:"'Outfit',sans-serif",whiteSpace:'nowrap'}}>
              ✍ Start Writing
            </button>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="sp" style={{padding:'100px 60px',borderTop:'1px solid #1e2535'}}>
        <div style={{maxWidth:'1100px',margin:'0 auto'}}>
          <div style={{fontSize:'0.68rem',letterSpacing:'0.16em',textTransform:'uppercase',color:'#7eb8f7',fontWeight:500,marginBottom:'16px',textAlign:'center'}}>Simple pricing</div>
          <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'clamp(1.8rem,4vw,3.2rem)',fontWeight:300,color:'#fff',textAlign:'center',marginBottom:'28px'}}>Start free. <em style={{fontStyle:'italic',color:'#7eb8f7'}}>Scale when ready.</em></h2>
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'14px',marginBottom:'48px'}}>
            <span style={{fontSize:'13px',color:yearly?'#7a8499':'#e8eaf0'}}>Monthly</span>
            <div onClick={()=>setYearly(!yearly)} style={{width:'44px',height:'24px',borderRadius:'12px',background:yearly?'linear-gradient(135deg,#c9a84c,#e8c96d)':'#1e2535',cursor:'pointer',position:'relative',transition:'background 0.25s'}}>
              <div style={{position:'absolute',top:'3px',left:yearly?'23px':'3px',width:'18px',height:'18px',borderRadius:'50%',background:'#fff',transition:'left 0.25s'}}></div>
            </div>
            <span style={{fontSize:'13px',color:yearly?'#e8eaf0':'#7a8499'}}>Yearly</span>
            {yearly&&<span style={{fontSize:'11px',padding:'2px 8px',borderRadius:'20px',background:'rgba(76,175,130,0.1)',color:'#4caf82',border:'1px solid rgba(76,175,130,0.25)'}}>Save 25%</span>}
          </div>
          <div className="pg" style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',border:'1px solid #1e2535',borderRadius:'16px',overflow:'hidden'}}>
            {[
              {name:'Free',price:'0',period:'',sub:'Forever free · No card needed',color:'#7a8499',features:['5 legal queries per day','Legal Q&A with law references','Basic contract summary','2 document templates','Chat history — 7 days'],cta:'Get started free',href:'/chat',gold:false},
              {name:'Standard',price:prices.std.price,period:prices.std.period,sub:yearly?'Billed annually':'Billed monthly',color:'#c9a84c',features:['50 queries per day','Full structured legal answers','Complete contract analysis','All 12+ document templates','PDF downloads','Chat history forever'],cta:'Get Standard →',href:'/chat',gold:true},
              {name:'Pro',price:prices.pro.price,period:prices.pro.period,sub:yearly?'Billed annually':'Billed monthly',color:'#e8c96d',popular:true,features:['Unlimited queries, always','Full answers with all sources','Deep contract analysis + PDF','All 12+ templates + priority','Case predictor + FIR analyzer','Similar past case outcomes','Priority AI speed','Email support'],cta:'Upgrade to Pro →',href:'/upgrade',gold:true},
            ].map((plan,i)=>(
              <div key={plan.name} className="pc" style={{padding:'32px 24px',background:i===2?'linear-gradient(135deg,rgba(201,168,76,0.05),rgba(126,184,247,0.02))':'#0d1018',borderRight:i<2?'1px solid #1e2535':'none',position:'relative',transition:'transform 0.2s'}}>
                {(plan as any).popular&&<div style={{position:'absolute',top:'-1px',left:'50%',transform:'translateX(-50%)',padding:'4px 14px',borderRadius:'0 0 8px 8px',background:'linear-gradient(135deg,#c9a84c,#e8c96d)',fontSize:'10px',fontWeight:700,color:'#0d0a00',whiteSpace:'nowrap'}}>MOST POPULAR</div>}
                <div style={{fontSize:'12px',fontWeight:500,color:plan.color,textTransform:'uppercase',marginBottom:'14px'}}>{plan.name}</div>
                <div style={{display:'flex',alignItems:'baseline',gap:'4px',marginBottom:'4px'}}>
                  {plan.price!=='0'&&<span style={{fontSize:'16px',color:'#9aa3b2'}}>₹</span>}
                  <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'42px',fontWeight:300,color:'#fff',lineHeight:1}}>{plan.price==='0'?'₹0':plan.price}</span>
                  <span style={{fontSize:'13px',color:'#4a5568'}}>{plan.period}</span>
                </div>
                <div style={{fontSize:'12px',color:'#4a5568',marginBottom:'20px'}}>{plan.sub}</div>
                <a href={plan.href} style={{display:'block',textAlign:'center',padding:'10px',borderRadius:'9px',fontSize:'13px',fontWeight:600,cursor:'pointer',marginBottom:'20px',fontFamily:"'Outfit',sans-serif",textDecoration:'none',background:plan.gold?'linear-gradient(135deg,#c9a84c,#e8c96d)':'transparent',border:plan.gold?'none':'1px solid #2a3347',color:plan.gold?'#0d0a00':'#9aa3b2'}}>{plan.cta}</a>
                <div style={{display:'flex',flexDirection:'column',gap:'9px'}}>
                  {plan.features.map(f=><div key={f} style={{display:'flex',gap:'8px',fontSize:'12.5px',color:'#9aa3b2',fontWeight:300}}><span style={{color:'#4caf82',flexShrink:0}}>✓</span>{f}</div>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="sp" style={{padding:'100px 60px',maxWidth:'800px',margin:'0 auto'}}>
        <div style={{fontSize:'0.68rem',letterSpacing:'0.16em',textTransform:'uppercase',color:'#7eb8f7',fontWeight:500,marginBottom:'16px'}}>FAQ</div>
        <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'clamp(1.8rem,4vw,3.2rem)',fontWeight:300,color:'#fff',marginBottom:'48px'}}>Questions <em style={{fontStyle:'italic',color:'#7eb8f7'}}>answered.</em></h2>
        {FAQ.map((item,i)=>(
          <div key={i} style={{borderBottom:'1px solid #1e2535'}}>
            <button onClick={()=>setOpenFaq(openFaq===i?null:i)} className="fq" style={{width:'100%',background:'none',border:'none',color:'#e8eaf0',fontFamily:"'Outfit',sans-serif",fontSize:'15px',fontWeight:400,padding:'20px 0',textAlign:'left',cursor:'pointer',display:'flex',justifyContent:'space-between',alignItems:'center',gap:'12px'}}>
              {item.q}<span style={{color:'#4a5568',fontSize:'18px',transform:openFaq===i?'rotate(180deg)':'none',transition:'transform 0.22s',flexShrink:0}}>∨</span>
            </button>
            <div style={{maxHeight:openFaq===i?'200px':'0',overflow:'hidden',transition:'max-height 0.3s ease'}}>
              <div style={{padding:'0 0 20px',fontSize:'14px',color:'#7a8499',fontWeight:300,lineHeight:1.75}}>{item.a}</div>
            </div>
          </div>
        ))}
      </section>

      {/* FOOTER */}
      <footer style={{borderTop:'1px solid #1e2535',padding:'60px 60px 32px'}}>
        <div style={{maxWidth:'1200px',margin:'0 auto'}}>
          <div className="fcg" style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr',gap:'48px',marginBottom:'48px'}}>
            <div>
              <div style={{fontFamily:"'Outfit',sans-serif",fontWeight:300,fontSize:'1.15rem',letterSpacing:'0.26em',color:'#fff',display:'flex',alignItems:'center',marginBottom:'14px'}}>
                <span>Z</span><span style={{display:'inline-block',width:'13px',height:'13px',border:'1.5px solid #7eb8f7',borderRadius:'50%',margin:'0 3px'}}></span><span>LVYN</span>
              </div>
              <p style={{fontSize:'0.82rem',color:'#3a4258',lineHeight:1.75,fontWeight:300,maxWidth:'260px',marginBottom:'20px'}}>India's most advanced legal AI platform. Giving every Indian access to expert legal intelligence.</p>
              <div style={{display:'flex',gap:'10px'}}>
                {SOCIALS.map(s=>S(s.href,s.icon))}
              </div>
            </div>
            <div>
              <div style={{fontSize:'0.7rem',letterSpacing:'0.14em',textTransform:'uppercase',color:'#3a4258',marginBottom:'16px',fontWeight:500}}>Product</div>
              {[['Legal Q&A','/chat'],['Contract Analyzer','/contract'],['Document Generator','/generator'],['Case Predictor','/predictor'],['Bare Act Search','/bareacts']].map(([l,h])=>(
                <a key={l} href={h} className="fl" style={{display:'block',fontSize:'0.82rem',color:'#4a5568',textDecoration:'none',marginBottom:'10px',transition:'color 0.2s'}}>{l}</a>
              ))}
            </div>
            <div>
              <div style={{fontSize:'0.7rem',letterSpacing:'0.14em',textTransform:'uppercase',color:'#3a4258',marginBottom:'16px',fontWeight:500}}>Company</div>
              {[['About Zolvyn','#about'],['Legal Blog','#blog'],['Pricing','#pricing'],['FAQ','#faq']].map(([l,h])=>(
                <a key={l} href={h} className="fl" style={{display:'block',fontSize:'0.82rem',color:'#4a5568',textDecoration:'none',marginBottom:'10px',transition:'color 0.2s'}}>{l}</a>
              ))}
            </div>
            <div>
              <div style={{fontSize:'0.7rem',letterSpacing:'0.14em',textTransform:'uppercase',color:'#3a4258',marginBottom:'16px',fontWeight:500}}>Legal</div>
              {[['Privacy Policy','#'],['Terms of Service','#'],['Refund Policy','#'],['Disclaimer','#']].map(([l,h])=>(
                <a key={l} href={h} className="fl" style={{display:'block',fontSize:'0.82rem',color:'#4a5568',textDecoration:'none',marginBottom:'10px',transition:'color 0.2s'}}>{l}</a>
              ))}
            </div>
          </div>
          <div style={{background:'rgba(126,184,247,0.03)',border:'1px solid rgba(126,184,247,0.08)',borderLeft:'3px solid rgba(126,184,247,0.2)',borderRadius:'7px',padding:'12px 16px',fontSize:'0.75rem',color:'#3a4258',lineHeight:1.6,marginBottom:'28px'}}>
            <strong style={{color:'rgba(126,184,247,0.6)'}}>Legal Notice —</strong> Zolvyn provides legal intelligence for informational purposes. For matters involving court proceedings, consulting a qualified advocate is always recommended.
          </div>
          <div className="fi" style={{display:'flex',justifyContent:'space-between',alignItems:'center',paddingTop:'24px',borderTop:'1px solid #1e2535',flexWrap:'wrap',gap:'12px'}}>
            <p style={{fontSize:'0.72rem',color:'#3a4258',fontWeight:300}}>© 2026 Zolvyn AI — Legal Intelligence · Made for India 🇮🇳</p>
            <div style={{display:'flex',gap:'12px',alignItems:'center'}}>
              {SOCIALS.map((s,i)=>(
                <a key={i} href={s.href} target="_blank" rel="noopener noreferrer"
                  style={{color:'#3a4258',transition:'color 0.2s',display:'flex',alignItems:'center'}}
                  onMouseEnter={e=>(e.currentTarget as HTMLAnchorElement).style.color='#e8eaf0'}
                  onMouseLeave={e=>(e.currentTarget as HTMLAnchorElement).style.color='#3a4258'}>
                  {s.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}