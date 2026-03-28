import os
import re
import streamlit as st
from groq import Groq

CASE_TYPES = [
    "Property Dispute",
    "Employment / Labour Dispute",
    "Consumer Complaint",
    "Family / Divorce Matter",
    "Criminal Case",
    "Contract Breach",
    "Cybercrime",
    "Cheque Bounce (NI Act Section 138)",
    "Rent Dispute",
    "Motor Accident Claim",
    "Defamation",
    "Other",
]

CASE_ICONS = {
    "Property Dispute": "🏠",
    "Employment / Labour Dispute": "💼",
    "Consumer Complaint": "🛒",
    "Family / Divorce Matter": "👨‍👩‍👧",
    "Criminal Case": "🔒",
    "Contract Breach": "📋",
    "Cybercrime": "💻",
    "Cheque Bounce (NI Act Section 138)": "💳",
    "Rent Dispute": "🏘️",
    "Motor Accident Claim": "🚗",
    "Defamation": "📢",
    "Other": "⚖️",
}


def get_client():
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        st.error("⚠️ GROQ_API_KEY not found. Add it to your .env file: GROQ_API_KEY=your_key_here")
        st.stop()
    return Groq(api_key=api_key)


def predict_case(case_type, your_side, opponent_side, evidence, location):
    client = get_client()
    prompt = f"""You are Zolvyn AI — an expert Indian legal advisor with 20+ years of court experience.

Analyze this case and provide a detailed structured prediction.

Case Type: {case_type}
Location: {location}

My Side: {your_side}
Opponent's Side: {opponent_side if opponent_side.strip() else "Not provided"}
Evidence: {evidence if evidence.strip() else "Not specified"}

Use EXACTLY this format:

WIN PROBABILITY: [0-100]%
CASE STRENGTH: [STRONG / MODERATE / WEAK]

---
⚖️ CASE ASSESSMENT
[Identify the case type, applicable Indian laws, IPC sections, acts, jurisdiction]

---
📊 OUTCOME ANALYSIS
[Explain the win probability with specific reasoning and case law if applicable]

---
✅ STRENGTHS IN YOUR CASE
[Numbered list of factors working IN your favor]

---
🚨 WEAKNESSES / RISKS
[Numbered list of factors that could HURT your case]

---
💡 RECOMMENDED NEXT STEPS
[Step-by-step action plan: immediate actions, documents to gather, notices to send, which court to file in]

---
⏱️ TIME & COST ESTIMATE
[Realistic timeline and approximate legal costs for this type of case in India]

---
⚠️ DISCLAIMER
[Legal disclaimer paragraph]"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are Zolvyn AI, an expert Indian legal advisor. "
                    "Give detailed, accurate, actionable analysis based on Indian law. Be specific."
                )
            },
            {"role": "user", "content": prompt}
        ],
        max_tokens=3000,
        temperature=0.3
    )
    return response.choices[0].message.content


def parse_probability(text):
    match = re.search(r'WIN PROBABILITY[:\s]+(\d+)', text, re.IGNORECASE)
    if match:
        return min(100, max(0, int(match.group(1))))
    return None


def parse_strength(text):
    match = re.search(r'CASE STRENGTH[:\s]+(STRONG|MODERATE|WEAK)', text, re.IGNORECASE)
    if match:
        return match.group(1).upper()
    return "MODERATE"


def render_probability_widget(probability, strength):
    if probability is None:
        return

    if probability >= 65:
        bar_color, text_color, verdict, v_icon = "#33aa66", "#5fcc88", "Favorable Outlook", "🟢"
    elif probability >= 40:
        bar_color, text_color, verdict, v_icon = "#cc8833", "#ffaa44", "Contested / Uncertain", "🟡"
    else:
        bar_color, text_color, verdict, v_icon = "#cc3333", "#ff6b6b", "Challenging Position", "🔴"

    strength_map = {
        "STRONG": ("risk-low", "#5fcc88"),
        "MODERATE": ("risk-medium", "#ffaa44"),
        "WEAK": ("risk-high", "#ff6b6b"),
    }
    s_class, s_color = strength_map.get(strength, ("risk-medium", "#ffaa44"))

    st.markdown(f"""
    <div class="prob-bar-wrapper">
        <div style="display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:12px; flex-wrap:wrap; gap:8px;">
            <div>
                <div style="font-family:'Cormorant Garamond',serif; font-size:1.1rem; color:#c9a84c; font-weight:600;">
                    ⚖️ Case Outcome Probability
                </div>
                <div style="font-size:0.75rem; color:#3a5470;">Based on facts provided and Indian legal precedents</div>
            </div>
            <div style="display:flex; align-items:center; gap:10px;">
                <span class="{s_class}" style="font-size:0.73rem;">{strength}</span>
                <span style="font-size:0.78rem; color:{text_color};">{v_icon} {verdict}</span>
            </div>
        </div>
        <div style="display:flex; align-items:center; gap:16px;">
            <div style="flex:1;">
                <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                    <span style="font-size:0.7rem; color:#3a5470; text-transform:uppercase; letter-spacing:1px;">Win Probability</span>
                    <span style="font-size:0.7rem; color:#3a5470; text-transform:uppercase; letter-spacing:1px;">Lose Probability</span>
                </div>
                <div class="prob-bar-track">
                    <div style="background:linear-gradient(90deg,{bar_color},{text_color});
                                height:100%; width:{probability}%; border-radius:20px;"></div>
                </div>
                <div style="display:flex; justify-content:space-between; margin-top:4px;">
                    <span style="font-size:1.1rem; font-weight:700; color:{text_color}; font-family:'Cormorant Garamond',serif;">{probability}%</span>
                    <span style="font-size:1.1rem; font-weight:700; color:#ff6b6b; font-family:'Cormorant Garamond',serif;">{100-probability}%</span>
                </div>
            </div>
        </div>
        <div style="font-size:0.7rem; color:#2a4560; margin-top:6px;">
            ⚠️ AI estimate only. Actual outcomes depend on evidence strength, legal representation, and judge.
        </div>
    </div>
    """, unsafe_allow_html=True)


def render_section_card(icon, title, content, border_color="#1e3a5f"):
    content_html = content.replace('\n', '<br>') if content else "—"
    st.markdown(f"""
    <div class="analysis-card" style="border-left:3px solid {border_color};">
        <div style="font-family:'Cormorant Garamond',serif; font-size:1.05rem;
                    color:#c9a84c; font-weight:600; margin-bottom:10px;">{icon} {title}</div>
        <div style="color:#b0bcc8; font-size:0.86rem; line-height:1.8;">{content_html}</div>
    </div>
    """, unsafe_allow_html=True)


def parse_sections(result):
    section_map = {
        "CASE ASSESSMENT": ("⚖️", "Case Assessment & Applicable Law", "#c9a84c"),
        "OUTCOME ANALYSIS": ("📊", "Outcome Analysis", "#7eb8f7"),
        "STRENGTHS": ("✅", "Strengths In Your Case", "#33aa66"),
        "WEAKNESSES": ("🚨", "Weaknesses & Risks", "#cc3333"),
        "NEXT STEPS": ("💡", "Recommended Next Steps", "#3a6ea8"),
        "TIME": ("⏱️", "Time & Cost Estimate", "#9b7ebd"),
        "DISCLAIMER": ("⚠️", "Legal Disclaimer", "#3a5470"),
    }
    parsed = {}
    current_key = None
    current_lines = []
    for line in result.split('\n'):
        clean = line.strip().upper()
        matched = False
        for key in section_map:
            if key in clean and len(clean) < 80 and "WIN PROBABILITY" not in clean and "CASE STRENGTH" not in clean:
                if current_key:
                    parsed[current_key] = '\n'.join(current_lines).strip()
                current_key = key
                current_lines = []
                matched = True
                break
        if not matched and current_key:
            if not any(x in line.upper() for x in ["WIN PROBABILITY:", "CASE STRENGTH:", "---"]):
                current_lines.append(line)
    if current_key:
        parsed[current_key] = '\n'.join(current_lines).strip()
    return parsed, section_map


def case_predictor_ui():
    st.markdown("""
    <p style="color:#5a7494; font-size:0.88rem; margin-bottom:1.2rem;">
    Describe your legal situation in detail. Zolvyn AI will analyze it under Indian law,
    predict the likely outcome, and give you a step-by-step action plan.
    </p>
    """, unsafe_allow_html=True)

    col1, col2 = st.columns(2)
    with col1:
        case_type = st.selectbox(
            "Case Type",
            CASE_TYPES,
            format_func=lambda x: f"{CASE_ICONS.get(x, '⚖️')}  {x}"
        )
    with col2:
        location = st.text_input("Your State / City", placeholder="e.g. Mumbai, Maharashtra")

    your_side = st.text_area(
        "📝 Your Side of the Story",
        placeholder="Describe what happened in as much detail as possible. Include dates, amounts, events, and what the other party did or failed to do.",
        height=150
    )

    col1, col2 = st.columns(2)
    with col1:
        opponent_side = st.text_area(
            "🧑‍💼 Opponent's Side (if known)",
            placeholder="What is the other party claiming?",
            height=110
        )
    with col2:
        evidence = st.text_area(
            "📁 Evidence You Have",
            placeholder="e.g. Written agreement, receipts, WhatsApp messages, emails, bank statements...",
            height=110
        )

    if st.button("🔮 Predict My Case Outcome"):
        if not your_side.strip():
            st.warning("⚠️ Please describe your side of the story first!")
            return
        if not location.strip():
            st.warning("⚠️ Please enter your location for jurisdiction-specific analysis.")
            return

        with st.status("⚖️ Zolvyn AI is analyzing your case...", expanded=True) as status:
            st.write(f"Identifying applicable Indian laws for {case_type}...")
            st.write(f"Analyzing jurisdiction: {location}...")
            st.write("Calculating outcome probability...")
            try:
                prediction = predict_case(case_type, your_side, opponent_side, evidence, location)
                status.update(label="✅ Analysis complete!", state="complete")
            except Exception as e:
                status.update(label="❌ Error", state="error")
                st.error(f"Error: {e}")
                return

        case_icon = CASE_ICONS.get(case_type, "⚖️")
        st.markdown(f"""
        <div style="font-family:'Cormorant Garamond',serif; font-size:1.5rem;
                    color:#c9a84c; font-weight:600; margin:16px 0 4px;">
            {case_icon} Case Analysis — {case_type}
        </div>
        <div style="font-size:0.72rem; color:#2a4560; margin-bottom:14px; letter-spacing:1px;">
            JURISDICTION: {location.upper()} &nbsp;·&nbsp; POWERED BY ZOLVYN AI
        </div>
        """, unsafe_allow_html=True)

        probability = parse_probability(prediction)
        strength = parse_strength(prediction)
        render_probability_widget(probability, strength)

        parsed, section_map = parse_sections(prediction)
        section_order = [
            ("CASE ASSESSMENT", "#c9a84c"),
            ("OUTCOME ANALYSIS", "#3a6ea8"),
            ("STRENGTHS", "#33aa66"),
            ("WEAKNESSES", "#cc3333"),
            ("NEXT STEPS", "#3a6ea8"),
            ("TIME", "#6a4a9b"),
            ("DISCLAIMER", "#2a3f5a"),
        ]
        for key, border in section_order:
            if key in parsed and parsed[key]:
                icon, title, _ = section_map[key]
                render_section_card(icon, title, parsed[key], border_color=border)

        if not parsed:
            render_section_card("📋", "Full Analysis", prediction)

        col1, col2 = st.columns(2)
        filename = f"zolvyn_case_{case_type.lower().replace(' ','_').replace('/','_').replace('(','').replace(')','')}.txt"
        with col1:
            st.download_button(label="📥 Download Report (.txt)", data=prediction, file_name=filename, mime="text/plain")
        with col2:
            st.markdown("""
            <a href="https://www.legalserviceindia.com/lawyers/lawyers_home.htm" target="_blank"
               style="display:block; background:rgba(201,168,76,0.1); border:1px solid rgba(201,168,76,0.3);
                      color:#c9a84c; text-decoration:none; border-radius:8px; padding:10px;
                      text-align:center; font-size:0.85rem; font-weight:600; margin-top:4px;">
                👨‍⚖️ Find a Lawyer in India →
            </a>
            """, unsafe_allow_html=True)