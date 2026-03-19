"""
README summariser microservice.

Fetches a GitHub repo's README, strips markdown, and returns a 3-sentence
extractive summary using sumy's LSA algorithm.

Run:
    source venv/bin/activate
    uvicorn summariser:app --reload --port 8000
"""

import os
import re

import httpx
import nltk
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sumy.nlp.stemmers import Stemmer
from sumy.nlp.tokenizers import Tokenizer
from sumy.parsers.plaintext import PlaintextParser
from sumy.summarizers.lsa import LsaSummarizer
from sumy.utils import get_stop_words

nltk.download("punkt", quiet=True)
nltk.download("punkt_tab", quiet=True)

app = FastAPI(title="GitScroll README Summariser")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["GET"],
    allow_headers=["*"],
)

# ─── Markdown stripper ────────────────────────────────────────────────────────

_BADGE_RE = re.compile(r"\[!\[.*?\]\(.*?\)\]\(.*?\)")
_CODE_BLOCK_RE = re.compile(r"```[\s\S]*?```")
_INLINE_CODE_RE = re.compile(r"`[^`]+`")
_HEADING_RE = re.compile(r"^#{1,6}\s+", re.MULTILINE)
_IMAGE_RE = re.compile(r"!\[.*?\]\(.*?\)")
_LINK_RE = re.compile(r"\[([^\]]+)\]\([^\)]+\)")
_HTML_RE = re.compile(r"<[^>]+>")
_EMPHASIS_RE = re.compile(r"[*_]{1,3}([^*_\n]+)[*_]{1,3}")
_HR_RE = re.compile(r"^[-*_]{3,}$", re.MULTILINE)
_TABLE_RE = re.compile(r"^\|.*\|$", re.MULTILINE)
_EXTRA_NEWLINES_RE = re.compile(r"\n{3,}")


def strip_markdown(text: str) -> str:
    text = _BADGE_RE.sub("", text)
    text = _CODE_BLOCK_RE.sub("", text)
    text = _INLINE_CODE_RE.sub("", text)
    text = _HEADING_RE.sub("", text)
    text = _IMAGE_RE.sub("", text)
    text = _LINK_RE.sub(r"\1", text)
    text = _HTML_RE.sub("", text)
    text = _EMPHASIS_RE.sub(r"\1", text)
    text = _HR_RE.sub("", text)
    text = _TABLE_RE.sub("", text)
    text = _EXTRA_NEWLINES_RE.sub("\n\n", text)
    return text.strip()


# ─── Summariser ───────────────────────────────────────────────────────────────

def summarise(text: str, sentence_count: int = 3) -> str:
    parser = PlaintextParser.from_string(text, Tokenizer("english"))
    stemmer = Stemmer("english")
    summarizer = LsaSummarizer(stemmer)
    summarizer.stop_words = get_stop_words("english")
    sentences = summarizer(parser.document, sentence_count)
    return " ".join(str(s) for s in sentences)


# ─── Route ────────────────────────────────────────────────────────────────────

@app.get("/summary")
async def get_summary(
    owner: str = Query(..., description="GitHub repo owner"),
    repo: str = Query(..., description="GitHub repo name"),
):
    token = os.environ.get("GITHUB_TOKEN", "")
    headers: dict[str, str] = {"Accept": "application/vnd.github.raw+json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"

    async with httpx.AsyncClient() as client:
        res = await client.get(
            f"https://api.github.com/repos/{owner}/{repo}/readme",
            headers=headers,
            timeout=10,
        )

    if res.status_code == 404:
        return {"has_readme": False, "summary": None}

    if res.status_code != 200:
        raise HTTPException(status_code=502, detail=f"GitHub API error: {res.status_code}")

    clean = strip_markdown(res.text)

    # Require at least 60 words to bother summarising
    if len(clean.split()) < 60:
        return {"has_readme": False, "summary": None}

    try:
        summary = summarise(clean)
    except Exception:
        # Fallback: grab the first 3 sentences directly
        sentences = re.split(r"(?<=[.!?])\s+", clean)
        summary = " ".join(sentences[:3])

    return {"has_readme": True, "summary": summary}


@app.get("/health")
async def health():
    return {"status": "ok"}
