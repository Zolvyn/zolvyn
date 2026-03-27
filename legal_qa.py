import os
from dotenv import load_dotenv
from groq import Groq
import streamlit as st

load_dotenv()

_api_key = os.getenv("GROQ_API_KEY")
if not _api_key:
    raise EnvironmentError("GROQ_API_KEY not set. Check your .env file.")

client = Groq(api_key=_api_key)

# ── Try to import RAG dependencies (optional — graceful fallback if not installed) ──
try:
    from langchain_community.document_loaders import PyPDFLoader
    from langchain_text_splitters import RecursiveCharacterTextSplitter
    from langchain_community.vectorstores import FAISS
    from langchain_huggingface import HuggingFaceEmbeddings
    RAG_AVAILABLE = True
except ImportError:
    RAG_AVAILABLE = False

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR  = os.path.join(BASE_DIR, "data")
VECTOR_DIR = os.path.join(BASE_DIR, "vectorstore")

MODEL = "llama-3.3-70b-versatile"

SYSTEM_PROMPT = """You are an expert AI Legal Assistant specializing in Indian law.
You have deep knowledge of constitutional law, criminal law (IPC/BNSS), civil law, 
corporate law, consumer protection, family law, and property law.
Provide accurate, detailed, and practical legal information.
Always cite relevant sections, acts, or landmark case laws when applicable.
Clarify that your response is for informational purposes and recommend consulting 
a licensed attorney for specific legal advice."""


# ─────────────────────────────────────────────────────────────────────────────
# RAG FUNCTIONS (only if langchain/faiss installed)
# ─────────────────────────────────────────────────────────────────────────────
def load_documents():
    docs = []
    if not os.path.exists(DATA_DIR):
        return docs
    for file in os.listdir(DATA_DIR):
        if file.endswith(".pdf"):
            loader = PyPDFLoader(os.path.join(DATA_DIR, file))
            docs.extend(loader.load())
    return docs


def build_vectorstore():
    with st.spinner("📚 Building knowledge base from legal documents..."):
        docs = load_documents()
        if not docs:
            st.warning("⚠️ No PDF files found in /data folder.")
            return None
        splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
        chunks = splitter.split_documents(docs)
        embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2"
        )
        os.makedirs(VECTOR_DIR, exist_ok=True)
        vectorstore = FAISS.from_documents(chunks, embeddings)
        vectorstore.save_local(VECTOR_DIR)
        return vectorstore


def load_vectorstore():
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )
    return FAISS.load_local(
        VECTOR_DIR, embeddings, allow_dangerous_deserialization=True
    )


def answer_with_rag(question: str, vectorstore) -> str:
    """Uses RAG pipeline: retrieve context → Groq LLM."""
    docs = vectorstore.similarity_search(question, k=3)
    context = "\n\n".join([doc.page_content for doc in docs])
    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": "You are an expert Indian legal assistant. Answer clearly and accurately using the provided legal document context."},
            {"role": "user",   "content": f"Context from legal documents:\n{context}\n\nQuestion: {question}"}
        ],
        temperature=0.2,
        max_tokens=2048,
    )
    return response.choices[0].message.content


def answer_direct(question: str, context: str = "") -> str:
    """Direct Groq LLM answer without RAG (fallback mode)."""
    user_content = question.strip()
    if context and context.strip():
        user_content = f"Context: {context.strip()}\n\nQuestion: {user_content}"
    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user",   "content": user_content},
        ],
        temperature=0.3,
        max_tokens=2048,
    )
    return response.choices[0].message.content


def get_legal_summary(topic: str) -> str:
    """Returns a concise legal summary for a topic."""
    prompt = f"""Provide a concise and structured legal summary for the following topic:
Topic: {topic.strip()}

Include:
1. Overview
2. Key provisions or principles
3. Relevant Indian acts/sections
4. Important case laws (if any)
5. Practical implications"""
    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user",   "content": prompt},
        ],
        temperature=0.3,
        max_tokens=1500,
    )
    return response.choices[0].message.content


# ─────────────────────────────────────────────────────────────────────────────
# STREAMLIT UI
# ─────────────────────────────────────────────────────────────────────────────
def legal_qa_ui():
    tab1, tab2 = st.tabs(["💬 Ask a Question", "📚 Legal Topic Summary"])

    # ── TAB 1: Q&A ──
    with tab1:
        if RAG_AVAILABLE:
            st.markdown("""
            <div style="background:#0d1b2a; border:1px solid #1e3a5f; border-left:3px solid #c9a84c;
                border-radius:8px; padding:12px 16px; margin-bottom:1rem; color:#8a9bb5; font-size:0.82rem;">
                📚 <b style="color:#c9a84c;">RAG Mode Available</b> — Build a knowledge base from your /data PDFs
                for document-grounded answers, or use Direct Mode for general legal questions.
            </div>
            """, unsafe_allow_html=True)

            mode = st.radio(
                "Answer Mode",
                ["🤖 Direct (General Legal AI)", "📚 RAG (From Your Documents)"],
                horizontal=True
            )
        else:
            mode = "🤖 Direct (General Legal AI)"
            st.markdown("""
            <div style="background:#0d1b2a; border:1px solid #c9a84c; border-radius:8px;
                padding:12px 16px; margin-bottom:1rem; color:#8a9bb5; font-size:0.82rem;">
                🤖 <b style="color:#c9a84c;">Direct Mode</b> — Answering from Groq LLM directly.
                Install langchain packages to enable RAG mode.
            </div>
            """, unsafe_allow_html=True)

        question = st.text_area(
            "Your Legal Question",
            placeholder="e.g. What are my rights as a tenant if landlord refuses to return security deposit in Maharashtra?",
            height=120,
        )
        context_input = st.text_area(
            "Additional Context (Optional)",
            placeholder="e.g. The rental was for 11 months, agreement signed in 2023...",
            height=70,
        )

        # RAG controls
        if RAG_AVAILABLE and "RAG" in mode:
            col1, col2 = st.columns([3, 1])
            with col1:
                vs_exists = os.path.exists(os.path.join(VECTOR_DIR, "index.faiss"))
                if vs_exists:
                    st.markdown('<span class="badge-success">✅ Knowledge base ready</span>', unsafe_allow_html=True)
                else:
                    st.markdown('<span class="badge-error">❌ No knowledge base yet</span>', unsafe_allow_html=True)
            with col2:
                if st.button("🔨 Build KB"):
                    vs = build_vectorstore()
                    if vs:
                        st.session_state.vectorstore = vs
                        st.success("✅ Knowledge base built!")

        if st.button("🔍 Get Legal Answer", key="qa_answer_btn"):
            if not question.strip():
                st.warning("Please enter a legal question.")
            else:
                with st.spinner("Consulting legal AI..."):
                    try:
                        if RAG_AVAILABLE and "RAG" in mode:
                            if "vectorstore" not in st.session_state:
                                if os.path.exists(os.path.join(VECTOR_DIR, "index.faiss")):
                                    st.session_state.vectorstore = load_vectorstore()
                                else:
                                    st.error("Build the knowledge base first using the button above.")
                                    st.stop()
                            answer = answer_with_rag(question, st.session_state.vectorstore)
                        else:
                            answer = answer_direct(question, context_input)

                        st.markdown("### 📋 Legal Answer")
                        st.markdown(f'<div class="result-box">{answer}</div>', unsafe_allow_html=True)
                        st.download_button(
                            "⬇️ Download Answer", data=answer,
                            file_name="legal_answer.txt", mime="text/plain"
                        )
                    except Exception as e:
                        st.error(f"Error: {str(e)}")

    # ── TAB 2: Topic Summary ──
    with tab2:
        st.markdown("Get a quick structured summary of any legal topic, act, or section.")
        topic = st.text_input(
            "Legal Topic",
            placeholder="e.g. Right to Information Act, Section 498A IPC, Consumer Protection Act 2019..."
        )
        if st.button("📖 Get Summary", key="summary_btn"):
            if not topic.strip():
                st.warning("Please enter a legal topic.")
            else:
                with st.spinner("Generating legal summary..."):
                    try:
                        summary = get_legal_summary(topic)
                        st.markdown("### 📋 Legal Summary")
                        st.markdown(f'<div class="result-box">{summary}</div>', unsafe_allow_html=True)
                        st.download_button(
                            "⬇️ Download Summary", data=summary,
                            file_name="legal_summary.txt", mime="text/plain"
                        )
                    except Exception as e:
                        st.error(f"Error: {str(e)}")