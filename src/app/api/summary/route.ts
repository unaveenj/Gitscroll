import { NextRequest, NextResponse } from "next/server";

const SUMMARISER_URL =
  process.env.SUMMARISER_URL ?? "http://localhost:8000";

export async function GET(request: NextRequest) {
  const owner = request.nextUrl.searchParams.get("owner");
  const repo = request.nextUrl.searchParams.get("repo");

  if (!owner || !repo) {
    return NextResponse.json(
      { error: "owner and repo are required" },
      { status: 400 }
    );
  }

  try {
    const url = `${SUMMARISER_URL}/summary?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}`;
    const res = await fetch(url, { next: { revalidate: 86400 } }); // cache 24h

    if (!res.ok) {
      return NextResponse.json(
        { error: "Summariser error" },
        { status: 502 }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    // Service unreachable — return a distinct error so the UI can show a retry
    return NextResponse.json(
      { error: "summariser_unavailable" },
      { status: 503 }
    );
  }
}
