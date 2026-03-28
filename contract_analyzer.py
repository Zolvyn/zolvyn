import os
import re
import pdfplumber
import streamlit as st
from groq import Groq


def get_client():
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        st.error("⚠️ GROQ_API_KEY not found. Add it to your .env file: GROQ_API_KEY=your_key_here")
        st.stop()
    return Groq(api_key=api_key)


def extract_text_from_pdf(uploaded_file):
    text = ""
    try:
        with pdfplumber.open(uploaded_file) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
    except Exception as e:
        st.error(f"Error reading PDF: {e}")
    return text.strip()


def analyze_contract(text):
    client = get_client()
    truncated = text[:6000] if len(text) > 6000 else text
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are Zolvyn AI — an expert legal contract analyzer specializing in Indian law. "
                    "Provide structured, precise analysis. Be direct and actionable. "
                    "Always assess risk as: HIGH RISK / MEDIUM RISK / LOW RISK."
                )
            },
            {
                "role": "user",
                "content": f"""Analyze this contract and provide a structured report:

OVERALL RISK: [HIGH RISK / MEDIUM RISK / LOW RISK]
RISK SCORE: [number out of 10]

---
📋 CONTRACT SUMMARY
[2-3 sentence summary]

---
🚨 RED FLAGS
[List red flags with bullet points]

---
✅ KEY CLAUSES
[List key clauses present]

---
⚠️ MISSING TERMS
[List missing standard clauses]

---
💡 RECOMMENDATIONS
[Numbered recommendations]

---
⚖️ INDIAN LAW APPLICABILITY
[Relevant Indian laws and sections]

Contract Text:
{truncated}"""
            }
        ],
        max_tokens=2500,
        temperature=0.2
    )
    return response.choices[0].message.content


def parse_risk_level(analysis_text):
    upper = analysis_text.upper()
    if "HIGH RISK" in upper:
        risk_level = "HIGH RISK"
    elif "LOW RISK" in upper:
        risk_level = "LOW RISK"
    else:
        risk_level = "MEDIUM RISK"
    risk_score = 5
    score_match = re.search(r'RISK SCORE[:\s]+(\d+)', analysis_text, re.IGNORECASE)
    if score_match:
        risk_score = min(10, max(1, int(score_match.group(1))))
    return risk_level, risk_score


def render_risk_badge(risk_level, risk_score):
    if risk_level == "HIGH RISK":
        badge_class, color, bar_color, icon = "risk-high", "#ff6b6b", "#cc3333", "🔴"
    elif risk_level == "LOW RISK":
        badge_class, color, bar_color, icon = "risk-low", "#5fcc88", "#33aa66", "🟢"
    else:
        badge_class, color, bar_color, icon = "risk-medium", "#ffaa44", "#cc8833", "🟡"
    bar_pct = risk_score * 10
    st.markdown(f"""
    <div class="prob-bar-wrapper">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
            <span style="font-family:'Cormorant Garamond',serif; font-size:1.1rem; color:#c9a84c; font-weight:600;">
                Contract Risk Assessment
            </span>
            <span class="{badge_class}">{icon} {risk_level}</span>
        </div>
        <div style="display:flex; align-items:center; gap:12px;">
            <div class="prob-bar-track" style="flex:1;">
                <div style="background:linear-gradient(90deg,{bar_color},{color});
                            height:100%; width:{bar_pct}%; border-radius:20px;"></div>
            </div>
            <span style="color:{color}; font-size:1.1rem; font-weight:700;">{risk_score}/10</span>
        </div>
    </div>
    """, unsafe_allow_html=True)


def render_section(icon, title, content, border_color="#1e3a5f"):
    content_html = content.replace('\n', '<br>') if content else "—"
    st.markdown(f"""
    <div class="analysis-card" style="border-left:3px solid {border_color};">
        <div style="font-family:'Cormorant Garamond',serif; font-size:1.05rem;
                    color:#c9a84c; font-weight:600; margin-bottom:10px;">{icon} {title}</div>
        <div style="color:#b0bcc8; font-size:0.86rem; line-height:1.8;">{content_html}</div>
    </div>
    """, unsafe_allow_html=True)


def contract_analyzer_ui():
    st.markdown("""
    <p style="color:#5a7494; font-size:0.88rem; margin-bottom:1.2rem;">
    Upload any contract PDF and Zolvyn AI will analyze it clause by clause for risks,
    red flags, and recommendations under Indian law.
    </p>
    """, unsafe_allow_html=True)

    uploaded_file = st.file_uploader("Upload Contract PDF", type=["pdf"])

    if uploaded_file is not None:
        file_size_kb = round(uploaded_file.size / 1024, 1)
        st.markdown(f"""
        <div style="background:#0d1b2a; border:1px solid #1e3a5f; border-radius:8px;
                    padding:10px 16px; margin:8px 0; font-size:0.82rem; color:#6b8aab;">
            📄 <strong style="color:#c9a84c;">{uploaded_file.name}</strong> · {file_size_kb} KB
        </div>
        """, unsafe_allow_html=True)

        if st.button("🔍 Analyze Contract with Zolvyn AI"):
            with st.status("⚖️ Analyzing your contract...", expanded=True) as status:
                st.write("📖 Reading PDF...")
                text = extract_text_from_pdf(uploaded_file)
                if not text or len(text.strip()) < 100:
                    status.update(label="❌ Could not extract text", state="error")
                    st.error("Could not extract readable text. This PDF may be image-based/scanned.")
                    return
                st.write(f"✅ Extracted {len(text):,} characters")
                st.write("🤖 Running AI legal analysis...")
                result = analyze_contract(text)
                status.update(label="✅ Analysis complete!", state="complete")

            risk_level, risk_score = parse_risk_level(result)
            render_risk_badge(risk_level, risk_score)

            sections_config = [
                ("CONTRACT SUMMARY", "📋", "Contract Summary", "#c9a84c"),
                ("RED FLAGS", "🚨", "Red Flags", "#cc3333"),
                ("KEY CLAUSES", "✅", "Key Clauses", "#33aa66"),
                ("MISSING TERMS", "⚠️", "Missing Terms", "#cc8833"),
                ("RECOMMENDATIONS", "💡", "Recommendations", "#3a6ea8"),
                ("INDIAN LAW APPLICABILITY", "⚖️", "Indian Law Applicability", "#c9a84c"),
            ]

            parsed = {}
            current_key = None
            current_lines = []
            for line in result.split('\n'):
                clean = line.strip().upper()
                matched = False
                for kw, _, _, _ in sections_config:
                    if kw in clean and len(clean) < 70:
                        if current_key:
                            parsed[current_key] = '\n'.join(current_lines).strip()
                        current_key = kw
                        current_lines = []
                        matched = True
                        break
                if not matched and current_key:
                    if not any(x in line.upper() for x in ["OVERALL RISK:", "RISK SCORE:", "---"]):
                        current_lines.append(line)
            if current_key:
                parsed[current_key] = '\n'.join(current_lines).strip()

            if parsed:
                for kw, icon, title, border in sections_config:
                    content = parsed.get(kw, "")
                    if content:
                        render_section(icon, title, content, border_color=border)
            else:
                render_section("📋", "Full Analysis", result)

            st.download_button(
                label="📥 Download Report (.txt)",
                data=result,
                file_name=f"zolvyn_contract_{uploaded_file.name.replace('.pdf','')}.txt",
                mime="text/plain"
            )