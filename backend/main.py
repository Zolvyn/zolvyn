"""
╔══════════════════════════════════════════════════════════════╗
║           ZOLVYN AI — FastAPI Backend                       ║
║           Groq (primary) → DeepSeek (auto fallback)        ║
║           llama-3.3-70b-versatile / deepseek-chat           ║
╚══════════════════════════════════════════════════════════════╝

Routes:
  POST /api/chat          → Legal Q&A (streaming SSE)
  POST /api/contract      → Contract Analyzer
  POST /api/generate      → Document Generator
  POST /api/predict       → Case Predictor
  POST /api/bare-acts     → Bare Acts Search
  GET  /health            → Health check
"""

import os
import json
import asyncio
from typing import Optional, AsyncGenerator

from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

# ── Groq client ──
from groq import Groq

# ── DeepSeek client (OpenAI-compatible) ──
from openai import OpenAI

GROQ_MODEL     = "llama-3.3-70b-versatile"
DEEPSEEK_MODEL = "deepseek-chat"

groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
deepseek_client = OpenAI(
    api_key=os.getenv("DEEPSEEK_API_KEY"),
    base_url="https://api.deepseek.com"
)

def _is_rate_limit(e: Exception) -> bool:
    """Check if exception is a rate limit / quota error."""
    s = str(e).lower()
    return "429" in s or "rate limit" in s or "quota" in s or "too many requests" in s

def call_llm(messages, max_tokens=3000, temperature=0.3, json_mode=False):
    """
    Call Groq first. If rate-limited → auto fallback to DeepSeek.
    Returns a completions response object (same structure from both).
    """
    kwargs = dict(messages=messages, max_tokens=max_tokens, temperature=temperature)
    if json_mode:
        kwargs["response_format"] = {"type": "json_object"}

    # ── Try Groq ──
    try:
        kwargs["model"] = GROQ_MODEL
        return groq_client.chat.completions.create(**kwargs)
    except Exception as e:
        if _is_rate_limit(e):
            print("⚡ Groq rate limit hit — switching to DeepSeek automatically")
        else:
            raise

    # ── Fallback to DeepSeek ──
    kwargs["model"] = DEEPSEEK_MODEL
    return deepseek_client.chat.completions.create(**kwargs)


# ── RAG disabled for now ──
RAG_AVAILABLE = False
vectorstore = None

app = FastAPI(title="Zolvyn AI Backend", version="2.0.0")

# ── CORS ──
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ════════════════════════════════════════════════════
# REQUEST MODELS
# ════════════════════════════════════════════════════

class ChatRequest(BaseModel):
    question: str
    context_laws: list[str] = ["BNS", "BNSS", "IPC", "Constitution"]
    state: str = "All India"
    history: list[dict] = []
    max_tokens: int = 4096
    system_prompt: Optional[str] = None

class ContractRequest(BaseModel):
    text: str
    analysis_type: str = "full"

class GenerateRequest(BaseModel):
    template_type: str
    fields: dict
    language: str = "English"

class PredictRequest(BaseModel):
    case_description: str
    case_type: str
    side: str = "plaintiff"

class BareActsRequest(BaseModel):
    query: str
    act: str = "all"


# ════════════════════════════════════════════════════
# SYSTEM PROMPTS
# ════════════════════════════════════════════════════

CHAT_SYSTEM = """You are Zolvyn AI — India's most advanced legal intelligence assistant.
You answer questions about Indian law with precision, citing exact sections and acts.

RESPONSE FORMAT — always follow this strictly:
1. **Bold heading** summarizing the legal topic
2. A short 2-3 sentence direct answer first
3. Use ## and ### headers to organize sections
4. Use bullet points for lists of rights, offences, or key points
5. Use numbered lists for step-by-step procedures
6. Use proper Markdown tables (| col | col | with --- separators) when comparing laws, punishments, timelines, or options — ALWAYS use tables when data fits this format
7. Use **bold** for every section number, act name, and key legal term
8. Use > blockquotes for actual legal text or landmark judgment quotes
9. End with **Practical Next Steps** as a numbered list
10. End with a ⚠️ disclaimer to consult a qualified advocate

STRICT RULES:
- NEVER stop mid-sentence — always complete your full answer
- Always cite exact Act and Section: e.g. **Section 406 IPC**, **Article 21 Constitution**, **Section 17 RERA**
- Mention BNS 2023 instead of IPC where the new law applies
- Be precise, structured, and professional
- Never say "I cannot provide legal advice" — provide clear legal information

Current context laws: {context_laws}
State jurisdiction: {state}"""

CONTRACT_SYSTEM = """You are a senior Indian contract law specialist at Zolvyn AI.
Analyze the provided contract text thoroughly under Indian Contract Act 1872 and relevant laws.

Respond in this EXACT JSON format:
{
  "overall_risk": "HIGH|MEDIUM|LOW",
  "score": <number 0-100>,
  "summary": "<2 sentence summary>",
  "red_flags": [{"clause": "<name>", "issue": "<issue>", "severity": "HIGH|MEDIUM|LOW", "recommendation": "<fix>"}],
  "missing_clauses": ["<clause name>"],
  "key_terms": [{"term": "<term>", "explanation": "<plain English explanation>"}],
  "compliance": [{"law": "<act name>", "status": "COMPLIANT|NON_COMPLIANT|UNCLEAR", "note": "<detail>"}],
  "recommendations": ["<actionable recommendation>"]
}"""

GENERATE_SYSTEM = """You are a senior Indian legal document drafting specialist at Zolvyn AI.
Generate complete, court-ready Indian legal documents.

STRICT RULES:
- Use proper Indian court formatting
- Include all required legal headers, sections, and clauses
- Add proper date and signature blocks
- Reference correct Indian laws and acts
- Make documents print-ready and legally valid
- Use formal legal language appropriate for Indian courts"""

PREDICT_SYSTEM = """You are India's top legal strategist at Zolvyn AI.
Analyze the case and provide a comprehensive prediction.

Respond in this EXACT JSON format:
{
  "win_probability": <number 0-100>,
  "confidence": "HIGH|MEDIUM|LOW",
  "applicable_laws": [{"section": "<BNS/IPC/Act § number>", "relevance": "<why it applies>"}],
  "similar_cases": [{"name": "<case name>", "court": "<court>", "year": <year>, "outcome": "<outcome>", "relevance": "<why relevant>"}],
  "strengths": ["<strength point>"],
  "weaknesses": ["<weakness point>"],
  "strategy": ["<step 1>", "<step 2>", "<step 3>"],
  "recommended_action": "<single most important next step>",
  "timeline": "<estimated case timeline>"
}"""

BARE_ACTS_SYSTEM = """You are a precise Indian law reference system at Zolvyn AI.
When given a search query about an Indian law or section, provide:
1. The exact section text (simplified)
2. Plain English explanation
3. Punishment/consequence if applicable
4. Related sections
5. Recent amendments (BNS 2023 where applicable)

Be precise and cite exact section numbers."""


# ════════════════════════════════════════════════════
# RAG HELPER
# ════════════════════════════════════════════════════

def get_rag_context(query: str, k: int = 4) -> str:
    if not RAG_AVAILABLE or vectorstore is None:
        return ""
    try:
        docs = vectorstore.similarity_search(query, k=k)
        return "\n\nRELEVANT LEGAL DOCUMENTS:\n" + "\n\n".join([doc.page_content for doc in docs])
    except Exception:
        return ""


# ════════════════════════════════════════════════════
# ROUTE 1 — /api/chat  (SSE Streaming)
# ════════════════════════════════════════════════════

@app.post("/api/chat")
async def chat(request: ChatRequest):
    rag_context = get_rag_context(request.question)

    if request.system_prompt:
        system_prompt = request.system_prompt + rag_context
    else:
        system_prompt = CHAT_SYSTEM.format(
            context_laws=", ".join(request.context_laws),
            state=request.state
        ) + rag_context

    messages = [{"role": "system", "content": system_prompt}]
    for msg in request.history[-6:]:
        messages.append(msg)
    messages.append({"role": "user", "content": request.question})

    max_tokens = min(request.max_tokens, 8000)

    async def event_stream() -> AsyncGenerator[str, None]:
        try:
            # ── Try Groq streaming first ──
            try:
                stream = groq_client.chat.completions.create(
                    model=GROQ_MODEL,
                    messages=messages,
                    max_tokens=max_tokens,
                    temperature=0.3,
                    stream=True,
                )
            except Exception as e:
                if _is_rate_limit(e):
                    print("⚡ Groq rate limit — switching to DeepSeek for streaming")
                    stream = deepseek_client.chat.completions.create(
                        model=DEEPSEEK_MODEL,
                        messages=messages,
                        max_tokens=max_tokens,
                        temperature=0.3,
                        stream=True,
                    )
                else:
                    raise

            for chunk in stream:
                delta = chunk.choices[0].delta
                if delta.content:
                    data = json.dumps({"token": delta.content})
                    yield f"data: {data}\n\n"
                    await asyncio.sleep(0)
            yield f"data: {json.dumps({'done': True})}\n\n"

        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


# ════════════════════════════════════════════════════
# ROUTE 2 — /api/contract
# ════════════════════════════════════════════════════

@app.post("/api/contract")
async def analyze_contract(request: ContractRequest):
    if len(request.text.strip()) < 50:
        raise HTTPException(status_code=400, detail="Contract text too short.")

    contract_text = request.text[:8000]
    messages = [
        {"role": "system", "content": CONTRACT_SYSTEM},
        {"role": "user", "content": f"Analyze this contract:\n\n{contract_text}"}
    ]

    try:
        response = call_llm(messages, max_tokens=3000, temperature=0.1, json_mode=True)
        result = json.loads(response.choices[0].message.content)
        return {"status": "success", "data": result}
    except json.JSONDecodeError:
        return {"status": "success", "data": {"raw": response.choices[0].message.content}}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/contract/upload")
async def analyze_contract_file(file: UploadFile = File(...)):
    import io
    content = await file.read()
    text = ""

    if file.filename.endswith(".pdf"):
        try:
            import pdfplumber
            with pdfplumber.open(io.BytesIO(content)) as pdf:
                text = "\n".join([p.extract_text() or "" for p in pdf.pages])
        except Exception:
            try:
                import PyPDF2
                reader = PyPDF2.PdfReader(io.BytesIO(content))
                text = "\n".join([p.extract_text() or "" for p in reader.pages])
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Could not read PDF: {e}")
    elif file.filename.endswith(".docx"):
        try:
            import docx
            doc = docx.Document(io.BytesIO(content))
            text = "\n".join([p.text for p in doc.paragraphs])
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Could not read DOCX: {e}")
    else:
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files supported.")

    if not text.strip():
        raise HTTPException(status_code=400, detail="Could not extract text from file.")

    return await analyze_contract(ContractRequest(text=text))


# ════════════════════════════════════════════════════
# ROUTE 3 — /api/generate
# ════════════════════════════════════════════════════

DOCUMENT_TEMPLATES = {
    "nda": "Non-Disclosure Agreement (NDA)",
    "rental": "Residential Rental Agreement",
    "employment": "Employment Contract",
    "affidavit": "General Affidavit",
    "mou": "Memorandum of Understanding (MOU)",
    "legal_notice": "Legal Notice",
    "poa": "Power of Attorney",
    "fir_draft": "FIR Draft",
    "consumer_complaint": "Consumer Complaint",
    "bail_application": "Bail Application",
    "divorce_petition": "Divorce Petition",
    "partnership_deed": "Partnership Deed",
}

@app.post("/api/generate")
async def generate_document(request: GenerateRequest):
    template_name = DOCUMENT_TEMPLATES.get(request.template_type)
    if not template_name:
        raise HTTPException(status_code=400, detail=f"Unknown template: {request.template_type}")

    fields_text = "\n".join([f"- {k}: {v}" for k, v in request.fields.items()])
    prompt = f"""Generate a complete, court-ready Indian {template_name} with the following details:

{fields_text}

Language: {request.language}

Requirements:
- Use proper Indian legal format with correct headers
- Include all standard clauses for this document type
- Add date fields, signature blocks, witness sections
- Reference applicable Indian laws
- Make it print-ready and legally valid
- Include stamp duty note if applicable
- Format clearly with proper sections and numbering"""

    messages = [
        {"role": "system", "content": GENERATE_SYSTEM},
        {"role": "user", "content": prompt}
    ]

    try:
        response = call_llm(messages, max_tokens=4000, temperature=0.2)
        return {"status": "success", "template": template_name, "document": response.choices[0].message.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ════════════════════════════════════════════════════
# ROUTE 4 — /api/predict
# ════════════════════════════════════════════════════

@app.post("/api/predict")
async def predict_case(request: PredictRequest):
    prompt = f"""Case Type: {request.case_type}
Side: {request.side}
Case Description: {request.case_description}

Analyze this Indian legal case thoroughly and provide prediction."""

    messages = [
        {"role": "system", "content": PREDICT_SYSTEM},
        {"role": "user", "content": prompt}
    ]

    try:
        response = call_llm(messages, max_tokens=3000, temperature=0.2, json_mode=True)
        result = json.loads(response.choices[0].message.content)
        return {"status": "success", "data": result}
    except json.JSONDecodeError:
        return {"status": "success", "data": {"raw": response.choices[0].message.content}}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/predict/upload")
async def predict_from_file(
    file: UploadFile = File(...),
    case_type: str = Form("General"),
    side: str = Form("plaintiff")
):
    import io
    content = await file.read()
    text = ""

    if file.filename.endswith(".pdf"):
        try:
            import pdfplumber
            with pdfplumber.open(io.BytesIO(content)) as pdf:
                text = "\n".join([p.extract_text() or "" for p in pdf.pages])
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

    if not text.strip():
        raise HTTPException(status_code=400, detail="Could not extract text from file.")

    return await predict_case(PredictRequest(
        case_description=text[:4000],
        case_type=case_type,
        side=side
    ))


# ════════════════════════════════════════════════════
# ROUTE 5 — /api/bare-acts  (SSE Streaming)
# ════════════════════════════════════════════════════

@app.post("/api/bare-acts")
async def search_bare_acts(request: BareActsRequest):
    prompt = f"Query: {request.query}"
    if request.act != "all":
        prompt += f"\nFocus on: {request.act}"

    messages = [
        {"role": "system", "content": BARE_ACTS_SYSTEM},
        {"role": "user", "content": prompt}
    ]

    async def event_stream() -> AsyncGenerator[str, None]:
        try:
            # ── Try Groq streaming first ──
            try:
                stream = groq_client.chat.completions.create(
                    model=GROQ_MODEL,
                    messages=messages,
                    max_tokens=2000,
                    temperature=0.1,
                    stream=True,
                )
            except Exception as e:
                if _is_rate_limit(e):
                    print("⚡ Groq rate limit — switching to DeepSeek for streaming")
                    stream = deepseek_client.chat.completions.create(
                        model=DEEPSEEK_MODEL,
                        messages=messages,
                        max_tokens=2000,
                        temperature=0.1,
                        stream=True,
                    )
                else:
                    raise

            for chunk in stream:
                delta = chunk.choices[0].delta
                if delta.content:
                    yield f"data: {json.dumps({'token': delta.content})}\n\n"
                    await asyncio.sleep(0)
            yield f"data: {json.dumps({'done': True})}\n\n"

        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"}
    )


# ════════════════════════════════════════════════════
# HEALTH CHECK
# ════════════════════════════════════════════════════

@app.get("/health")
async def health():
    groq_ok = bool(os.getenv("GROQ_API_KEY"))
    deepseek_ok = bool(os.getenv("DEEPSEEK_API_KEY"))
    return {
        "status": "ok",
        "primary_model": GROQ_MODEL,
        "fallback_model": DEEPSEEK_MODEL,
        "groq_key_set": groq_ok,
        "deepseek_key_set": deepseek_ok,
        "rag_available": RAG_AVAILABLE,
        "routes": ["/api/chat", "/api/contract", "/api/generate", "/api/predict", "/api/bare-acts"]
    }

@app.get("/")
async def root():
    return {"message": "Zolvyn AI Backend v2.0 — running"}