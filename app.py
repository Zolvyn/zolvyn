import streamlit as st

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

st.set_page_config(
    page_title="Zolvyn AI — Smart Legal Companion",
    page_icon="⚖️",
    layout="wide",
    initial_sidebar_state="collapsed"
)

st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

/* ═══════════════════════════════════════
   ROOT VARIABLES
═══════════════════════════════════════ */
:root {
  --gold: #c9a84c;
  --gold-light: #e8c96d;
  --gold-dim: rgba(201,168,76,0.12);
  --navy: #080d18;
  --navy-2: #0d1b2a;
  --navy-3: #0f1e30;
  --navy-4: #1a2f4e;
  --navy-5: #1e3a5f;
  --text: #e2ddd4;
  --text-dim: #7a94b0;
  --text-faint: #3a5470;
  --success: #3dbb7a;
  --danger: #e05555;
  --warning: #e8a83a;
  --radius: 12px;
  --radius-sm: 8px;
}

/* ═══════════════════════════════════════
   BASE RESET
═══════════════════════════════════════ */
html, body, [class*="css"] {
  font-family: 'DM Sans', sans-serif !important;
  background-color: var(--navy) !important;
  color: var(--text) !important;
}

#MainMenu, footer, header { visibility: hidden; }

.block-container {
  padding: 0 !important;
  max-width: 100% !important;
}

/* ═══════════════════════════════════════
   HEADER
═══════════════════════════════════════ */
.z-header {
  background: linear-gradient(135deg, #060b15 0%, #0c1928 50%, #060b15 100%);
  border-bottom: 1px solid rgba(201,168,76,0.2);
  padding: 0 48px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
}

.z-header::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 60% 100% at 50% 0%, rgba(201,168,76,0.05), transparent);
  pointer-events: none;
}

.z-logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.z-wordmark {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.7rem;
  font-weight: 700;
  color: var(--gold);
  letter-spacing: 4px;
  text-transform: uppercase;
  line-height: 1;
}

.z-badge {
  background: linear-gradient(135deg, var(--gold), var(--gold-light));
  color: var(--navy);
  font-size: 0.48rem;
  font-weight: 800;
  letter-spacing: 2px;
  padding: 3px 7px;
  border-radius: 3px;
  margin-top: -14px;
}

.z-tagline {
  font-size: 0.68rem;
  color: var(--text-faint);
  letter-spacing: 2.5px;
  text-transform: uppercase;
}

/* ═══════════════════════════════════════
   NAVIGATION
═══════════════════════════════════════ */
.z-nav {
  background: var(--navy-2);
  border-bottom: 1px solid var(--navy-4);
  padding: 0 48px;
  display: flex;
  align-items: center;
  gap: 4px;
  height: 52px;
}

div[data-testid="column"] .stButton > button {
  background: transparent !important;
  border: none !important;
  border-bottom: 2px solid transparent !important;
  color: var(--text-dim) !important;
  border-radius: 0 !important;
  font-size: 0.82rem !important;
  font-weight: 500 !important;
  width: 100% !important;
  height: 52px !important;
  letter-spacing: 0.3px !important;
  transition: all 0.2s ease !important;
  padding: 0 4px !important;
}

div[data-testid="column"] .stButton > button:hover {
  color: var(--gold) !important;
  border-bottom-color: var(--gold) !important;
  background: rgba(201,168,76,0.04) !important;
}

/* ═══════════════════════════════════════
   PAGE CONTENT WRAPPER
═══════════════════════════════════════ */
.z-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 36px 48px 80px;
}

/* ═══════════════════════════════════════
   PAGE TITLES
═══════════════════════════════════════ */
.z-page-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: 2rem;
  font-weight: 700;
  color: var(--gold);
  letter-spacing: 0.3px;
  margin-bottom: 4px;
}

.z-page-sub {
  font-size: 0.85rem;
  color: var(--text-faint);
  margin-bottom: 28px;
  font-weight: 300;
}

.z-divider {
  height: 1px;
  background: linear-gradient(90deg, rgba(201,168,76,0.4), rgba(201,168,76,0.05), transparent);
  margin-bottom: 28px;
}

/* ═══════════════════════════════════════
   CARDS
═══════════════════════════════════════ */
.z-card {
  background: var(--navy-2);
  border: 1px solid var(--navy-4);
  border-radius: var(--radius);
  padding: 24px;
  margin-bottom: 16px;
  transition: border-color 0.2s;
}

.z-card:hover { border-color: var(--navy-5); }

.z-card-gold {
  background: linear-gradient(145deg, var(--navy-2), var(--navy-3));
  border: 1px solid rgba(201,168,76,0.2);
  border-radius: var(--radius);
  padding: 24px;
  margin-bottom: 16px;
}

/* ═══════════════════════════════════════
   CHAT INTERFACE
═══════════════════════════════════════ */
.z-chat-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 24px;
}

.z-msg-user {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  align-items: flex-start;
}

.z-msg-ai {
  display: flex;
  justify-content: flex-start;
  gap: 12px;
  align-items: flex-start;
}

.z-avatar-user {
  width: 32px; height: 32px;
  background: var(--navy-4);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  color: var(--text-dim);
  flex-shrink: 0;
  margin-top: 2px;
}

.z-avatar-ai {
  width: 32px; height: 32px;
  background: linear-gradient(135deg, rgba(201,168,76,0.2), rgba(201,168,76,0.1));
  border: 1px solid rgba(201,168,76,0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  flex-shrink: 0;
  margin-top: 2px;
}

.z-bubble-user {
  background: var(--navy-4);
  border-radius: 16px 16px 4px 16px;
  padding: 12px 18px;
  max-width: 70%;
  font-size: 0.88rem;
  color: var(--text);
  line-height: 1.6;
}

.z-bubble-ai {
  background: var(--navy-2);
  border: 1px solid var(--navy-5);
  border-left: 3px solid var(--gold);
  border-radius: 4px 16px 16px 16px;
  padding: 16px 20px;
  max-width: 80%;
  font-size: 0.88rem;
  color: var(--text);
  line-height: 1.8;
}

.z-bubble-ai strong { color: var(--gold); }
.z-bubble-ai em { color: var(--text-dim); }

.z-source-pills {
  display: flex;
  gap: 6px;
  margin-top: 8px;
  flex-wrap: wrap;
}

.z-source-pill {
  background: rgba(201,168,76,0.06);
  border: 1px solid rgba(201,168,76,0.15);
  color: var(--text-faint);
  font-size: 0.67rem;
  padding: 3px 10px;
  border-radius: 20px;
  letter-spacing: 0.3px;
}

/* ═══════════════════════════════════════
   QUICK CHIPS
═══════════════════════════════════════ */
.z-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}

.z-chip {
  background: rgba(201,168,76,0.06);
  border: 1px solid rgba(201,168,76,0.2);
  color: #8a7040;
  border-radius: 20px;
  padding: 6px 14px;
  font-size: 0.77rem;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'DM Sans', sans-serif;
}

.z-chip:hover {
  background: rgba(201,168,76,0.14);
  color: var(--gold);
  border-color: rgba(201,168,76,0.4);
}

/* ═══════════════════════════════════════
   RISK / STATUS BADGES
═══════════════════════════════════════ */
.z-badge-high {
  background: rgba(224,85,85,0.12);
  border: 1px solid rgba(224,85,85,0.35);
  color: #ff7070;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.73rem;
  font-weight: 600;
}

.z-badge-medium {
  background: rgba(232,168,58,0.12);
  border: 1px solid rgba(232,168,58,0.35);
  color: #ffb84d;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.73rem;
  font-weight: 600;
}

.z-badge-low {
  background: rgba(61,187,122,0.12);
  border: 1px solid rgba(61,187,122,0.35);
  color: #5fcc88;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.73rem;
  font-weight: 600;
}

/* ═══════════════════════════════════════
   PROGRESS BAR
═══════════════════════════════════════ */
.z-progress-wrap {
  background: var(--navy-2);
  border: 1px solid var(--navy-4);
  border-radius: var(--radius);
  padding: 20px 24px;
  margin-bottom: 20px;
}

.z-bar-track {
  background: var(--navy-4);
  border-radius: 20px;
  height: 10px;
  overflow: hidden;
  margin: 10px 0 6px;
}

/* ═══════════════════════════════════════
   ANALYSIS SECTIONS
═══════════════════════════════════════ */
.z-section {
  background: var(--navy-2);
  border: 1px solid var(--navy-4);
  border-radius: var(--radius);
  padding: 20px 24px;
  margin-bottom: 12px;
  transition: border-color 0.2s;
}

.z-section-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--gold);
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.z-section-body {
  font-size: 0.86rem;
  color: #a8b8c8;
  line-height: 1.85;
}

/* ═══════════════════════════════════════
   INPUTS
═══════════════════════════════════════ */
.stTextInput > label,
.stTextArea > label,
.stSelectbox > label,
.stDateInput > label,
.stFileUploader > label {
  color: var(--text-dim) !important;
  font-size: 0.8rem !important;
  font-weight: 500 !important;
  letter-spacing: 0.3px !important;
  text-transform: uppercase !important;
  margin-bottom: 6px !important;
}

.stTextInput > div > div > input,
.stTextArea > div > div > textarea {
  background: var(--navy-2) !important;
  border: 1px solid var(--navy-5) !important;
  border-radius: var(--radius-sm) !important;
  color: var(--text) !important;
  font-size: 0.88rem !important;
  font-family: 'DM Sans', sans-serif !important;
  transition: border-color 0.2s, box-shadow 0.2s !important;
}

.stTextInput > div > div > input:focus,
.stTextArea > div > div > textarea:focus {
  border-color: var(--gold) !important;
  box-shadow: 0 0 0 3px rgba(201,168,76,0.08) !important;
  outline: none !important;
}

.stSelectbox > div > div {
  background: var(--navy-2) !important;
  border: 1px solid var(--navy-5) !important;
  border-radius: var(--radius-sm) !important;
  color: var(--text) !important;
}

input::placeholder, textarea::placeholder {
  color: var(--text-faint) !important;
  font-size: 0.85rem !important;
}

/* ═══════════════════════════════════════
   BUTTONS
═══════════════════════════════════════ */
.stButton > button {
  background: linear-gradient(135deg, var(--gold), var(--gold-light)) !important;
  color: var(--navy) !important;
  border: none !important;
  border-radius: var(--radius-sm) !important;
  font-weight: 700 !important;
  font-size: 0.88rem !important;
  width: 100% !important;
  letter-spacing: 0.3px !important;
  transition: all 0.2s ease !important;
  font-family: 'DM Sans', sans-serif !important;
}

.stButton > button:hover {
  box-shadow: 0 4px 20px rgba(201,168,76,0.3) !important;
  transform: translateY(-1px) !important;
}

/* ═══════════════════════════════════════
   FILE UPLOADER
═══════════════════════════════════════ */
.stFileUploader > div {
  background: var(--navy-2) !important;
  border: 2px dashed var(--navy-5) !important;
  border-radius: var(--radius) !important;
  transition: border-color 0.2s !important;
}

.stFileUploader > div:hover {
  border-color: rgba(201,168,76,0.5) !important;
}

/* ═══════════════════════════════════════
   HOME CARDS
═══════════════════════════════════════ */
.z-home-card {
  background: linear-gradient(145deg, var(--navy-2), var(--navy-3));
  border: 1px solid var(--navy-4);
  border-top: 2px solid var(--gold);
  border-radius: var(--radius);
  padding: 28px 24px;
  height: 100%;
  transition: transform 0.25s, box-shadow 0.25s, border-color 0.25s;
  cursor: default;
}

.z-home-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 48px rgba(0,0,0,0.4);
  border-color: rgba(201,168,76,0.5);
}

/* ═══════════════════════════════════════
   DISCLAIMER
═══════════════════════════════════════ */
.z-disclaimer {
  background: rgba(201,168,76,0.04);
  border: 1px solid rgba(201,168,76,0.12);
  border-left: 3px solid rgba(201,168,76,0.4);
  border-radius: var(--radius-sm);
  padding: 14px 18px;
  font-size: 0.78rem;
  color: var(--text-faint);
  line-height: 1.6;
  margin-top: 16px;
}

/* ═══════════════════════════════════════
   FOOTER
═══════════════════════════════════════ */
.z-footer {
  text-align: center;
  padding: 28px;
  color: var(--text-faint);
  font-size: 0.68rem;
  border-top: 1px solid var(--navy-4);
  margin-top: 60px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
}

/* ═══════════════════════════════════════
   TAB STYLE OVERRIDE
═══════════════════════════════════════ */
.stTabs [data-baseweb="tab-list"] {
  background: var(--navy-2) !important;
  border-bottom: 1px solid var(--navy-4) !important;
  gap: 0 !important;
}

.stTabs [data-baseweb="tab"] {
  color: var(--text-faint) !important;
  font-size: 0.82rem !important;
  font-weight: 500 !important;
  padding: 12px 20px !important;
  border-bottom: 2px solid transparent !important;
  transition: all 0.2s !important;
}

.stTabs [aria-selected="true"] {
  color: var(--gold) !important;
  border-bottom-color: var(--gold) !important;
  background: transparent !important;
}

/* ═══════════════════════════════════════
   MISC
═══════════════════════════════════════ */
.stSpinner > div { border-top-color: var(--gold) !important; }
.stSuccess { border-radius: var(--radius-sm) !important; }
.stWarning { border-radius: var(--radius-sm) !important; }
.stError { border-radius: var(--radius-sm) !important; }

.z-info-row {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--navy-2);
  border: 1px solid var(--navy-4);
  border-radius: var(--radius-sm);
  padding: 10px 14px;
  font-size: 0.82rem;
  color: var(--text-dim);
  margin: 8px 0;
}

hr { border-color: var(--navy-4) !important; margin: 20px 0 !important; }
</style>
""", unsafe_allow_html=True)

# ══════════════════════════════════════
# HEADER
# ══════════════════════════════════════
st.markdown("""
<div class="z-header">
  <div class="z-logo">
    <span style="font-size:1.4rem; filter:drop-shadow(0 0 6px rgba(201,168,76,0.5))">⚖️</span>
    <span class="z-wordmark">Zolvyn</span>
    <span class="z-badge">AI</span>
  </div>
  <div class="z-tagline">Your Smart Legal Companion, Anywhere in India</div>
</div>
""", unsafe_allow_html=True)

# ══════════════════════════════════════
# NAVIGATION
# ══════════════════════════════════════
if "page" not in st.session_state:
    st.session_state.page = "Home"

cols = st.columns([1,1,1,1,1,1])
nav_items = [
    ("🏠  Home", "Home"),
    ("💬  Legal Q&A", "Legal Q&A"),
    ("📄  Contracts", "Contract Analyzer"),
    ("📝  Documents", "Document Generator"),
    ("🔮  Predictor", "Case Predictor"),
    ("⚡  Bare Acts", "Bare Acts"),
]

for col, (label, key) in zip(cols, nav_items):
    with col:
        if st.button(label, key=f"nav_{key}"):
            st.session_state.page = key

# ══════════════════════════════════════
# PAGE ROUTING
# ══════════════════════════════════════
page = st.session_state.page

st.markdown('<div class="z-page">', unsafe_allow_html=True)

if page == "Home":
    st.markdown("""
    <div style="text-align:center; padding: 40px 0 20px;">
      <div style="font-family:'Cormorant Garamond',serif; font-size:3rem; font-weight:700; color:var(--gold); line-height:1.1; margin-bottom:12px;">
        Know Your Rights.<br/><em style="color:var(--text);">Instantly.</em>
      </div>
      <p style="color:var(--text-dim); font-size:1rem; font-weight:300; max-width:520px; margin:0 auto 40px; line-height:1.7;">
        AI-powered legal intelligence for every Indian — understand contracts,
        predict case outcomes, draft documents, and get expert legal guidance.
      </p>
    </div>
    """, unsafe_allow_html=True)

    c1, c2, c3 = st.columns(3)
    cards = [
        ("💬", "Legal Q&A", "Ask any Indian law question. Get expert answers sourced from real legal documents using RAG. Upload your own documents too.", "RAG · Document Upload"),
        ("📄", "Contract Analyzer", "Upload any contract PDF. Get clause-by-clause risk analysis, red flags, missing terms, and recommendations.", "Risk Scoring · Red Flags"),
        ("📝", "Document Generator", "Generate NDAs, rental agreements, employment contracts, affidavits and legal notices in seconds.", "7 Document Types · PDF"),
    ]
    for col, (icon, title, desc, tag) in zip([c1,c2,c3], cards):
        with col:
            st.markdown(f"""
            <div class="z-home-card">
              <div style="font-size:2rem; margin-bottom:14px;">{icon}</div>
              <div style="font-family:'Cormorant Garamond',serif; font-size:1.2rem; color:var(--gold); font-weight:600; margin-bottom:8px;">{title}</div>
              <div style="font-size:0.82rem; color:var(--text-dim); line-height:1.65; margin-bottom:14px;">{desc}</div>
              <div style="font-size:0.65rem; color:var(--text-faint); letter-spacing:1px; text-transform:uppercase; border-top:1px solid var(--navy-4); padding-top:10px;">{tag}</div>
            </div>
            """, unsafe_allow_html=True)

    st.markdown("<div style='height:16px'></div>", unsafe_allow_html=True)
    c1, c2, c3 = st.columns(3)
    cards2 = [
        ("🔮", "Case Predictor", "Describe your legal situation. Get win probability, applicable laws, strengths, weaknesses, and a step-by-step action plan.", "12 Case Types · Strategy"),
        ("⚡", "Bare Act Search", "Instantly look up any IPC section, CrPC provision, or Indian law article. Clean explanations in plain language.", "IPC · CrPC · All Acts"),
        ("🔒", "100% Private", "Your documents and case details are never stored. All analysis happens in real-time and is discarded after your session.", "No Login · No Storage"),
    ]
    for col, (icon, title, desc, tag) in zip([c1,c2,c3], cards2):
        with col:
            st.markdown(f"""
            <div class="z-home-card">
              <div style="font-size:2rem; margin-bottom:14px;">{icon}</div>
              <div style="font-family:'Cormorant Garamond',serif; font-size:1.2rem; color:var(--gold); font-weight:600; margin-bottom:8px;">{title}</div>
              <div style="font-size:0.82rem; color:var(--text-dim); line-height:1.65; margin-bottom:14px;">{desc}</div>
              <div style="font-size:0.65rem; color:var(--text-faint); letter-spacing:1px; text-transform:uppercase; border-top:1px solid var(--navy-4); padding-top:10px;">{tag}</div>
            </div>
            """, unsafe_allow_html=True)

    st.markdown("""
    <div class="z-disclaimer" style="margin-top:32px; text-align:center;">
      <strong style="color:rgba(201,168,76,0.7);">⚠️ Legal Disclaimer</strong> — Zolvyn AI provides information for educational purposes only.
      Always consult a qualified lawyer for professional legal advice specific to your situation.
    </div>
    """, unsafe_allow_html=True)

elif page == "Legal Q&A":
    st.markdown('<div class="z-page-title">💬 Legal Q&A Assistant</div>', unsafe_allow_html=True)
    st.markdown('<div class="z-page-sub">Ask any Indian law question or upload your own legal document for analysis</div>', unsafe_allow_html=True)
    st.markdown('<div class="z-divider"></div>', unsafe_allow_html=True)
    from legal_qa import legal_qa_ui
    legal_qa_ui()

elif page == "Contract Analyzer":
    st.markdown('<div class="z-page-title">📄 Contract Analyzer</div>', unsafe_allow_html=True)
    st.markdown('<div class="z-page-sub">Upload any contract PDF for instant AI-powered risk analysis under Indian law</div>', unsafe_allow_html=True)
    st.markdown('<div class="z-divider"></div>', unsafe_allow_html=True)
    from contract_analyzer import contract_analyzer_ui
    contract_analyzer_ui()

elif page == "Document Generator":
    st.markdown('<div class="z-page-title">📝 Legal Document Generator</div>', unsafe_allow_html=True)
    st.markdown('<div class="z-page-sub">Generate complete, legally-structured documents ready for use in India</div>', unsafe_allow_html=True)
    st.markdown('<div class="z-divider"></div>', unsafe_allow_html=True)
    from doc_generator import doc_generator_ui
    doc_generator_ui()

elif page == "Case Predictor":
    st.markdown('<div class="z-page-title">🔮 Case Outcome Predictor</div>', unsafe_allow_html=True)
    st.markdown('<div class="z-page-sub">Describe your legal situation and receive an AI-powered outcome prediction with strategy</div>', unsafe_allow_html=True)
    st.markdown('<div class="z-divider"></div>', unsafe_allow_html=True)
    from case_predictor import case_predictor_ui
    case_predictor_ui()

elif page == "Bare Acts":
    st.markdown('<div class="z-page-title">⚡ Bare Act Search</div>', unsafe_allow_html=True)
    st.markdown('<div class="z-page-sub">Instantly look up any Indian law section in plain, expert language</div>', unsafe_allow_html=True)
    st.markdown('<div class="z-divider"></div>', unsafe_allow_html=True)
    from bare_acts import bare_acts_ui
    bare_acts_ui()

st.markdown('</div>', unsafe_allow_html=True)

st.markdown("""
<div class="z-footer">
  Zolvyn AI &nbsp;·&nbsp; Powered by Llama 3.3 &nbsp;·&nbsp; For Educational Use Only &nbsp;·&nbsp; Not a Substitute for Legal Advice
</div>
""", unsafe_allow_html=True)