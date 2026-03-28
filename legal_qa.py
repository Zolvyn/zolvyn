import os
import streamlit as st
from groq import Groq

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
VECTOR_DIR = os.path.join(BASE_DIR, "vectorstore")

SAMPLE_QUESTIONS = [
    "What is Section 420 IPC and what's the punishment?",
    "What are my rights as a tenant in India?",
    "How do I file an FIR? What is the process?",
    "What is anticipatory bail and how to get it?",
    "Explain the Right to Information Act simply",
    "What is Section 498A IPC — dowry harassment?",
    "Consumer rights under the Consumer Protection Act 2019",
    "What happens in a cheque bounce case?",
]

SYSTEM_PROMPT = """You are Zolvyn — an elite Indian legal expert with 25 years of practice across the Supreme Court of India, High Courts, and district courts. You have deep mastery of the IPC, CrPC, CPC, Indian Contract Act, Consumer Protection Act, RTI Act, and all major Indian legislation.

Your communication style:
- Speak like a brilliant, empathetic senior advocate explaining things to a client sitting across the table
- Never sound robotic or like a textbook — be warm, clear, and direct
- Use natural language first, then bring in legal terms with instant plain-English explanation
- Structure your answers beautifully: start with the direct answer, then go deeper
- Use numbered points for steps/procedures, but keep prose flowing and readable
- Be specific — cite exact section numbers, acts, and court precedents where relevant
- Acknowledge complexity honestly — if something depends on facts, say so clearly
- End with one genuinely useful practical tip the person can act on immediately

Format:
- Bold key legal terms and section numbers
- Keep paragraphs short and punchy
- Never use bullet spam — mix prose with structured points
- Always end with: "⚖️ *Quick note: This is legal guidance from Zolvyn AI. For your specific situation, a consultation with a qualified advocate is always the strongest move.*"

You are not a chatbot. You are their trusted legal advisor."""


def get_client():
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        st.error("⚠️ GROQ_API_KEY not set. Add it to your .env file.")
        st.stop()
    return Groq(api_key=api_key)


def check_langchain():
    try:
        from langchain_community.document_loaders import PyPDFLoader
        from langchain_text_splitters import RecursiveCharacterTextSplitter
        from langchain_community.vectorstores import FAISS
        from langchain_huggingface import HuggingFaceEmbeddings
        return True
    except ImportError as e:
        missing = str(e).replace("No module named ", "").strip("'")
        st.markdown(f"""
        <div style="background:var(--navy-2); border:1px solid rgba(224,85,85,0.3); border-left:3px solid #e05555;
                    border-radius:10px; padding:16px 20px; margin:12px 0;">
            <div style="color:#ff7070; font-weight:600; margin-bottom:8px;">📦 Missing Package: {missing}</div>
            <div style="background:var(--navy); border-radius:6px; padding:10px 14px; font-family:monospace; font-size:0.82rem; color:#5fcc88;">
                pip install langchain-community langchain-text-splitters langchain-huggingface faiss-cpu sentence-transformers pypdf tf-keras
            </div>
        </div>
        """, unsafe_allow_html=True)
        return False


def build_vectorstore_from_files(docs):
    from langchain_text_splitters import RecursiveCharacterTextSplitter
    from langchain_community.vectorstores import FAISS
    from langchain_huggingface import HuggingFaceEmbeddings
    splitter = RecursiveCharacterTextSplitter(chunk_size=600, chunk_overlap=80)
    chunks = splitter.split_documents(docs)
    embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    return FAISS.from_documents(chunks, embeddings)


def load_default_vectorstore():
    from langchain_community.vectorstores import FAISS
    from langchain_huggingface import HuggingFaceEmbeddings
    embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    return FAISS.load_local(VECTOR_DIR, embeddings, allow_dangerous_deserialization=True)


def build_default_vectorstore():
    from langchain_community.document_loaders import PyPDFLoader
    from langchain_text_splitters import RecursiveCharacterTextSplitter
    from langchain_community.vectorstores import FAISS
    from langchain_huggingface import HuggingFaceEmbeddings
    docs = []
    if os.path.exists(DATA_DIR):
        for f in os.listdir(DATA_DIR):
            if f.endswith(".pdf"):
                loader = PyPDFLoader(os.path.join(DATA_DIR, f))
                docs.extend(loader.load())
    if not docs:
        return None
    splitter = RecursiveCharacterTextSplitter(chunk_size=600, chunk_overlap=80)
    chunks = splitter.split_documents(docs)
    embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    vs = FAISS.from_documents(chunks, embeddings)
    vs.save_local(VECTOR_DIR)
    return vs


def process_uploaded_pdfs(uploaded_files):
    from langchain_community.document_loaders import PyPDFLoader
    import tempfile
    docs = []
    for uf in uploaded_files:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            tmp.write(uf.read())
            tmp_path = tmp.name
        loader = PyPDFLoader(tmp_path)
        loaded = loader.load()
        for d in loaded:
            d.metadata["source"] = uf.name
        docs.extend(loaded)
        os.unlink(tmp_path)
    return docs


def get_answer_with_rag(question, vectorstore, chat_history):
    client = get_client()
    docs = vectorstore.similarity_search(question, k=5)
    context = "\n\n---\n\n".join([doc.page_content for doc in docs])
    sources = list(set([
        os.path.basename(doc.metadata.get("source", ""))
        for doc in docs if doc.metadata.get("source")
    ]))

    history_text = ""
    if chat_history:
        recent = chat_history[-3:]
        for h in recent:
            history_text += f"User: {h['question']}\nZolvyn: {h['answer'][:300]}...\n\n"

    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    if history_text:
        messages.append({
            "role": "user",
            "content": f"Previous conversation context:\n{history_text}"
        })
        messages.append({"role": "assistant", "content": "Understood, I have the context."})

    messages.append({
        "role": "user",
        "content": f"""Relevant legal document excerpts:
{context}

User's question: {question}

Please answer based on the document context above, combined with your deep knowledge of Indian law."""
    })

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=messages,
        max_tokens=2000,
        temperature=0.4,
    )
    return response.choices[0].message.content, sources


def get_answer_direct(question, chat_history):
    """Answer without RAG using pure legal knowledge."""
    client = get_client()
    history_text = ""
    if chat_history:
        recent = chat_history[-3:]
        for h in recent:
            history_text += f"User: {h['question']}\nZolvyn: {h['answer'][:300]}...\n\n"

    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    if history_text:
        messages.append({"role": "user", "content": f"Previous conversation:\n{history_text}"})
        messages.append({"role": "assistant", "content": "Got it."})
    messages.append({"role": "user", "content": question})

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=messages,
        max_tokens=2000,
        temperature=0.4,
    )
    return response.choices[0].message.content


def legal_qa_ui():
    if "chat_history" not in st.session_state:
        st.session_state.chat_history = []
    if "default_vs" not in st.session_state:
        st.session_state.default_vs = None
    if "user_vs" not in st.session_state:
        st.session_state.user_vs = None
    if "quick_q" not in st.session_state:
        st.session_state.quick_q = ""
    if "uploaded_doc_names" not in st.session_state:
        st.session_state.uploaded_doc_names = []

    if not check_langchain():
        st.info("RAG features require the packages above. Direct Q&A (without document search) still works.")
        langchain_ok = False
    else:
        langchain_ok = True

    # ── Two tabs: Ask Questions | Upload Documents ──
    tab1, tab2 = st.tabs(["💬  Ask Legal Questions", "📂  Upload Your Documents"])

    with tab1:
        # Load default vectorstore
        if langchain_ok and st.session_state.default_vs is None:
            if os.path.exists(os.path.join(VECTOR_DIR, "index.faiss")):
                with st.spinner("Loading knowledge base..."):
                    try:
                        st.session_state.default_vs = load_default_vectorstore()
                    except Exception:
                        pass

        # Knowledge base status
        active_vs = st.session_state.user_vs or st.session_state.default_vs
        if active_vs:
            source = "your uploaded documents" if st.session_state.user_vs else "Zolvyn law database"
            st.markdown(f"""
            <div class="z-info-row">
              <span style="color:var(--gold);">✦</span>
              <span>Knowledge base active — searching <strong style="color:var(--gold);">{source}</strong></span>
            </div>
            """, unsafe_allow_html=True)
        else:
            st.markdown("""
            <div class="z-info-row" style="border-color:rgba(201,168,76,0.2);">
              <span style="color:var(--gold);">⚡</span>
              <span>Running in <strong style="color:var(--gold);">Direct Expert Mode</strong> — answers from Zolvyn's legal knowledge (no document search)</span>
            </div>
            """, unsafe_allow_html=True)

        # Quick question chips
        st.markdown("<div style='height:12px'></div>", unsafe_allow_html=True)
        st.markdown("<div style='font-size:0.75rem; color:var(--text-faint); letter-spacing:1px; text-transform:uppercase; margin-bottom:8px;'>Quick Questions</div>", unsafe_allow_html=True)
        st.markdown('<div class="z-chips">', unsafe_allow_html=True)
        cols = st.columns(4)
        for i, q in enumerate(SAMPLE_QUESTIONS):
            with cols[i % 4]:
                if st.button(q, key=f"chip_{i}"):
                    st.session_state.quick_q = q
        st.markdown('</div>', unsafe_allow_html=True)

        st.markdown('<div style="height:1px; background:linear-gradient(90deg,var(--navy-4),transparent); margin:16px 0 20px;"></div>', unsafe_allow_html=True)

        # Chat history
        if st.session_state.chat_history:
            st.markdown('<div class="z-chat-container">', unsafe_allow_html=True)
            for entry in st.session_state.chat_history:
                answer_html = entry['answer'].replace('\n', '<br>').replace('**', '<strong>').replace('*', '<em>')
                st.markdown(f"""
                <div class="z-msg-user">
                  <div class="z-bubble-user">{entry['question']}</div>
                  <div class="z-avatar-user">You</div>
                </div>
                <div class="z-msg-ai">
                  <div class="z-avatar-ai">⚖️</div>
                  <div>
                    <div class="z-bubble-ai">{answer_html}</div>
                    {"".join([f'<span class="z-source-pill">📄 {s}</span>' for s in entry.get("sources", []) if s]) if entry.get("sources") else ""}
                  </div>
                </div>
                """, unsafe_allow_html=True)
            st.markdown('</div>', unsafe_allow_html=True)

            col1, col2 = st.columns([5, 1])
            with col2:
                if st.button("🗑️ Clear", key="clear_chat"):
                    st.session_state.chat_history = []
                    st.rerun()

            st.markdown('<div style="height:1px; background:linear-gradient(90deg,var(--navy-4),transparent); margin:16px 0 20px;"></div>', unsafe_allow_html=True)

        # Input
        question = st.text_input(
            "Your Legal Question",
            value=st.session_state.quick_q,
            placeholder="e.g. My landlord is refusing to return my security deposit after 3 months — what can I do?",
            key="qa_input"
        )

        col1, col2 = st.columns([4, 1])
        with col1:
            ask = st.button("⚖️ Ask Zolvyn", key="ask_btn")
        with col2:
            if st.button("↺ New", key="new_q"):
                st.session_state.quick_q = ""
                st.rerun()

        if ask and question.strip():
            st.session_state.quick_q = ""
            with st.status("⚖️ Zolvyn is thinking...", expanded=True) as status:
                st.write("Searching legal knowledge...")
                try:
                    active_vs = st.session_state.user_vs or st.session_state.default_vs
                    if active_vs and langchain_ok:
                        answer, sources = get_answer_with_rag(question, active_vs, st.session_state.chat_history)
                    else:
                        answer = get_answer_direct(question, st.session_state.chat_history)
                        sources = []
                    status.update(label="✅ Answer ready!", state="complete")
                    st.session_state.chat_history.append({
                        "question": question,
                        "answer": answer,
                        "sources": sources
                    })
                    st.rerun()
                except Exception as e:
                    status.update(label="❌ Error", state="error")
                    st.error(f"Error: {e}")
        elif ask:
            st.warning("Please enter a question first.")

    with tab2:
        st.markdown("""
        <div style="font-size:0.88rem; color:var(--text-dim); margin-bottom:20px; line-height:1.7;">
          Upload your own legal documents — contracts, court orders, agreements, notices —
          and ask questions about them specifically. Zolvyn will search <em>your</em> documents
          to give you precise, document-specific answers.
        </div>
        """, unsafe_allow_html=True)

        uploaded_files = st.file_uploader(
            "Upload Legal Documents (PDF)",
            type=["pdf"],
            accept_multiple_files=True,
            help="Upload contracts, agreements, court orders, or any legal document"
        )

        if uploaded_files:
            names = [f.name for f in uploaded_files]
            st.markdown(f"""
            <div class="z-info-row">
              📄 {len(uploaded_files)} document(s) ready: <strong style="color:var(--gold);">{", ".join(names)}</strong>
            </div>
            """, unsafe_allow_html=True)

            if st.button("⚡ Index My Documents"):
                if not langchain_ok:
                    st.error("Please install the required packages first.")
                else:
                    with st.status("📚 Indexing your documents...", expanded=True) as status:
                        st.write("Reading PDFs...")
                        docs = process_uploaded_pdfs(uploaded_files)
                        st.write(f"Loaded {len(docs)} pages. Building search index...")
                        st.session_state.user_vs = build_vectorstore_from_files(docs)
                        st.session_state.uploaded_doc_names = names
                        status.update(label="✅ Documents indexed! Go to Ask tab to query them.", state="complete")
                        st.rerun()

        if st.session_state.uploaded_doc_names:
            st.markdown(f"""
            <div style="background:rgba(61,187,122,0.08); border:1px solid rgba(61,187,122,0.25);
                        border-radius:8px; padding:12px 16px; font-size:0.83rem; color:#5fcc88; margin-top:12px;">
              ✅ Active: <strong>{", ".join(st.session_state.uploaded_doc_names)}</strong><br/>
              <span style="color:var(--text-faint); font-size:0.78rem;">Go to the "Ask Legal Questions" tab to query these documents.</span>
            </div>
            """, unsafe_allow_html=True)

            if st.button("🗑️ Remove My Documents", key="remove_docs"):
                st.session_state.user_vs = None
                st.session_state.uploaded_doc_names = []
                st.rerun()

        if not langchain_ok:
            st.markdown("""
            <div style="background:var(--navy-2); border:1px solid var(--navy-4); border-radius:10px;
                        padding:20px; margin-top:20px; text-align:center;">
              <div style="color:var(--text-dim); font-size:0.85rem;">
                Install the packages shown above to enable document upload and search.
              </div>
            </div>
            """, unsafe_allow_html=True)

        if not langchain_ok and not uploaded_files:
            if st.button("⚡ Build Default Knowledge Base"):
                with st.spinner("Building..."):
                    vs = build_default_vectorstore()
                    if vs:
                        st.session_state.default_vs = vs
                        st.success("✅ Done!")
                        st.rerun()
                    else:
                        st.error("No PDFs found in /data folder.")