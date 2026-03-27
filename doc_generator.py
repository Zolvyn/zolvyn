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

SYSTEM_PROMPT = """You are an expert legal document drafter with deep expertise in Indian law.
You create professional, legally sound documents including contracts, agreements, notices,
affidavits, and legal letters. Your documents are clear, enforceable, and compliant with
relevant Indian legislation."""

DOCUMENT_TYPES = [
    "Non-Disclosure Agreement (NDA)",
    "Employment Agreement",
    "Service Agreement",
    "Rental / Lease Agreement",
    "Partnership Agreement",
    "Memorandum of Understanding (MOU)",
    "Freelance / Consulting Agreement",
    "Sale Agreement",
    "Affidavit",
    "Power of Attorney",
    "Vendor Agreement",
    "Software License Agreement",
]


# ─────────────────────────────────────────────────────────────────────────────
# CORE FUNCTIONS
# ─────────────────────────────────────────────────────────────────────────────
def generate_document(doc_type: str, party_details: dict, key_terms: dict, extra: str = "") -> str:
    party_info = "\n".join([f"- {k}: {v}" for k, v in party_details.items()])
    terms_info = "\n".join([f"- {k}: {v}" for k, v in key_terms.items()])

    prompt = f"""Draft a complete, professional, and legally valid {doc_type} under Indian law.

PARTY DETAILS:
{party_info}

KEY TERMS & CONDITIONS:
{terms_info}

ADDITIONAL REQUIREMENTS:
{extra.strip() if extra else "None"}

Requirements:
1. Use proper legal language and formatting with clear numbered sections
2. Include all standard clauses for this document type
3. Add relevant Indian law references where applicable
4. Include dispute resolution / arbitration / jurisdiction clause
5. Add complete signature blocks for all parties
6. Use [DATE] as placeholder for dates
7. Make it comprehensive and immediately usable"""

    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user",   "content": prompt},
        ],
        temperature=0.2,
        max_tokens=4096,
    )
    return response.choices[0].message.content


def generate_legal_notice(sender: str, receiver: str, subject: str,
                           facts: str, demand: str, advocate: str = "") -> str:
    prompt = f"""Draft a formal Legal Notice under Indian law:

SENDER: {sender}
RECIPIENT: {receiver}
SUBJECT: {subject}
FACTS: {facts}
DEMAND: {demand}
ADVOCATE: {advocate if advocate else "Self-represented"}

The notice must:
1. Follow standard Indian legal notice format
2. Cite relevant laws if applicable
3. State clear compliance timeline (15–30 days)
4. Include consequences of non-compliance
5. Be formal, professional, and legally sound
6. Include date and address placeholders"""

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
def doc_generator_ui():
    tab1, tab2 = st.tabs(["📃 Generate Document", "📬 Legal Notice"])

    # ── TAB 1: Document ──
    with tab1:
        col1, col2 = st.columns(2)
        with col1:
            doc_type     = st.selectbox("Document Type", DOCUMENT_TYPES)
            jurisdiction = st.text_input("Jurisdiction / State", value="India")
            duration     = st.text_input("Duration / Term", placeholder="e.g. 1 year, 24 months")
            payment      = st.text_input("Payment / Consideration", placeholder="e.g. ₹50,000/month")
        with col2:
            party1_name  = st.text_input("Party 1 Name", placeholder="e.g. Rahul Sharma")
            party1_role  = st.text_input("Party 1 Role", placeholder="e.g. Employer / Buyer")
            party2_name  = st.text_input("Party 2 Name", placeholder="e.g. Priya Patel")
            party2_role  = st.text_input("Party 2 Role", placeholder="e.g. Employee / Seller")
            start_date   = st.text_input("Start Date", placeholder="e.g. 01 April 2025")

        extra_req = st.text_area("Additional Requirements (Optional)",
                                  placeholder="Any specific clauses, conditions...", height=80)

        if st.button("📝 Generate Document", key="doc_btn"):
            if not all([party1_name.strip(), party2_name.strip()]):
                st.warning("Please fill in both party names.")
            else:
                party_details = {
                    f"Party 1 ({party1_role or 'Party A'})": party1_name,
                    f"Party 2 ({party2_role or 'Party B'})": party2_name,
                    "Jurisdiction": jurisdiction,
                }
                key_terms = {
                    "Duration":             duration    or "As mutually agreed",
                    "Payment/Consideration": payment    or "As mutually agreed",
                    "Start Date":           start_date  or "[DATE]",
                    "Governing Law":        jurisdiction or "India",
                }
                with st.spinner(f"Drafting {doc_type}..."):
                    try:
                        doc = generate_document(doc_type, party_details, key_terms, extra_req)
                        st.markdown(f"### 📄 {doc_type}")
                        st.text_area("Generated Document", value=doc, height=500)
                        st.download_button(
                            "⬇️ Download Document",
                            data=doc,
                            file_name=f"{doc_type.replace(' ', '_').replace('/', '_')}.txt",
                            mime="text/plain",
                        )
                    except Exception as e:
                        st.error(f"Error: {str(e)}")

    # ── TAB 2: Legal Notice ──
    with tab2:
        col1, col2 = st.columns(2)
        with col1:
            sender_name   = st.text_input("Sender Name",    placeholder="Your full name")
            receiver_name = st.text_input("Recipient Name", placeholder="Recipient's full name")
            advocate_name = st.text_input("Advocate (Optional)", placeholder="Leave blank if self-represented")
        with col2:
            notice_subject = st.text_input("Subject", placeholder="e.g. Non-payment of dues")

        notice_facts  = st.text_area("Facts of the Matter",
                                      placeholder="Describe background and facts...", height=120)
        notice_demand = st.text_area("Demand / Relief Sought",
                                      placeholder="e.g. Pay ₹1,50,000 within 15 days...", height=80)

        if st.button("📬 Generate Legal Notice", key="notice_btn"):
            if not all([sender_name.strip(), receiver_name.strip(),
                        notice_subject.strip(), notice_facts.strip()]):
                st.warning("Please fill in all required fields.")
            else:
                with st.spinner("Drafting legal notice..."):
                    try:
                        notice = generate_legal_notice(
                            sender_name, receiver_name, notice_subject,
                            notice_facts, notice_demand, advocate_name
                        )
                        st.markdown("### 📬 Legal Notice")
                        st.text_area("Generated Notice", value=notice, height=500)
                        st.download_button(
                            "⬇️ Download Notice",
                            data=notice,
                            file_name="legal_notice.txt",
                            mime="text/plain",
                        )
                    except Exception as e:
                        st.error(f"Error: {str(e)}")