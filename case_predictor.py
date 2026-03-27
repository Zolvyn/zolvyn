import os
from dotenv import load_dotenv
from groq import Groq
import streamlit as st

load_dotenv()

_api_key = os.getenv("GROQ_API_KEY")
if not _api_key:
    raise EnvironmentError("GROQ_API_KEY not set. Check your .env file.")

client = Groq(api_key=_api_key)
MODEL  = "llama-3.3-70b-versatile"

SYSTEM_PROMPT = """You are a highly experienced Indian legal expert and litigation strategist
with 30+ years of experience in the Indian judicial system. You analyze legal cases, predict
outcomes based on precedents and current law, identify strengths and weaknesses, and provide
strategic legal advice. You are familiar with Supreme Court, High Court, and District Court
proceedings across all domains of Indian law."""

CASE_TYPES = [
    "Civil Dispute",
    "Criminal Case",
    "Family Law (Divorce / Custody)",
    "Property Dispute",
    "Consumer Forum Case",
    "Labour / Employment Dispute",
    "Cheque Bounce (NI Act Section 138)",
    "Cyber Crime",
    "Corporate / Commercial Dispute",
    "Intellectual Property",
    "Tax Dispute",
    "Constitutional Matter",
    "Tenancy Dispute",
    "Motor Accident Claim (MACT)",
    "Medical Negligence",
    "Domestic Violence (PWDVA)",
    "RTI / Public Interest Matter",
]


# ─────────────────────────────────────────────────────────────────────────────
# CORE FUNCTIONS
# ─────────────────────────────────────────────────────────────────────────────
def predict_outcome(case_type: str, facts: str, evidence: str,
                    jurisdiction: str = "India", extra: str = "") -> str:
    prompt = f"""Analyze this legal case and provide a detailed outcome prediction:

CASE TYPE: {case_type}
JURISDICTION: {jurisdiction}
FACTS: {facts.strip()}
EVIDENCE: {evidence.strip() if evidence else "Not specified"}
ADDITIONAL INFO: {extra.strip() if extra else "None"}

Provide analysis in this format:
## 1. Case Overview
## 2. Applicable Laws & Sections
## 3. Relevant Precedents & Case Laws
## 4. Strengths & Weaknesses
## 5. Outcome Prediction
   - Likely Outcome:
   - Success Probability: [High/Medium/Low with % estimate]
   - Timeline Estimate:
## 6. Legal Strategy Recommendations
## 7. ADR Consideration (Mediation/Arbitration)
## 8. Critical Warnings"""

    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user",   "content": prompt},
        ],
        temperature=0.3,
        max_tokens=3000,
    )
    return response.choices[0].message.content


def get_strategy(case_description: str, side: str = "plaintiff") -> str:
    prompt = f"""As a senior legal strategist, provide a detailed legal strategy for the {side}:

CASE: {case_description.strip()}

Include:
1. Immediate steps (within 30 days)
2. Evidence gathering strategy
3. Key legal arguments
4. Potential challenges and how to overcome them
5. Settlement vs litigation analysis
6. Estimated costs and timeline
7. Key witnesses to consider
8. Documentation checklist"""

    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user",   "content": prompt},
        ],
        temperature=0.3,
        max_tokens=2000,
    )
    return response.choices[0].message.content


def analyze_fir(fir_text: str) -> str:
    prompt = f"""Analyze the following FIR/Complaint under Indian Criminal Law:

FIR TEXT:
{fir_text.strip()}

Provide:
1. Offences identified and applicable IPC/BNSS sections
2. Cognizable vs Non-cognizable classification
3. Bailable vs Non-bailable assessment
4. Strength of FIR/complaint
5. Defense strategies (if accused)
6. Steps for complainant
7. Anticipatory bail applicability
8. Key legal advice and next steps"""

    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user",   "content": prompt},
        ],
        temperature=0.2,
        max_tokens=2000,
    )
    return response.choices[0].message.content


# ─────────────────────────────────────────────────────────────────────────────
# STREAMLIT UI
# ─────────────────────────────────────────────────────────────────────────────
def case_predictor_ui():
    tab1, tab2, tab3 = st.tabs(["🔮 Predict Outcome", "⚔️ Legal Strategy", "📋 FIR Analyzer"])

    # ── TAB 1: Predict ──
    with tab1:
        col1, col2 = st.columns(2)
        with col1:
            case_type    = st.selectbox("Case Type", CASE_TYPES)
            jurisdiction = st.text_input("Jurisdiction / Court", value="India", key="pred_juri")
        with col2:
            evidence = st.text_area("Available Evidence",
                                     placeholder="Documents, witnesses, CCTV, contracts, emails...",
                                     height=120)

        facts = st.text_area("Facts of the Case",
                              placeholder="Describe all relevant facts in detail...", height=160)
        extra = st.text_area("Additional Information (Optional)", height=70)

        if st.button("🔮 Predict Case Outcome", key="predict_btn"):
            if not facts.strip():
                st.warning("Please describe the facts of the case.")
            else:
                with st.spinner("Analyzing case and predicting outcome..."):
                    try:
                        result = predict_outcome(case_type, facts, evidence, jurisdiction, extra)
                        st.markdown("### 📊 Case Analysis & Prediction")
                        st.markdown(f'<div class="result-box">{result}</div>', unsafe_allow_html=True)
                        st.download_button("⬇️ Download Prediction", data=result,
                                           file_name="case_prediction.txt", mime="text/plain")
                    except Exception as e:
                        st.error(f"Error: {str(e)}")

    # ── TAB 2: Strategy ──
    with tab2:
        case_desc = st.text_area("Describe Your Case",
                                  placeholder="Detailed description of the legal situation...",
                                  height=200)
        side = st.radio("Generate Strategy For",
                        ["Plaintiff / Complainant", "Defendant / Accused"], horizontal=True)

        if st.button("⚔️ Get Legal Strategy", key="strategy_btn"):
            if not case_desc.strip():
                st.warning("Please describe your case.")
            else:
                side_val = "plaintiff" if "Plaintiff" in side else "defendant"
                with st.spinner("Building legal strategy..."):
                    try:
                        strategy = get_strategy(case_desc, side_val)
                        st.markdown("### ⚔️ Legal Strategy")
                        st.markdown(f'<div class="result-box">{strategy}</div>', unsafe_allow_html=True)
                        st.download_button("⬇️ Download Strategy", data=strategy,
                                           file_name="legal_strategy.txt", mime="text/plain")
                    except Exception as e:
                        st.error(f"Error: {str(e)}")

    # ── TAB 3: FIR ──
    with tab3:
        st.markdown("""
        <div style="background:#0d1b2a; border:1px solid #1e3a5f; border-left:3px solid #c9a84c;
            border-radius:8px; padding:10px 14px; margin-bottom:1rem; color:#8a9bb5; font-size:0.8rem;">
            Paste FIR or police complaint text for analysis under IPC / BNSS.
        </div>
        """, unsafe_allow_html=True)

        fir_text = st.text_area("FIR / Complaint Text",
                                 placeholder="Paste the FIR or complaint text here...",
                                 height=250)

        if st.button("📋 Analyze FIR", key="fir_btn"):
            if not fir_text.strip():
                st.warning("Please paste the FIR/complaint text.")
            else:
                with st.spinner("Analyzing FIR under Indian Criminal Law..."):
                    try:
                        analysis = analyze_fir(fir_text)
                        st.markdown("### 📋 FIR Analysis")
                        st.markdown(f'<div class="result-box">{analysis}</div>', unsafe_allow_html=True)
                        st.download_button("⬇️ Download FIR Analysis", data=analysis,
                                           file_name="fir_analysis.txt", mime="text/plain")
                    except Exception as e:
                        st.error(f"Error: {str(e)}")