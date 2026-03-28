import os
import streamlit as st
from groq import Groq

SYSTEM_PROMPT = """You are Zolvyn — India's most trusted legal encyclopedia, powered by deep expertise in all Indian legislation. You specialize in explaining Indian laws in a way that is simultaneously expert-accurate and completely understandable to a layperson.

When explaining a legal section or provision:
- Start with a one-sentence plain-English summary of what the section does
- Then give the technical legal explanation
- Break down who it applies to, what it prohibits/allows/requires, and what the consequences are
- Give 1-2 concrete real-world examples of how this section comes into play
- Mention related sections or acts that are commonly used alongside this one
- If there are important landmark Supreme Court judgments on this section, mention them briefly
- Note any common misconceptions about the section

Write like the best law professor you've ever had — one who could explain Section 302 IPC to a teenager and to a Supreme Court advocate equally well.

Format cleanly with clear headers. Keep it comprehensive but readable."""

POPULAR_ACTS = {
    "Indian Penal Code (IPC)": [
        "Section 420 — Cheating", "Section 302 — Murder", "Section 304B — Dowry Death",
        "Section 498A — Cruelty by Husband", "Section 376 — Rape",
        "Section 120B — Criminal Conspiracy", "Section 406 — Criminal Breach of Trust",
        "Section 354 — Assault on Woman", "Section 307 — Attempt to Murder",
        "Section 323 — Voluntarily Causing Hurt"
    ],
    "Code of Criminal Procedure (CrPC)": [
        "Section 41 — Arrest without Warrant", "Section 154 — FIR Registration",
        "Section 161 — Examination of Witnesses", "Section 438 — Anticipatory Bail",
        "Section 439 — Regular Bail", "Section 125 — Maintenance",
        "Section 156 — Investigation by Police", "Section 173 — Police Report (Chargesheet)"
    ],
    "Consumer Protection Act 2019": [
        "Section 2 — Definitions (Consumer, Defect, Deficiency)",
        "Section 35 — Filing a Complaint", "Section 47 — State Commission Jurisdiction",
        "Section 58 — National Commission Jurisdiction",
    ],
    "Indian Contract Act 1872": [
        "Section 10 — What Agreements are Contracts", "Section 23 — Unlawful Object",
        "Section 56 — Void Agreement (Frustration)", "Section 73 — Compensation for Breach",
        "Section 74 — Compensation for Breach — Penalty Clause"
    ],
    "RTI Act 2005": [
        "Section 6 — Request for Information", "Section 7 — Disposal of Request",
        "Section 8 — Exemptions", "Section 19 — Appeals"
    ],
    "NI Act (Cheque Bounce)": [
        "Section 138 — Dishonour of Cheque", "Section 139 — Presumption",
        "Section 141 — Company Offences", "Section 143 — Summary Trial"
    ],
}


def get_client():
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        st.error("⚠️ GROQ_API_KEY not set.")
        st.stop()
    return Groq(api_key=api_key)


def lookup_section(query):
    client = get_client()
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                "content": f"""Please explain the following Indian law section or provision in detail:

{query}

Structure your response with:
📌 PLAIN ENGLISH SUMMARY
[One sentence — what does this section actually do?]

📖 FULL EXPLANATION
[Detailed breakdown of the provision]

👥 WHO IT APPLIES TO
[Who can use this section / who can be prosecuted under it]

⚖️ WHAT IT SAYS (KEY ELEMENTS)
[The essential ingredients/requirements for this section to apply]

🔨 CONSEQUENCES / PUNISHMENT
[What happens when this section is invoked — penalties, remedies, etc.]

📋 REAL WORLD EXAMPLES
[2 concrete examples of how this plays out in real life]

🔗 RELATED SECTIONS
[Other sections/acts commonly used alongside this one]

🏛️ KEY JUDGMENTS
[Any important Supreme Court or High Court judgments on this section]

❗ COMMON MISCONCEPTIONS
[What people often get wrong about this section]"""
            }
        ],
        max_tokens=2500,
        temperature=0.3
    )
    return response.choices[0].message.content


def render_result(result):
    SECTION_MAP = [
        ("PLAIN ENGLISH SUMMARY", "📌", "Plain English Summary", "var(--gold)"),
        ("FULL EXPLANATION", "📖", "Full Explanation", "#5a9fd4"),
        ("WHO IT APPLIES TO", "👥", "Who It Applies To", "#5a9fd4"),
        ("WHAT IT SAYS", "⚖️", "Key Elements", "var(--gold)"),
        ("CONSEQUENCES", "🔨", "Consequences / Punishment", "#e05555"),
        ("REAL WORLD EXAMPLES", "📋", "Real World Examples", "#3dbb7a"),
        ("RELATED SECTIONS", "🔗", "Related Sections & Acts", "#9b7ebd"),
        ("KEY JUDGMENTS", "🏛️", "Key Court Judgments", "#5a9fd4"),
        ("COMMON MISCONCEPTIONS", "❗", "Common Misconceptions", "#e8a83a"),
    ]

    parsed = {}
    current_key = None
    current_lines = []

    for line in result.split('\n'):
        clean = line.strip().upper()
        matched = False
        for kw, _, _, _ in SECTION_MAP:
            if kw in clean and len(clean) < 80:
                if current_key:
                    parsed[current_key] = '\n'.join(current_lines).strip()
                current_key = kw
                current_lines = []
                matched = True
                break
        if not matched and current_key:
            if line.strip() and not line.strip().startswith('---'):
                current_lines.append(line)

    if current_key:
        parsed[current_key] = '\n'.join(current_lines).strip()

    if parsed:
        for kw, icon, title, border in SECTION_MAP:
            content = parsed.get(kw, "")
            if content:
                content_html = content.replace('\n', '<br>')
                st.markdown(f"""
                <div class="z-section" style="border-left:3px solid {border};">
                  <div class="z-section-title">{icon} {title}</div>
                  <div class="z-section-body">{content_html}</div>
                </div>
                """, unsafe_allow_html=True)
    else:
        st.markdown(f"""
        <div class="z-section" style="border-left:3px solid var(--gold);">
          <div class="z-section-body">{result.replace(chr(10), '<br>')}</div>
        </div>
        """, unsafe_allow_html=True)


def bare_acts_ui():
    st.markdown("""
    <div style="font-size:0.87rem; color:var(--text-dim); margin-bottom:20px; line-height:1.7; max-width:700px;">
      Search any Indian law section — IPC, CrPC, Consumer Protection Act, Contract Act, RTI, and more.
      Get expert explanations in plain language with real examples.
    </div>
    """, unsafe_allow_html=True)

    tab1, tab2 = st.tabs(["🔍  Search Any Section", "📚  Popular Provisions"])

    with tab1:
        col1, col2 = st.columns([4, 1])
        with col1:
            query = st.text_input(
                "Search Indian Law",
                placeholder="e.g. Section 420 IPC   |   Section 138 NI Act   |   What is anticipatory bail   |   Consumer rights for defective product",
                key="bare_act_search"
            )
        with col2:
            search_btn = st.button("⚡ Search", key="bare_search_btn")

        # Quick popular searches
        st.markdown("<div style='font-size:0.73rem; color:var(--text-faint); letter-spacing:1px; text-transform:uppercase; margin:12px 0 8px;'>Popular Searches</div>", unsafe_allow_html=True)
        popular = ["Section 420 IPC", "Section 138 NI Act", "Anticipatory bail", "FIR procedure", "Consumer complaint process", "Section 498A IPC"]
        pcols = st.columns(3)
        for i, p in enumerate(popular):
            with pcols[i % 3]:
                if st.button(p, key=f"popular_{i}"):
                    query = p
                    search_btn = True

        if search_btn and query and query.strip():
            with st.status(f"⚡ Looking up: {query}", expanded=True) as status:
                st.write("Searching Indian law database...")
                try:
                    result = lookup_section(query)
                    status.update(label="✅ Found!", state="complete")
                    st.markdown(f"""
                    <div style="font-family:'Cormorant Garamond',serif; font-size:1.4rem; color:var(--gold);
                                font-weight:600; margin: 16px 0 12px;">
                      ⚡ {query}
                    </div>
                    """, unsafe_allow_html=True)
                    render_result(result)
                    st.download_button(
                        "📥 Save This",
                        data=result,
                        file_name=f"zolvyn_{query.lower().replace(' ','_')}.txt",
                        mime="text/plain"
                    )
                except Exception as e:
                    status.update(label="❌ Error", state="error")
                    st.error(f"Error: {e}")
        elif search_btn:
            st.warning("Please enter a section or law to search.")

    with tab2:
        st.markdown("""
        <div style="font-size:0.85rem; color:var(--text-dim); margin-bottom:20px;">
          Click any provision below to get an instant expert explanation.
        </div>
        """, unsafe_allow_html=True)

        for act_name, sections in POPULAR_ACTS.items():
            st.markdown(f"""
            <div style="font-family:'Cormorant Garamond',serif; font-size:1.05rem; color:var(--gold);
                        font-weight:600; margin: 20px 0 10px; border-bottom:1px solid var(--navy-4); padding-bottom:6px;">
              {act_name}
            </div>
            """, unsafe_allow_html=True)
            cols = st.columns(2)
            for i, section in enumerate(sections):
                with cols[i % 2]:
                    if st.button(section, key=f"act_{act_name}_{i}"):
                        with st.status(f"⚡ Loading {section}...", expanded=True) as status:
                            st.write("Fetching expert explanation...")
                            try:
                                result = lookup_section(f"{section} — {act_name}")
                                status.update(label="✅ Ready!", state="complete")
                                st.markdown(f"""
                                <div style="font-family:'Cormorant Garamond',serif; font-size:1.3rem; color:var(--gold);
                                            font-weight:600; margin:16px 0 10px;">{section}</div>
                                """, unsafe_allow_html=True)
                                render_result(result)
                            except Exception as e:
                                status.update(label="❌ Error", state="error")
                                st.error(f"Error: {e}")