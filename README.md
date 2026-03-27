# ⚖️ AI Legal Intelligence System

<div align="center">

![Python](https://img.shields.io/badge/Python-3.10+-blue?style=for-the-badge&logo=python)
![Streamlit](https://img.shields.io/badge/Streamlit-1.32+-red?style=for-the-badge&logo=streamlit)
![Groq](https://img.shields.io/badge/Groq-llama--3.3--70b-orange?style=for-the-badge)
![LangChain](https://img.shields.io/badge/LangChain-RAG-green?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

**A production-ready AI-powered legal assistant for the Indian legal system.**  
Built with Groq LLM, LangChain RAG, FAISS, and Streamlit.

[🌐 Live Demo](https://ai-legal-intelligence-system-ftcsqsyljmhonks5ka4xk2.streamlit.app) · [📦 GitHub](https://github.com/vivek41-glitch/ai-legal-intelligence-system)

</div>

---

## 🚀 Features

### 📖 Phase 1 — Legal Q&A (RAG + Direct Mode)
- Ask any legal question about Indian law
- **RAG Mode**: Searches your uploaded legal PDFs via FAISS vector database
- **Direct Mode**: Groq LLM answers general legal questions without documents
- Powered by HuggingFace sentence-transformers embeddings
- Cites relevant IPC/BNSS sections, acts, and case laws

### 📄 Phase 2 — Contract Analyzer
- Paste any contract for full AI-powered analysis
- **Full Analysis**: Risk assessment, missing clauses, red flags, compliance check
- **Key Terms**: Extracts and explains legal terms in plain English
- **Improvements**: Specific suggestions to strengthen the contract
- Download reports as text files

### 📝 Phase 3 — Legal Document Generator
- Generate 12+ types of professional legal documents
- NDAs, Employment Agreements, Rental Agreements, MOUs, Affidavits, POA, and more
- **Legal Notice Generator**: Formal notices with proper Indian legal format
- All documents ready for use under Indian law

### 🔮 Phase 4 — Case Outcome Predictor
- **Outcome Prediction**: Success probability, applicable laws, precedents
- **Legal Strategy Builder**: Step-by-step strategy for plaintiff or defendant
- **FIR Analyzer**: Analyze FIR under IPC/BNSS, classify offences, suggest defense
- 17 case types supported

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **Python 3.10+** | Core language |
| **Streamlit** | Frontend UI framework |
| **Groq + llama-3.3-70b-versatile** | LLM inference (128K context) |
| **LangChain** | RAG pipeline orchestration |
| **FAISS** | Vector database for document search |
| **HuggingFace Transformers** | Text embeddings (all-MiniLM-L6-v2) |
| **python-dotenv** | Secure environment variable management |
| **pdfplumber / PyPDF2** | PDF text extraction |

---

## ⚙️ Local Setup

### 1. Clone the repository
```bash
git clone https://github.com/vivek41-glitch/ai-legal-intelligence-system.git
cd ai-legal-intelligence-system
```

### 2. Create and activate virtual environment
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Mac/Linux
python -m venv venv
source venv/bin/activate
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Set up environment variables
Create a `.env` file in the root directory:
```
GROQ_API_KEY=your_groq_api_key_here
```
> Get your free Groq API key at: https://console.groq.com

### 5. Add legal documents (for RAG mode)
Place any Indian law PDF files in the `/data` folder:
```
data/
├── ipc.pdf
├── consumer_protection_act.pdf
├── rbi_guidelines.pdf
└── ...
```

### 6. Run the app
```bash
streamlit run app.py
```

---

## 📁 Project Structure

```
ai-legal-intelligence-system/
│
├── app.py                  ← Main Streamlit app (UI + navigation)
├── legal_qa.py             ← Phase 1: Legal Q&A (RAG + Direct mode)
├── contract_analyzer.py    ← Phase 2: Contract analysis
├── doc_generator.py        ← Phase 3: Legal document generation
├── case_predictor.py       ← Phase 4: Case prediction & FIR analysis
│
├── data/                   ← Put your legal PDF documents here
├── vectorstore/            ← Auto-generated FAISS vector DB
│
├── .env                    ← Your API keys (NOT committed to git)
├── .env.example            ← Template for .env file
├── .gitignore              ← Ignores .env, venv, vectorstore, __pycache__
├── requirements.txt        ← All dependencies
└── README.md               ← This file
```

---

## 🌐 Streamlit Cloud Deployment

### Setting the API key on Streamlit Cloud:
1. Go to your app on [share.streamlit.io](https://share.streamlit.io)
2. Click **⋮ Menu → Settings → Secrets**
3. Add:
```toml
GROQ_API_KEY = "your_groq_api_key_here"
```
> The app uses `os.getenv("GROQ_API_KEY")` which automatically reads from Streamlit Secrets in production — no code changes needed.

---

## 🔄 Updating After Code Changes (GitHub → Streamlit)

```bash
# 1. Make your changes locally
# 2. Stage all changes
git add .

# 3. Commit with a message
git commit -m "feat: updated legal Q&A and fixed model to llama-3.3-70b-versatile"

# 4. Push to GitHub
git push origin main

# Streamlit Cloud auto-redeploys within 1-2 minutes ✅
```

---

## 📊 What Changed in v2 (Compared to v1)

| Area | v1 (Original) | v2 (Current) |
|---|---|---|
| **Model** | `llama3-70b-8192` (❌ decommissioned) | `llama-3.3-70b-versatile` (✅ active, 128K ctx) |
| **API Key** | Hidden/cached source | Clean `.env` + `python-dotenv` |
| **Legal Q&A** | RAG only | RAG + Direct mode with graceful fallback |
| **Contract Analyzer** | Basic analysis | Full analysis + Key Terms + Improvements tabs |
| **Case Predictor** | Basic prediction | Prediction + Strategy + FIR Analyzer |
| **Document Types** | 5 types | 12+ types including Legal Notice generator |
| **Error Handling** | Minimal | Full try/catch with user-friendly errors |
| **UI** | Original dark gold theme | Same dark gold theme + enhanced components |

---

## ⚠️ Disclaimer

This system provides **AI-generated legal information for educational purposes only**.  
It is **not a substitute for professional legal advice**.  
Always consult a qualified and licensed attorney for specific legal matters.

---

## 👨‍💻 Built By

**Vivek Dubey** — AI/ML Developer  
Building toward a startup-level legal AI product for India 🇮🇳

---

## 📄 License

MIT License — feel free to use, modify, and distribute.