import streamlit as st
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass  # dotenv not required if env vars are set another way

st.set_page_config(
    page_title="Zolvyn AI — Smart Legal Companion",
    page_icon="⚖️",
    layout="wide",
    initial_sidebar_state="collapsed"
)

st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

*, html, body, [class*="css"] {
    font-family: 'DM Sans', sans-serif;
    background-color: #07090f;
    color: #ddd6c8;
}
#MainMenu {visibility: hidden;}
footer {visibility: hidden;}
header {visibility: hidden;}

.block-container {
    padding-top: 0 !important;
    padding-bottom: 2rem !important;
    max-width: 1280px !important;
}

/* HERO HEADER */
.zolvyn-header {
    background: linear-gradient(160deg, #060a14 0%, #0d1c35 45%, #060a14 100%);
    border-bottom: 1px solid rgba(201,168,76,0.3);
    padding: 28px 48px 22px;
    margin: -1rem -1rem 0 -1rem;
    position: relative;
    overflow: hidden;
}
.zolvyn-header::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: radial-gradient(ellipse 60% 100% at 50% 0%, rgba(201,168,76,0.07) 0%, transparent 70%);
    pointer-events: none;
}
.zolvyn-header-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
}
.zolvyn-logo-block {
    display: flex;
    align-items: center;
    gap: 14px;
}
.zolvyn-emblem {
    width: 46px; height: 46px;
    background: linear-gradient(135deg, #c9a84c, #f0d680);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.4rem;
    box-shadow: 0 0 24px rgba(201,168,76,0.35);
}
.zolvyn-brand {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.85rem; font-weight: 700;
    color: #c9a84c; letter-spacing: 1px; line-height: 1;
}
.zolvyn-tagline {
    font-size: 0.7rem; color: #6a7f9a;
    letter-spacing: 3px; text-transform: uppercase; margin-top: 3px;
}
.zolvyn-badge {
    background: rgba(201,168,76,0.1);
    border: 1px solid rgba(201,168,76,0.25);
    border-radius: 20px; padding: 5px 14px;
    font-size: 0.7rem; color: #c9a84c;
    letter-spacing: 2px; text-transform: uppercase;
}

/* NAV */
.nav-wrap {
    background: rgba(13,28,53,0.6);
    border-bottom: 1px solid rgba(201,168,76,0.1);
    padding: 10px 0;
    margin: 0 -1rem 2rem -1rem;
}
div[data-testid="column"] .stButton > button {
    background: transparent !important;
    border: 1px solid rgba(201,168,76,0.18) !important;
    color: #8a9bb5 !important;
    border-radius: 8px !important;
    font-size: 0.8rem !important; font-weight: 500 !important;
    width: 100% !important; height: 44px !important;
    transition: all 0.2s ease !important; letter-spacing: 0.3px !important;
}
div[data-testid="column"] .stButton > button:hover {
    background: rgba(201,168,76,0.08) !important;
    border-color: #c9a84c !important; color: #c9a84c !important;
}

/* ACTION BUTTONS */
.stButton > button {
    background: linear-gradient(135deg, #c9a84c 0%, #e8c96d 100%) !important;
    color: #07090f !important; border: none !important;
    border-radius: 8px !important; padding: 10px 28px !important;
    font-weight: 600 !important; font-size: 0.88rem !important;
    width: 100% !important; letter-spacing: 0.2px !important;
    transition: all 0.2s ease !important;
}
.stButton > button:hover {
    box-shadow: 0 4px 20px rgba(201,168,76,0.4) !important;
    transform: translateY(-1px) !important;
}

/* SECTION HEADERS */
.section-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.9rem; color: #c9a84c; font-weight: 700;
    margin-bottom: 0.25rem; letter-spacing: 0.3px;
}
.section-line {
    height: 1px;
    background: linear-gradient(90deg, #c9a84c 0%, rgba(201,168,76,0.1) 60%, transparent 100%);
    margin-bottom: 1.75rem; border-radius: 1px;
}

/* HOME FEATURE CARDS */
.feature-card {
    background: linear-gradient(145deg, #0d1c35 0%, #0a1526 100%);
    border: 1px solid rgba(201,168,76,0.12);
    border-top: 2px solid #c9a84c;
    border-radius: 14px; padding: 28px 22px; height: 210px;
    transition: all 0.25s ease; position: relative; overflow: hidden;
}
.feature-card:hover {
    transform: translateY(-4px);
    border-color: rgba(201,168,76,0.35);
    box-shadow: 0 12px 40px rgba(0,0,0,0.4);
}
.card-icon { font-size: 2.4rem; margin-bottom: 12px; }
.card-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.1rem; color: #c9a84c; font-weight: 600; margin-bottom: 8px;
}
.card-desc { font-size: 0.78rem; color: #5a6f8a; line-height: 1.6; }

/* STATS ROW */
.stat-row {
    display: flex; gap: 0;
    background: rgba(13,28,53,0.4);
    border: 1px solid rgba(201,168,76,0.1);
    border-radius: 12px; overflow: hidden; margin-top: 1.5rem;
}
.stat-item {
    flex: 1; padding: 18px; text-align: center;
    border-right: 1px solid rgba(201,168,76,0.08);
}
.stat-item:last-child { border-right: none; }
.stat-num {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.8rem; color: #c9a84c; font-weight: 700;
}
.stat-lbl { font-size: 0.68rem; color: #4a6070; letter-spacing: 2px; text-transform: uppercase; }

/* DISCLAIMER */
.disclaimer-box {
    background: rgba(13,28,53,0.5);
    border: 1px solid rgba(201,168,76,0.12);
    border-left: 3px solid #c9a84c;
    border-radius: 10px; padding: 16px 20px; margin-top: 1.5rem;
}

/* INPUTS */
.stTextInput > label, .stTextArea > label,
.stSelectbox > label, .stDateInput > label, .stFileUploader > label {
    color: #c9a84c !important; font-size: 0.82rem !important;
    font-weight: 500 !important; letter-spacing: 0.3px !important;
}
.stTextInput > div > div > input {
    background-color: #0d1c35 !important;
    border: 1px solid rgba(201,168,76,0.25) !important;
    border-radius: 8px !important; color: #ddd6c8 !important;
    font-size: 0.9rem !important; padding: 10px 14px !important;
}
.stTextInput > div > div > input:focus {
    border-color: #c9a84c !important;
    box-shadow: 0 0 0 2px rgba(201,168,76,0.12) !important;
}
.stTextArea > div > div > textarea {
    background-color: #0d1c35 !important;
    border: 1px solid rgba(201,168,76,0.25) !important;
    border-radius: 8px !important; color: #ddd6c8 !important;
    font-size: 0.9rem !important; padding: 10px 14px !important;
}
.stSelectbox > div > div {
    background-color: #0d1c35 !important;
    border: 1px solid rgba(201,168,76,0.25) !important;
    border-radius: 8px !important; color: #ddd6c8 !important;
}
input::placeholder, textarea::placeholder { color: #3a5070 !important; }
.stFileUploader > div {
    background: #0d1c35 !important;
    border: 2px dashed rgba(201,168,76,0.3) !important;
    border-radius: 12px !important;
}

/* FOOTER */
.zolvyn-footer {
    text-align: center; padding: 24px; color: #2a3f5a;
    font-size: 0.68rem; border-top: 1px solid rgba(201,168,76,0.08);
    margin-top: 3rem; letter-spacing: 2px; text-transform: uppercase;
}
</style>
""", unsafe_allow_html=True)

# ─── HEADER ───────────────────────────────────────────────────────────────────
st.markdown("""
<div class="zolvyn-header">
  <div class="zolvyn-header-inner">
    <div class="zolvyn-logo-block">
      <div class="zolvyn-emblem">⚖️</div>
      <div>
        <div class="zolvyn-brand">Zolvyn AI</div>
        <div class="zolvyn-tagline">Your Smart Legal Companion, Anywhere in India</div>
      </div>
    </div>
    <div class="zolvyn-badge">⚡ AI Powered</div>
  </div>
</div>
""", unsafe_allow_html=True)

# ─── NAVIGATION ───────────────────────────────────────────────────────────────
st.markdown('<div class="nav-wrap">', unsafe_allow_html=True)
if "page" not in st.session_state:
    st.session_state.page = "Home"

c1, c2, c3, c4, c5 = st.columns([1, 1, 1, 1, 1])
with c1:
    if st.button("🏠 Home"): st.session_state.page = "Home"
with c2:
    if st.button("📖 Legal Q&A"): st.session_state.page = "Legal Q&A"
with c3:
    if st.button("📄 Contracts"): st.session_state.page = "Contract Analyzer"
with c4:
    if st.button("📝 Documents"): st.session_state.page = "Document Generator"
with c5:
    if st.button("🔮 Predictor"): st.session_state.page = "Case Predictor"
st.markdown('</div>', unsafe_allow_html=True)

page = st.session_state.page

# ─── HOME ─────────────────────────────────────────────────────────────────────
if page == "Home":
    st.markdown('<div class="section-title">Welcome to Zolvyn AI</div>', unsafe_allow_html=True)
    st.markdown('<div class="section-line"></div>', unsafe_allow_html=True)
    st.markdown("##### AI-powered legal intelligence — instant, private, and accessible to every Indian citizen.")
    st.markdown("")

    c1, c2, c3, c4 = st.columns(4)
    cards = [
        ("📖", "Legal Q&A", "Ask anything about Indian law. Our RAG engine retrieves answers directly from legal documents."),
        ("📄", "Contract Analyzer", "Upload any contract PDF. Get instant clause-by-clause risk analysis and red flags."),
        ("📝", "Document Generator", "Generate NDAs, Rental Agreements, Employment Contracts and more — download as PDF."),
        ("🔮", "Case Predictor", "Describe your legal situation. Get an AI-powered outcome prediction under Indian law."),
    ]
    for col, (icon, title, desc) in zip([c1, c2, c3, c4], cards):
        with col:
            st.markdown(f"""
            <div class="feature-card">
                <div class="card-icon">{icon}</div>
                <div class="card-title">{title}</div>
                <div class="card-desc">{desc}</div>
            </div>
            """, unsafe_allow_html=True)

    st.markdown("""
    <div class="stat-row">
        <div class="stat-item"><div class="stat-num">4</div><div class="stat-lbl">AI Modules</div></div>
        <div class="stat-item"><div class="stat-num">∞</div><div class="stat-lbl">Questions Answered</div></div>
        <div class="stat-item"><div class="stat-num">100%</div><div class="stat-lbl">Anonymous</div></div>
        <div class="stat-item"><div class="stat-num">🇮🇳 India</div><div class="stat-lbl">Jurisdiction</div></div>
    </div>
    <div class="disclaimer-box">
        <span style="color:#c9a84c;font-weight:600;font-size:0.85rem;">⚠️ Disclaimer &nbsp;</span>
        <span style="color:#5a7090;font-size:0.82rem;">
            Zolvyn AI provides AI-generated legal information for educational purposes only.
            It is not a substitute for professional legal advice. Always consult a qualified lawyer for your specific situation.
        </span>
    </div>
    """, unsafe_allow_html=True)

elif page == "Legal Q&A":
    st.markdown('<div class="section-title">📖 Legal Q&A Assistant</div>', unsafe_allow_html=True)
    st.markdown('<div class="section-line"></div>', unsafe_allow_html=True)
    from legal_qa import legal_qa_ui
    legal_qa_ui()

elif page == "Contract Analyzer":
    st.markdown('<div class="section-title">📄 Contract Analyzer</div>', unsafe_allow_html=True)
    st.markdown('<div class="section-line"></div>', unsafe_allow_html=True)
    from contract_analyzer import contract_analyzer_ui
    contract_analyzer_ui()

elif page == "Document Generator":
    st.markdown('<div class="section-title">📝 Legal Document Generator</div>', unsafe_allow_html=True)
    st.markdown('<div class="section-line"></div>', unsafe_allow_html=True)
    from doc_generator import doc_generator_ui
    doc_generator_ui()

elif page == "Case Predictor":
    st.markdown('<div class="section-title">🔮 Case Outcome Predictor</div>', unsafe_allow_html=True)
    st.markdown('<div class="section-line"></div>', unsafe_allow_html=True)
    from case_predictor import case_predictor_ui
    case_predictor_ui()

# ─── FOOTER ───────────────────────────────────────────────────────────────────
st.markdown("""
<div class="zolvyn-footer">
    Zolvyn AI &nbsp;·&nbsp; Smart Legal Companion &nbsp;·&nbsp; For Educational Use Only &nbsp;·&nbsp; Not a Substitute for Legal Advice
</div>
""", unsafe_allow_html=True)