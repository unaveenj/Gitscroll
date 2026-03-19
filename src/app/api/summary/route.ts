import { NextRequest, NextResponse } from "next/server";

// ─── Markdown stripper ────────────────────────────────────────────────────────

function stripMarkdown(text: string): string {
  return text
    .replace(/\[!\[.*?\]\(.*?\)\]\(.*?\)/g, "")       // badges
    .replace(/```[\s\S]*?```/g, "")                     // fenced code blocks
    .replace(/`[^`]+`/g, "")                            // inline code
    .replace(/^#{1,6}\s+/gm, "")                        // headings
    .replace(/!\[.*?\]\(.*?\)/g, "")                    // images
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")            // links → text
    .replace(/<[^>]+>/g, "")                            // HTML tags
    .replace(/[*_]{1,3}([^*_\n]+)[*_]{1,3}/g, "$1")    // bold / italic
    .replace(/^\|.*\|$/gm, "")                          // tables
    .replace(/^[-*_]{3,}$/gm, "")                       // horizontal rules
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// ─── Extractive summariser (TF-IDF sentence scoring) ─────────────────────────

const STOP_WORDS = new Set([
  "a","an","the","and","or","but","in","on","at","to","for","of","with","by",
  "is","are","was","were","be","been","have","has","do","does","did","will",
  "would","could","should","may","might","this","that","these","those","it",
  "its","you","your","we","our","they","their","can","not","from","as","if",
  "when","which","who","what","how","all","each","more","also","into","about",
  "than","then","so","just","up","out","use","used","using","one","two","can",
]);

function summarise(text: string, count = 3): string {
  const sentences = (text.match(/[^.!?\n]+[.!?]*/g) ?? [])
    .map((s) => s.trim())
    .filter((s) => s.split(/\s+/).length > 6);  // skip very short lines

  if (sentences.length <= count) return sentences.join(" ");

  // Word frequency table
  const freq: Record<string, number> = {};
  for (const word of text.toLowerCase().match(/\b\w+\b/g) ?? []) {
    if (!STOP_WORDS.has(word) && word.length > 2) {
      freq[word] = (freq[word] ?? 0) + 1;
    }
  }

  // Score sentences by average term frequency
  const scored = sentences.map((sentence, i) => {
    const words = sentence.toLowerCase().match(/\b\w+\b/g) ?? [];
    const score =
      words.reduce((sum, w) => sum + (freq[w] ?? 0), 0) /
      Math.max(words.length, 1);
    return { i, sentence, score };
  });

  // Pick top-N, then restore original order for readability
  const topIndices = [...scored]
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map((s) => s.i)
    .sort((a, b) => a - b);

  return topIndices.map((i) => sentences[i]).join(" ");
}

// ─── Route ────────────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const owner = request.nextUrl.searchParams.get("owner");
  const repo = request.nextUrl.searchParams.get("repo");

  if (!owner || !repo) {
    return NextResponse.json(
      { error: "owner and repo are required" },
      { status: 400 }
    );
  }

  const token = process.env.GITHUB_TOKEN;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.raw+json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  try {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/readme`,
      { headers, next: { revalidate: 86400 } }  // cache 24 h per repo
    );

    if (res.status === 404) {
      return NextResponse.json({ has_readme: false, summary: null });
    }
    if (!res.ok) {
      return NextResponse.json({ error: "github_error" }, { status: 502 });
    }

    const raw = await res.text();
    const clean = stripMarkdown(raw);

    if (clean.split(/\s+/).length < 60) {
      return NextResponse.json({ has_readme: false, summary: null });
    }

    const summary = summarise(clean, 3);
    return NextResponse.json({ has_readme: true, summary });
  } catch {
    return NextResponse.json({ error: "fetch_error" }, { status: 500 });
  }
}
