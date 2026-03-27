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

SYSTEM_PROMPT = """You are an expert contract lawyer and legal analyst with extensive experience 
in reviewing, analyzing, and drafting contracts under Indian law. You identify risks, loopholes, 
unfair clauses, and missing provisions. You provide structured, actionable, professional feedback."""


# ─────────────────────────────────────────────────────────────────────────────
# CORE FUNCTIONS
# ─────────────────────────────────────────────────────────────────────────────
def analyze_contract(contract_text: str) -> str:
    prompt = f"""Analyze the following contract thoroughly and provide a structured report:

CONTRACT TEXT:
{contract_text.strip()}

## 1. Contract Type & Overview
## 2. Key Parties & Obligations
## 3. Important Clauses
## 4. Risk Assessment (for each party)
## 5. Missing Clauses / Red Flags
## 6. Legal Compliance (Indian Law)
## 7. Recommendations
## 8. Overall Risk Rating: Low / Medium / High (with justification)"""

    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user",   "content": prompt},
        ],
        temperature=0.2,
        max_tokens=3000,
    )
    return response.choices[0].message.content


def extract_key_terms(contract_text: str) -> str:
    prompt = f"""From the following contract, extract all important legal terms, clauses, 
and defined words. For each, provide a plain-English explanation.

CONTRACT:
{contract_text.strip()}

Format:
**Term/Clause**: [Name]
**Meaning**: [Plain English explanation]
**Importance**: [Why it matters]
---"""
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


def suggest_improvements(contract_text: str) -> str:
    prompt = f"""Review this contract and provide specific, actionable improvement suggestions.
Focus on: strengthening weak clauses, adding missing protections, clarifying ambiguous language,
ensuring enforceability under Indian law.

CONTRACT:
{contract_text.strip()}"""
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


# ─────────────────────────────────────────────────────────────────────────────
# STREAMLIT UI
# ─────────────────────────────────────────────────────────────────────────────
def contract_analyzer_ui():
    st.markdown("""
    <div style="background:#0d1b2a; border:1px solid #1e3a5f; border-left:3px solid #c9a84c;
        border-radius:8px; padding:12px 16px; margin-bottom:1.2rem; color:#8a9bb5; font-size:0.82rem;">
        📄 Paste your contract text below. All three analysis tabs use the same input.
    </div>
    """, unsafe_allow_html=True)

    contract_text = st.text_area(
        "Paste Contract Text Here",
        placeholder="Paste your full contract here...",
        height=280,
        key="contract_input",
    )

    tab1, tab2, tab3 = st.tabs(["🔍 Full Analysis", "📌 Key Terms", "💡 Improvements"])

    with tab1:
        if st.button("🔍 Analyze Contract", key="analyze_btn"):
            if not contract_text.strip():
                st.warning("Please paste your contract text above.")
            else:
                with st.spinner("Analyzing contract..."):
                    try:
                        result = analyze_contract(contract_text)
                        st.markdown("### 📊 Contract Analysis Report")
                        st.markdown(f'<div class="result-box">{result}</div>', unsafe_allow_html=True)
                        st.download_button("⬇️ Download Report", data=result,
                                           file_name="contract_analysis.txt", mime="text/plain")
                    except Exception as e:
                        st.error(f"Error: {str(e)}")

    with tab2:
        if st.button("📌 Extract Key Terms", key="terms_btn"):
            if not contract_text.strip():
                st.warning("Please paste your contract text above.")
            else:
                with st.spinner("Extracting key terms..."):
                    try:
                        terms = extract_key_terms(contract_text)
                        st.markdown("### 📌 Key Legal Terms")
                        st.markdown(f'<div class="result-box">{terms}</div>', unsafe_allow_html=True)
                        st.download_button("⬇️ Download Terms", data=terms,
                                           file_name="key_terms.txt", mime="text/plain")
                    except Exception as e:
                        st.error(f"Error: {str(e)}")

    with tab3:
        if st.button("💡 Suggest Improvements", key="improve_btn"):
            if not contract_text.strip():
                st.warning("Please paste your contract text above.")
            else:
                with st.spinner("Generating improvement suggestions..."):
                    try:
                        improvements = suggest_improvements(contract_text)
                        st.markdown("### 💡 Improvement Suggestions")
                        st.markdown(f'<div class="result-box">{improvements}</div>', unsafe_allow_html=True)
                        st.download_button("⬇️ Download Suggestions", data=improvements,
                                           file_name="contract_improvements.txt", mime="text/plain")
                    except Exception as e:
                        st.error(f"Error: {str(e)}")