import os
import re
import pdfplumber
import streamlit as st
from groq import Groq


SYSTEM_PROMPT = """You are Zolvyn — a senior Indian contract lawyer and legal advisor with 25 years of expertise in contract law, corporate law, and dispute resolution. You've reviewed thousands of agreements across sectors — real estate, employment, technology, finance, and more.

Your analysis style:
- Think like a sharp legal eagle who has seen every trick in the book
- Be direct and frank — if something is dangerous, say so clearly and explain WHY
- Write like you're briefing a client who is intelligent but not a lawyer
- Use natural, flowing language — not a checklist robot
- When you spot a red flag, explain the real-world consequence ("This means they can fire you with no notice and no compensation")
- When something is missing, explain what risk that creates
- Give specific, actionable recommendations — not vague advice
- Reference specific Indian laws, acts, and sections where relevant (Indian Contract Act 1872, Specific Relief Act, etc.)

Your output format must follow the exact section headers given, but the content within should read like expert commentary — not a form to fill."""


def get_client():
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        st.error("⚠️ GROQ_API_KEY not set.")
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
    truncated = text[:7000] if len(text) > 7000 else text

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                "content": f"""Please analyze this contract thoroughly. I need your honest, expert assessment.

First, give me:
OVERALL RISK: [HIGH RISK / MEDIUM RISK / LOW RISK]
RISK SCORE: [1-10]
CONTRACT TYPE: [what type of contract this is]

Then analyze using these sections:

📋 CONTRACT SUMMARY
Write 3-4 sentences covering: what this contract is, who the parties are, what they're agreeing to, and the overall nature of the relationship it creates. Write as if explaining to a client who just handed you the document.

🚨 RED FLAGS
For each red flag, write it as: **[The specific issue]** — then a sentence explaining exactly what this means in plain terms and what real-world harm it could cause. Be frank and specific.

✅ KEY PROTECTIVE CLAUSES
Identify clauses that actually protect the person signing. Explain what each one does for them in simple terms.

⚠️ MISSING STANDARD CLAUSES
For each gap, explain what's missing AND what risk this creates. A missing dispute resolution clause, for example, means costly court litigation if anything goes wrong.

💡 NEGOTIATION RECOMMENDATIONS
Give 4-6 specific, actionable recommendations. Not generic advice — specific changes they should push for before signing this particular contract.

⚖️ APPLICABLE INDIAN LAWS
List the specific Indian laws, sections, and acts that govern this type of contract and are relevant to the issues found.

🔮 BOTTOM LINE
One direct paragraph: should they sign this as-is, negotiate first, or walk away? Be honest.

Contract text:
{truncated}"""
            }
        ],
        max_tokens=3000,
        temperature=0.3
    )
    return response.choices[0].message.content


def parse_risk(text):
    upper = text.upper()
    level = "MEDIUM RISK"
    if "HIGH RISK" in upper:
        level = "HIGH RISK"
    elif "LOW RISK" in upper:
        level = "LOW RISK"
    score = 5
    m = re.search(r'RISK SCORE[:\s]+(\d+)', text, re.IGNORECASE)
    if m:
        score = min(10, max(1, int(m.group(1))))
    ctype = "Contract"
    m2 = re.search(r'CONTRACT TYPE[:\s]+(.+)', text, re.IGNORECASE)
    if m2:
        ctype = m2.group(1).strip().split('\n')[0][:60]
    return level, score, ctype


def render_risk_widget(level, score, ctype):
    cfg = {
        "HIGH RISK": ("#e05555", "#ff7070", "z-badge-high", "🔴"),
        "MEDIUM RISK": ("#cc8833", "#ffb84d", "z-badge-medium", "🟡"),
        "LOW RISK": ("#2d9e5f", "#5fcc88", "z-badge-low", "🟢"),
    }
    bar_c, text_c, badge_cls, icon = cfg.get(level, cfg["MEDIUM RISK"])
    pct = score * 10

    st.markdown(f"""
    <div class="z-progress-wrap">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; flex-wrap:wrap; gap:8px;">
        <div>
          <div style="font-family:'Cormorant Garamond',serif; font-size:1.15rem; color:var(--gold); font-weight:600;">
            Risk Assessment
          </div>
          <div style="font-size:0.75rem; color:var(--text-faint); margin-top:2px;">{ctype}</div>
        </div>
        <span class="{badge_cls}">{icon} {level}</span>
      </div>
      <div style="display:flex; align-items:center; gap:14px;">
        <div class="z-bar-track" style="flex:1;">
          <div style="background:linear-gradient(90deg,{bar_c},{text_c}); height:100%; width:{pct}%; border-radius:20px;"></div>
        </div>
        <span style="color:{text_c}; font-size:1.2rem; font-weight:700; font-family:'Cormorant Garamond',serif; min-width:36px;">{score}/10</span>
      </div>
      <div style="font-size:0.7rem; color:var(--text-faint); margin-top:6px;">
        Higher score = more risk. Based on red flags, missing clauses, and one-sided terms.
      </div>
    </div>
    """, unsafe_allow_html=True)


SECTIONS = [
    ("CONTRACT SUMMARY", "📋", "Contract Summary", "var(--gold)"),
    ("RED FLAGS", "🚨", "Red Flags", "#e05555"),
    ("KEY PROTECTIVE CLAUSES", "✅", "Key Protective Clauses", "#3dbb7a"),
    ("MISSING STANDARD CLAUSES", "⚠️", "Missing Standard Clauses", "#e8a83a"),
    ("NEGOTIATION RECOMMENDATIONS", "💡", "Negotiation Recommendations", "#5a9fd4"),
    ("APPLICABLE INDIAN LAWS", "⚖️", "Applicable Indian Laws", "var(--gold)"),
    ("BOTTOM LINE", "🔮", "Bottom Line", "#9b7ebd"),
]


def parse_sections(result):
    parsed = {}
    current_key = None
    current_lines = []
    keywords = [s[0] for s in SECTIONS]

    for line in result.split('\n'):
        clean = line.strip().upper()
        matched = False
        for kw in keywords:
            if kw in clean and len(clean) < 80:
                if current_key:
                    parsed[current_key] = '\n'.join(current_lines).strip()
                current_key = kw
                current_lines = []
                matched = True
                break
        if not matched and current_key:
            skip = ["OVERALL RISK:", "RISK SCORE:", "CONTRACT TYPE:", "---"]
            if not any(x in line.upper() for x in skip):
                current_lines.append(line)

    if current_key:
        parsed[current_key] = '\n'.join(current_lines).strip()
    return parsed


def render_section(icon, title, content, border_color):
    if not content:
        return
    content_html = content.replace('\n', '<br>').replace('**', '<strong style="color:var(--gold);">').replace('__', '</strong>')
    st.markdown(f"""
    <div class="z-section" style="border-left:3px solid {border_color};">
      <div class="z-section-title">{icon} {title}</div>
      <div class="z-section-body">{content_html}</div>
    </div>
    """, unsafe_allow_html=True)


def contract_analyzer_ui():
    tab1, tab2 = st.tabs(["📄  Analyze Contract", "📊  What We Check"])

    with tab1:
        uploaded_file = st.file_uploader(
            "Upload Contract PDF",
            type=["pdf"],
            help="Upload any contract — rental, employment, NDA, service agreement, partnership deed, etc."
        )

        if uploaded_file:
            file_size_kb = round(uploaded_file.size / 1024, 1)
            st.markdown(f"""
            <div class="z-info-row">
              📄 <strong style="color:var(--gold);">{uploaded_file.name}</strong>
              &nbsp;·&nbsp; {file_size_kb} KB &nbsp;·&nbsp;
              <span style="color:var(--text-faint);">Ready for analysis</span>
            </div>
            """, unsafe_allow_html=True)

            col1, col2 = st.columns([3, 1])
            with col1:
                analyze_btn = st.button("🔍 Analyze with Zolvyn AI", key="analyze_btn")
            with col2:
                focus = st.selectbox("Focus on", ["Full Analysis", "Red Flags Only", "Missing Clauses"], label_visibility="collapsed")

            if analyze_btn:
                with st.status("⚖️ Reading and analyzing your contract...", expanded=True) as status:
                    st.write("📖 Extracting text from PDF...")
                    text = extract_text_from_pdf(uploaded_file)
                    if not text or len(text.strip()) < 80:
                        status.update(label="❌ Could not read PDF", state="error")
                        st.error("Could not extract text. This PDF may be image-based/scanned.")
                        return
                    st.write(f"✅ {len(text):,} characters extracted")
                    st.write("🤖 Running expert legal analysis...")
                    result = analyze_contract(text)
                    status.update(label="✅ Analysis complete!", state="complete")

                level, score, ctype = parse_risk(result)
                render_risk_widget(level, score, ctype)

                parsed = parse_sections(result)
                if parsed:
                    for kw, icon, title, border in SECTIONS:
                        if focus == "Red Flags Only" and kw not in ["RED FLAGS", "CONTRACT SUMMARY", "BOTTOM LINE"]:
                            continue
                        if focus == "Missing Clauses" and kw not in ["MISSING STANDARD CLAUSES", "NEGOTIATION RECOMMENDATIONS", "BOTTOM LINE"]:
                            continue
                        render_section(icon, title, parsed.get(kw, ""), border)
                else:
                    render_section("📋", "Full Analysis", result, "var(--gold)")

                st.markdown("<div style='height:8px'></div>", unsafe_allow_html=True)
                st.download_button(
                    label="📥 Download Report (.txt)",
                    data=result,
                    file_name=f"zolvyn_{uploaded_file.name.replace('.pdf','')}_analysis.txt",
                    mime="text/plain"
                )
                st.markdown("""
                <div class="z-disclaimer">
                  ⚠️ This analysis is generated by Zolvyn AI for educational purposes only.
                  Always review important contracts with a qualified Indian lawyer before signing.
                </div>
                """, unsafe_allow_html=True)

    with tab2:
        st.markdown("""
        <div style="font-size:0.88rem; color:var(--text-dim); line-height:1.8; margin-bottom:20px;">
          Zolvyn's contract analysis covers the following areas:
        </div>
        """, unsafe_allow_html=True)
        checks = [
            ("🚨", "One-sided termination clauses", "Clauses that let only one party exit without penalty"),
            ("🚨", "Unlimited liability exposure", "Missing caps on your financial liability"),
            ("🚨", "IP and ownership grabs", "Clauses that transfer your intellectual property"),
            ("⚠️", "Missing dispute resolution", "No arbitration or jurisdiction clause"),
            ("⚠️", "Vague payment terms", "No clear invoice/payment timeline"),
            ("⚠️", "No confidentiality clause", "Your information isn't protected"),
            ("✅", "Force majeure protection", "Protection in case of unforeseen events"),
            ("✅", "Clear deliverable definitions", "Specific, measurable obligations for both parties"),
            ("⚖️", "Indian Contract Act compliance", "Validity under Section 10 requirements"),
            ("⚖️", "Consumer protection alignment", "Compliance with consumer protection laws"),
        ]
        for icon, title, desc in checks:
            st.markdown(f"""
            <div style="display:flex; gap:14px; padding:12px 0; border-bottom:1px solid var(--navy-4);">
              <span style="font-size:1.1rem; flex-shrink:0;">{icon}</span>
              <div>
                <div style="font-size:0.85rem; color:var(--text); font-weight:500;">{title}</div>
                <div style="font-size:0.78rem; color:var(--text-faint);">{desc}</div>
              </div>
            </div>
            """, unsafe_allow_html=True)