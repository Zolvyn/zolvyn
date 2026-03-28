import os
import re
import streamlit as st
from groq import Groq

SYSTEM_PROMPT = """You are Zolvyn — a battle-hardened Indian litigation lawyer with 25 years of courtroom experience across the Supreme Court, various High Courts, and district courts across India. You've argued property disputes, criminal cases, consumer matters, employment disputes, and everything in between.

When analyzing a case:
- Think exactly like a senior advocate preparing a client for what's ahead
- Be honest — don't give false hope, but don't be needlessly pessimistic either
- Cite specific Indian laws, IPC sections, acts, and landmark case judgments where relevant
- Explain legal concepts immediately in plain language: "Section 138 of the NI Act — that's the cheque bounce law"
- Give a realistic win probability with clear reasoning, not a random number
- Your next steps should be specific, sequenced, and immediately actionable
- When you mention a law, briefly explain what it does
- Write like you're sitting across from the client in your chamber, not drafting a legal brief

Your tone is: expert, warm, direct, honest. You care about this person's outcome."""

CASE_TYPES = [
    "Property Dispute", "Employment / Labour Dispute", "Consumer Complaint",
    "Family / Divorce Matter", "Criminal Case", "Contract Breach",
    "Cybercrime", "Cheque Bounce (NI Act Section 138)", "Rent Dispute",
    "Motor Accident Claim (MACT)", "Defamation", "Police / FIR Matter",
    "Land Acquisition", "Medical Negligence", "Other"
]

CASE_ICONS = {
    "Property Dispute": "🏠", "Employment / Labour Dispute": "💼",
    "Consumer Complaint": "🛒", "Family / Divorce Matter": "👨‍👩‍👧",
    "Criminal Case": "🔒", "Contract Breach": "📋",
    "Cybercrime": "💻", "Cheque Bounce (NI Act Section 138)": "💳",
    "Rent Dispute": "🏘️", "Motor Accident Claim (MACT)": "🚗",
    "Defamation": "📢", "Police / FIR Matter": "👮",
    "Land Acquisition": "🌱", "Medical Negligence": "🏥", "Other": "⚖️",
}


def get_client():
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        st.error("⚠️ GROQ_API_KEY not set.")
        st.stop()
    return Groq(api_key=api_key)


def predict_case(case_type, your_side, opponent_side, evidence, location, priority):
    client = get_client()

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                "content": f"""I need your honest expert assessment of this legal matter.

Case Type: {case_type}
Location: {location}
What I want most: {priority}

My situation:
{your_side}

Other side's position:
{opponent_side if opponent_side.strip() else "Not known / they haven't stated their position yet"}

Evidence I have:
{evidence if evidence.strip() else "Nothing specific yet — I need guidance on what to gather"}

Please give me your full analysis using exactly these sections:

WIN PROBABILITY: [0-100]%
CASE STRENGTH: [STRONG / MODERATE / WEAK]
URGENCY: [URGENT / NORMAL / LOW]

---
⚖️ CASE ASSESSMENT
Start by telling me what type of legal matter this is, which court or forum has jurisdiction, and the key laws that apply — with a brief plain-English explanation of each. Tell me if there are any immediate time limits I should know about (like limitation periods).

---
📊 HONEST OUTCOME ANALYSIS
Give me your honest assessment. What are the realistic chances here and why? Don't sugarcoat it. What would make this case stronger or weaker? Reference similar types of cases and typical outcomes in Indian courts.

---
✅ WHAT'S WORKING IN MY FAVOR
Go through the specific facts I've shared and tell me which ones actually help my case and why. Be specific — "The fact that you have written communication is significant because..."

---
🚨 WHAT COULD HURT ME
Same treatment — which facts or gaps in my situation could hurt my case? What will the other side likely argue? What weaknesses do I need to address?

---
💡 YOUR ACTION PLAN FOR ME
Give me a numbered, step-by-step plan starting from today. What do I do first, second, third? Include: what documents to preserve, what legal notices to send, what forum to approach, in what sequence. Be specific about timelines.

---
⏱️ REALISTIC TIME AND COST
What's the typical timeline for this type of case in India? What are the realistic legal costs — filing fees, advocate fees, etc.? Are there faster/cheaper alternatives like consumer forums, labour courts, lok adalat?

---
⚠️ ONE THING YOU MUST KNOW
End with the single most important piece of advice for this specific situation — the one thing that could make or break this case.

---"""
            }
        ],
        max_tokens=3200,
        temperature=0.35
    )
    return response.choices[0].message.content


def parse_meta(text):
    prob, strength, urgency = None, "MODERATE", "NORMAL"
    m = re.search(r'WIN PROBABILITY[:\s]+(\d+)', text, re.IGNORECASE)
    if m:
        prob = min(100, max(0, int(m.group(1))))
    m2 = re.search(r'CASE STRENGTH[:\s]+(STRONG|MODERATE|WEAK)', text, re.IGNORECASE)
    if m2:
        strength = m2.group(1).upper()
    m3 = re.search(r'URGENCY[:\s]+(URGENT|NORMAL|LOW)', text, re.IGNORECASE)
    if m3:
        urgency = m3.group(1).upper()
    return prob, strength, urgency


def render_meta_widget(prob, strength, urgency, case_type, location):
    if prob is None:
        return

    if prob >= 65:
        bar_c, text_c, verdict, v_icon = "#2d9e5f", "#5fcc88", "Favorable Outlook", "🟢"
    elif prob >= 40:
        bar_c, text_c, verdict, v_icon = "#cc8833", "#ffb84d", "Contested Position", "🟡"
    else:
        bar_c, text_c, verdict, v_icon = "#e05555", "#ff7070", "Challenging Position", "🔴"

    s_cfg = {
        "STRONG": ("z-badge-low", "#5fcc88"),
        "MODERATE": ("z-badge-medium", "#ffb84d"),
        "WEAK": ("z-badge-high", "#ff7070"),
    }
    s_cls, s_col = s_cfg.get(strength, s_cfg["MODERATE"])

    u_cfg = {
        "URGENT": ("z-badge-high", "🔴 URGENT"),
        "NORMAL": ("z-badge-medium", "🟡 NORMAL"),
        "LOW": ("z-badge-low", "🟢 LOW"),
    }
    u_cls, u_label = u_cfg.get(urgency, u_cfg["NORMAL"])

    st.markdown(f"""
    <div class="z-progress-wrap">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:16px; flex-wrap:wrap; gap:10px;">
        <div>
          <div style="font-family:'Cormorant Garamond',serif; font-size:1.15rem; color:var(--gold); font-weight:600;">
            Case Outcome Probability
          </div>
          <div style="font-size:0.72rem; color:var(--text-faint); margin-top:2px; letter-spacing:0.5px;">
            {case_type} &nbsp;·&nbsp; {location}
          </div>
        </div>
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <span class="{s_cls}">{strength}</span>
          <span class="{u_cls}">{u_label}</span>
          <span style="font-size:0.78rem; color:{text_c};">{v_icon} {verdict}</span>
        </div>
      </div>

      <div style="display:flex; align-items:center; gap:14px;">
        <span style="font-size:0.7rem; color:var(--text-faint); text-transform:uppercase; letter-spacing:1px; min-width:24px;">Win</span>
        <div class="z-bar-track" style="flex:1;">
          <div style="background:linear-gradient(90deg,{bar_c},{text_c}); height:100%; width:{prob}%; border-radius:20px;"></div>
        </div>
        <span style="font-size:0.7rem; color:var(--text-faint); text-transform:uppercase; letter-spacing:1px; min-width:28px;">Lose</span>
      </div>
      <div style="display:flex; justify-content:space-between; margin-top:6px;">
        <span style="font-family:'Cormorant Garamond',serif; font-size:1.4rem; font-weight:700; color:{text_c};">{prob}%</span>
        <span style="font-family:'Cormorant Garamond',serif; font-size:1.4rem; font-weight:700; color:#ff7070;">{100-prob}%</span>
      </div>
      <div style="font-size:0.68rem; color:var(--text-faint); margin-top:8px; padding-top:8px; border-top:1px solid var(--navy-4);">
        ⚠️ Probability estimate based on stated facts only. Actual outcomes depend on evidence, legal representation, and the judge.
      </div>
    </div>
    """, unsafe_allow_html=True)


SECTIONS = [
    ("CASE ASSESSMENT", "⚖️", "Case Assessment & Jurisdiction", "var(--gold)"),
    ("HONEST OUTCOME ANALYSIS", "📊", "Honest Outcome Analysis", "#5a9fd4"),
    ("WHAT'S WORKING IN MY FAVOR", "✅", "What's Working In Your Favor", "#3dbb7a"),
    ("WHAT COULD HURT ME", "🚨", "What Could Hurt You", "#e05555"),
    ("YOUR ACTION PLAN FOR ME", "💡", "Your Action Plan", "#5a9fd4"),
    ("REALISTIC TIME AND COST", "⏱️", "Realistic Time & Cost", "#9b7ebd"),
    ("ONE THING YOU MUST KNOW", "🎯", "The One Thing You Must Know", "var(--gold)"),
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
            if not any(x in line.upper() for x in ["WIN PROBABILITY:", "CASE STRENGTH:", "URGENCY:", "---"]):
                current_lines.append(line)

    if current_key:
        parsed[current_key] = '\n'.join(current_lines).strip()
    return parsed


def render_section(icon, title, content, border_color):
    if not content:
        return
    content_html = content.replace('\n', '<br>')
    st.markdown(f"""
    <div class="z-section" style="border-left:3px solid {border_color};">
      <div class="z-section-title">{icon} {title}</div>
      <div class="z-section-body">{content_html}</div>
    </div>
    """, unsafe_allow_html=True)


def case_predictor_ui():
    st.markdown("""
    <div style="font-size:0.87rem; color:var(--text-dim); margin-bottom:20px; line-height:1.7; max-width:700px;">
      Tell Zolvyn about your legal situation. The more detail you give, the more accurate and useful the analysis will be.
      Treat this like explaining your case to a senior lawyer at their office.
    </div>
    """, unsafe_allow_html=True)

    col1, col2, col3 = st.columns([2, 2, 1])
    with col1:
        case_type = st.selectbox(
            "Case Type",
            CASE_TYPES,
            format_func=lambda x: f"{CASE_ICONS.get(x,'⚖️')}  {x}"
        )
    with col2:
        location = st.text_input("Your State / City", placeholder="e.g. Mumbai, Maharashtra")
    with col3:
        priority = st.selectbox("My Priority", ["Win the case", "Quick resolution", "Compensation", "Avoid court"])

    your_side = st.text_area(
        "Your Side of the Story",
        placeholder="Describe everything that happened — dates, amounts, people involved, what was agreed, what went wrong, and what you want as a resolution. The more detail, the better the analysis.",
        height=160
    )

    col1, col2 = st.columns(2)
    with col1:
        opponent_side = st.text_area(
            "Other Party's Position (if known)",
            placeholder="What are they claiming? What's their defense or argument?",
            height=110
        )
    with col2:
        evidence = st.text_area(
            "Evidence You Have",
            placeholder="List everything: contracts, receipts, messages, emails, bank statements, photos, witness names, call recordings...",
            height=110
        )

    st.markdown("<div style='height:8px'></div>", unsafe_allow_html=True)

    if st.button("🔮 Analyze My Case", key="predict_btn"):
        if not your_side.strip():
            st.warning("⚠️ Please describe your situation first.")
            return
        if not location.strip():
            st.warning("⚠️ Please enter your location.")
            return

        with st.status("⚖️ Zolvyn is analyzing your case...", expanded=True) as status:
            st.write(f"Identifying applicable laws for {case_type}...")
            st.write(f"Analyzing jurisdiction: {location}...")
            st.write("Preparing honest assessment...")
            try:
                prediction = predict_case(case_type, your_side, opponent_side, evidence, location, priority)
                status.update(label="✅ Analysis ready!", state="complete")
            except Exception as e:
                status.update(label="❌ Error", state="error")
                st.error(f"Error: {e}")
                return

        st.markdown('<div style="height:8px"></div>', unsafe_allow_html=True)
        case_icon = CASE_ICONS.get(case_type, "⚖️")
        st.markdown(f"""
        <div style="font-family:'Cormorant Garamond',serif; font-size:1.5rem; color:var(--gold); font-weight:600; margin-bottom:4px;">
          {case_icon} Case Analysis — {case_type}
        </div>
        """, unsafe_allow_html=True)

        prob, strength, urgency = parse_meta(prediction)
        render_meta_widget(prob, strength, urgency, case_type, location)

        parsed = parse_sections(prediction)
        for kw, icon, title, border in SECTIONS:
            render_section(icon, title, parsed.get(kw, ""), border)

        if not parsed:
            render_section("📋", "Full Analysis", prediction, "var(--gold)")

        st.markdown("<div style='height:12px'></div>", unsafe_allow_html=True)
        col1, col2 = st.columns(2)
        fname = f"zolvyn_case_{case_type.lower().replace(' ','_').replace('/','_').replace('(','').replace(')','')}.txt"
        with col1:
            st.download_button("📥 Download Report", data=prediction, file_name=fname, mime="text/plain")
        with col2:
            st.markdown("""
            <a href="https://districts.ecourts.gov.in" target="_blank"
               style="display:block; background:var(--gold-dim); border:1px solid rgba(201,168,76,0.3);
                      color:var(--gold); text-decoration:none; border-radius:8px; padding:10px;
                      text-align:center; font-size:0.85rem; font-weight:600; margin-top:4px;">
              🏛️ Find Your District Court →
            </a>
            """, unsafe_allow_html=True)

        st.markdown("""
        <div class="z-disclaimer">
          ⚠️ This analysis is generated by Zolvyn AI based solely on the information you provided.
          It is for educational purposes only and does not constitute legal advice.
          For your specific situation, always consult a qualified and licensed Indian advocate.
        </div>
        """, unsafe_allow_html=True)