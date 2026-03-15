import { NextRequest, NextResponse } from "next/server";
import { fetchRepos } from "@/services/githubService";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const page = Number(searchParams.get("page") ?? "1");

  if (isNaN(page) || page < 1) {
    return NextResponse.json({ error: "Invalid page parameter" }, { status: 400 });
  }

  try {
    const data = await fetchRepos(page);
    return NextResponse.json(data);
  } catch (error) {
    console.error("[/api/repos] Error fetching repos:", error);
    return NextResponse.json({ error: "Failed to fetch repositories" }, { status: 500 });
  }
}
