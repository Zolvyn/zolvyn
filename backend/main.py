"""
╔══════════════════════════════════════════════════════════════╗
║           ZOLVYN AI — FastAPI Backend                       ║
║           Converted from Streamlit → FastAPI                ║
║           Groq llama-3.3-70b-versatile + LangChain RAG      ║
╚══════════════════════════════════════════════════════════════╝

Routes:
  POST /api/chat          → Legal Q&A (streaming SSE)
  POST /api/contract      → Contract Analyzer
  POST /api/generate      → Document Generator
  POST /api/predict       → Case Predictor
  GET  /api/bare-acts     → Bare Acts Search
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
client = Groq(api_key=os.getenv("GROQ_API_KEY"))
MODEL = "llama-3.3-70b-versatile"

# ── RAG disabled for now (add later) ──
RAG_AVAILABLE = False
vectorstore = None

app = FastAPI(title="Zolvyn AI Backend", version="2.0.0")

# ── CORS — allow Next.js frontend ──
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://zolvynai.com",
        "https://www.zolvynai.com",
        "https://*.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ════════════════════════════════════════════════════
# REQUEST / RESPONSE MODELS
# ════════════════════════════════════════════════════

class ChatRequest(BaseModel):
    question: str
    context_laws: list[str] = ["BNS", "BNSS", "IPC", "Constitution"]
    state: str = "All India"
    history: list[dict] = []

class ContractRequest(BaseModel):
    text: str
    analysis_type: str = "full"  # full | key_terms | risks

class GenerateRequest(BaseModel):
    template_type: str
    fields: dict
    language: str = "English"

class PredictRequest(BaseModel):
    case_description: str
    case_type: str
    side: str = "plaintiff"  # plaintiff | defendant

class BareActsRequest(BaseModel):
    query: str
    act: str = "all"


# ════════════════════════════════════════════════════
# SYSTEM PROMPTS
# ════════════════════════════════════════════════════

CHAT_SYSTEM = """You are Zolvyn AI — India's most advanced legal intelligence assistant.
You answer questions about Indian law with precision, citing exact sections and acts.

RESPONSE FORMAT (always follow this):
1. Start with a clear heading summarizing the legal topic
2. Explain the relevant law with exact section references e.g. [BNS § 303] [IPC § 378]
3. Provide a structured table where data fits (punishment levels, timelines, comparisons)
4. End with 3 practical follow-up suggestions the user can take

RULES:
- Always cite the exact Act and Section number
- Mention BNS 2023 instead of IPC where applicable (new law)
- Be precise, structured, and professional
- Never say "I cannot provide legal advice" — provide clear legal information
- Format tables using markdown when comparing data

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
    """Fetch relevant context from FAISS vectorstore if available."""
    if not RAG_AVAILABLE or vectorstore is None:
        return ""
    try:
        docs = vectorstore.similarity_search(query, k=k)
        context = "\n\n".join([doc.page_content for doc in docs])
        return f"\n\nRELEVANT LEGAL DOCUMENTS:\n{context}\n"
    except Exception:
        return ""


# ════════════════════════════════════════════════════
# ROUTE 1 — /api/chat  (SSE Streaming)
# ════════════════════════════════════════════════════

@app.post("/api/chat")
async def chat(request: ChatRequest):
    """
    Streams legal Q&A responses word-by-word via Server-Sent Events.
    Frontend receives: data: {"token": "word "} per chunk
    """
    rag_context = get_rag_context(request.question)

    system_prompt = CHAT_SYSTEM.format(
        context_laws=", ".join(request.context_laws),
        state=request.state
    ) + rag_context

    messages = [{"role": "system", "content": system_prompt}]

    # Add conversation history (last 6 turns)
    for msg in request.history[-6:]:
        messages.append(msg)

    messages.append({"role": "user", "content": request.question})

    async def event_stream() -> AsyncGenerator[str, None]:
        try:
            stream = client.chat.completions.create(
                model=MODEL,
                messages=messages,
                max_tokens=2048,
                temperature=0.3,
                stream=True,
            )
            for chunk in stream:
                delta = chunk.choices[0].delta
                if delta.content:
                    token = delta.content
                    data = json.dumps({"token": token})
                    yield f"data: {data}\n\n"
                    await asyncio.sleep(0)  # yield control

            # Signal end of stream
            yield f"data: {json.dumps({'done': True})}\n\n"

        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        }
    )


# ════════════════════════════════════════════════════
# ROUTE 2 — /api/contract
# ════════════════════════════════════════════════════

@app.post("/api/contract")
async def analyze_contract(request: ContractRequest):
    """
    Analyzes contract text and returns structured JSON with risk assessment.
    """
    if len(request.text.strip()) < 50:
        raise HTTPException(status_code=400, detail="Contract text too short.")

    # Truncate to 8000 chars to stay within context
    contract_text = request.text[:8000]

    messages = [
        {"role": "system", "content": CONTRACT_SYSTEM},
        {"role": "user", "content": f"Analyze this contract:\n\n{contract_text}"}
    ]

    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=messages,
            max_tokens=3000,
            temperature=0.1,
            response_format={"type": "json_object"},
        )
        result = json.loads(response.choices[0].message.content)
        return {"status": "success", "data": result}
    except json.JSONDecodeError:
        # Return raw text if JSON parsing fails
        raw = response.choices[0].message.content
        return {"status": "success", "data": {"raw": raw}}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/contract/upload")
async def analyze_contract_file(file: UploadFile = File(...)):
    """Upload PDF/DOCX contract file for analysis."""
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

    req = ContractRequest(text=text)
    return await analyze_contract(req)


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
    """
    Generates a complete Indian legal document based on template type and fields.
    """
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
        response = client.chat.completions.create(
            model=MODEL,
            messages=messages,
            max_tokens=4000,
            temperature=0.2,
        )
        document_text = response.choices[0].message.content
        return {
            "status": "success",
            "template": template_name,
            "document": document_text
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ════════════════════════════════════════════════════
# ROUTE 4 — /api/predict
# ════════════════════════════════════════════════════

@app.post("/api/predict")
async def predict_case(request: PredictRequest):
    """
    Predicts case outcome with win probability, strategy, and similar cases.
    """
    prompt = f"""Case Type: {request.case_type}
Side: {request.side}
Case Description: {request.case_description}

Analyze this Indian legal case thoroughly and provide prediction."""

    messages = [
        {"role": "system", "content": PREDICT_SYSTEM},
        {"role": "user", "content": prompt}
    ]

    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=messages,
            max_tokens=3000,
            temperature=0.2,
            response_format={"type": "json_object"},
        )
        result = json.loads(response.choices[0].message.content)
        return {"status": "success", "data": result}
    except json.JSONDecodeError:
        raw = response.choices[0].message.content
        return {"status": "success", "data": {"raw": raw}}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/predict/upload")
async def predict_from_file(
    file: UploadFile = File(...),
    case_type: str = Form("General"),
    side: str = Form("plaintiff")
):
    """Upload FIR or court order PDF for case prediction."""
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

    req = PredictRequest(
        case_description=text[:4000],
        case_type=case_type,
        side=side
    )
    return await predict_case(req)


# ════════════════════════════════════════════════════
# ROUTE 5 — /api/bare-acts
# ════════════════════════════════════════════════════

@app.post("/api/bare-acts")
async def search_bare_acts(request: BareActsRequest):
    """
    Search and explain any Indian law section in plain language.
    Supports streaming via SSE.
    """
    prompt = f"Query: {request.query}"
    if request.act != "all":
        prompt += f"\nFocus on: {request.act}"

    messages = [
        {"role": "system", "content": BARE_ACTS_SYSTEM},
        {"role": "user", "content": prompt}
    ]

    async def event_stream() -> AsyncGenerator[str, None]:
        try:
            stream = client.chat.completions.create(
                model=MODEL,
                messages=messages,
                max_tokens=1500,
                temperature=0.1,
                stream=True,
            )
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
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"}
    )


# ════════════════════════════════════════════════════
# HEALTH CHECK
# ════════════════════════════════════════════════════

@app.get("/health")
async def health():
    return {
        "status": "ok",
        "model": MODEL,
        "rag_available": RAG_AVAILABLE,
        "routes": ["/api/chat", "/api/contract", "/api/generate", "/api/predict", "/api/bare-acts"]
    }

@app.get("/")
async def root():
    return {"message": "Zolvyn AI Backend v2.0 — running"}
