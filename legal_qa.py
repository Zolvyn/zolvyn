import os
import streamlit as st
from groq import Groq

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
VECTOR_DIR = os.path.join(BASE_DIR, "vectorstore")

SAMPLE_QUESTIONS = [
    "What is Section 420 IPC?",
    "What are tenant rights in India?",
    "How to file an FIR in India?",
    "What is the limitation period for civil suits?",
    "Explain the Right to Information Act",
    "What is anticipatory bail?",
    "Consumer rights under Consumer Protection Act 2019",
    "What is Section 498A IPC?",
]


def get_client():
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        st.error("⚠️ GROQ_API_KEY not found. Add it to your .env file or Streamlit secrets.")
        st.stop()
    return Groq(api_key=api_key)


def check_langchain():
    """Check if langchain packages are installed, show helpful error if not."""
    try:
        from langchain_community.document_loaders import PyPDFLoader
        from langchain_text_splitters import RecursiveCharacterTextSplitter
        from langchain_community.vectorstores import FAISS
        from langchain_huggingface import HuggingFaceEmbeddings
        return True
    except ImportError as e:
        missing = str(e).replace("No module named ", "").strip("'")
        st.error(f"❌ Missing package: **{missing}**")
        st.markdown("""
        <div style="background:#0d1b2a; border:1px solid #cc3333; border-radius:10px; padding:16px 20px;">
            <div style="color:#ff6b6b; font-weight:600; margin-bottom:8px;">📦 Install Required Packages</div>
            <div style="color:#b0bcc8; font-size:0.85rem;">Run this in your terminal:</div>
            <div style="background:#070c17; border-radius:6px; padding:10px 14px; margin-top:8px;
                        font-family:monospace; font-size:0.82rem; color:#5fcc88;">
                pip install langchain-community langchain-text-splitters langchain-huggingface faiss-cpu sentence-transformers pypdf
            </div>
        </div>
        """, unsafe_allow_html=True)
        return False


def load_documents():
    from langchain_community.document_loaders import PyPDFLoader
    docs = []
    if not os.path.exists(DATA_DIR):
        return docs
    for file in os.listdir(DATA_DIR):
        if file.endswith(".pdf"):
            loader = PyPDFLoader(os.path.join(DATA_DIR, file))
            docs.extend(loader.load())
    return docs


def build_vectorstore():
    from langchain_text_splitters import RecursiveCharacterTextSplitter
    from langchain_community.vectorstores import FAISS
    from langchain_huggingface import HuggingFaceEmbeddings
    with st.spinner("📚 Building Zolvyn knowledge base..."):
        docs = load_documents()
        if not docs:
            st.error("⚠️ No PDF documents found in the /data folder. Add Indian law PDFs first.")
            return None
        splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
        chunks = splitter.split_documents(docs)
        embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
        vectorstore = FAISS.from_documents(chunks, embeddings)
        vectorstore.save_local(VECTOR_DIR)
        return vectorstore


def load_vectorstore():
    from langchain_community.vectorstores import FAISS
    from langchain_huggingface import HuggingFaceEmbeddings
    embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    return FAISS.load_local(VECTOR_DIR, embeddings, allow_dangerous_deserialization=True)


def get_ai_answer(question, vectorstore):
    client = get_client()
    docs = vectorstore.similarity_search(question, k=4)
    context = "\n\n".join([doc.page_content for doc in docs])
    sources = list(set([
        os.path.basename(doc.metadata.get("source", ""))
        for doc in docs if doc.metadata.get("source")
    ]))
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are Zolvyn AI, an expert Indian legal assistant. "
                    "Answer clearly using the provided context. Structure: direct answer first, "
                    "then relevant laws/sections, then caveats. End with a one-line disclaimer."
                )
            },
            {
                "role": "user",
                "content": f"Context:\n{context}\n\nQuestion: {question}"
            }
        ],
        max_tokens=1500,
        temperature=0.3
    )
    return response.choices[0].message.content, sources


def legal_qa_ui():
    if "chat_history" not in st.session_state:
        st.session_state.chat_history = []
    if "vectorstore" not in st.session_state:
        st.session_state.vectorstore = None
    if "quick_q" not in st.session_state:
        st.session_state.quick_q = ""

    # ── Check packages ──
    if not check_langchain():
        return

    # ── Load vectorstore ──
    if st.session_state.vectorstore is None:
        if os.path.exists(os.path.join(VECTOR_DIR, "index.faiss")):
            with st.spinner("Loading Zolvyn knowledge base..."):
                try:
                    st.session_state.vectorstore = load_vectorstore()
                    st.success("✅ Knowledge base ready!")
                except Exception as e:
                    st.error(f"Error loading knowledge base: {e}")
        else:
            st.markdown("""
            <div style="background:#0d1b2a; border:1px solid #1e3a5f; border-left:3px solid #c9a84c;
                        border-radius:10px; padding:16px 20px; margin-bottom:1rem;">
                <span style="color:#c9a84c; font-weight:600;">📚 Knowledge Base Required</span><br>
                <span style="color:#5a7494; font-size:0.85rem;">
                Add Indian law PDF documents to your <code>/data</code> folder, then click Build below.
                </span>
            </div>
            """, unsafe_allow_html=True)
            if st.button("⚡ Build Knowledge Base"):
                vs = build_vectorstore()
                if vs:
                    st.session_state.vectorstore = vs
                    st.success("✅ Knowledge base built!")
                    st.rerun()

    # ── Quick question chips ──
    st.markdown("**💡 Quick Questions — click to ask instantly:**")
    cols = st.columns(4)
    for i, q in enumerate(SAMPLE_QUESTIONS):
        with cols[i % 4]:
            if st.button(q, key=f"chip_{i}"):
                st.session_state.quick_q = q

    st.markdown('<div style="height:1px; background:linear-gradient(90deg,#1e3a5f,transparent); margin:14px 0 18px;"></div>', unsafe_allow_html=True)

    # ── Chat history ──
    if st.session_state.chat_history:
        st.markdown("**📜 Conversation**")
        for entry in st.session_state.chat_history:
            st.markdown(f"""
            <div class="chat-label-user">You</div>
            <div class="chat-msg-user">{entry['question']}</div>
            <div class="chat-label-ai">⚖️ Zolvyn AI</div>
            <div class="chat-msg-ai">{entry['answer'].replace(chr(10), '<br>')}</div>
            """, unsafe_allow_html=True)
            if entry.get("sources"):
                src_str = " · ".join([f"📄 {s}" for s in entry["sources"] if s])
                if src_str:
                    st.markdown(f'<div style="font-size:0.7rem; color:#2a4560; margin:-4px 0 12px 4px;">Sources: {src_str}</div>', unsafe_allow_html=True)

        if st.button("🗑️ Clear Conversation"):
            st.session_state.chat_history = []
            st.rerun()
        st.markdown('<div style="height:1px; background:linear-gradient(90deg,#1e3a5f,transparent); margin:12px 0 18px;"></div>', unsafe_allow_html=True)

    # ── Input ──
    if st.session_state.vectorstore is not None:
        question = st.text_input(
            "💬 Ask your legal question",
            value=st.session_state.quick_q,
            placeholder="e.g. What are my rights as a tenant if my landlord refuses to return the deposit?",
            key="legal_question_input"
        )

        col1, col2 = st.columns([3, 1])
        with col1:
            ask_btn = st.button("⚖️ Get Legal Answer")
        with col2:
            if st.button("🔄 Clear Input"):
                st.session_state.quick_q = ""
                st.rerun()

        if ask_btn and question.strip():
            st.session_state.quick_q = ""
            with st.status("🔍 Searching Indian law knowledge base...", expanded=True) as status:
                st.write("Retrieving relevant legal documents...")
                st.write("Analyzing with Zolvyn AI...")
                try:
                    answer, sources = get_ai_answer(question, st.session_state.vectorstore)
                    status.update(label="✅ Done!", state="complete")
                    st.session_state.chat_history.append({"question": question, "answer": answer, "sources": sources})
                    st.rerun()
                except Exception as e:
                    status.update(label="❌ Error", state="error")
                    st.error(f"Error: {e}")
        elif ask_btn:
            st.warning("Please enter a legal question first.")
    else:
        st.info("💡 Build or load the knowledge base above to start asking questions.")