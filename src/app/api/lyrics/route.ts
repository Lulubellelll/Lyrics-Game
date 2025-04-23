import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const PROXY_URL = process.env.PROXY_URL;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const title = searchParams.get("title");
  const artist = searchParams.get("artist");

  if (!title || !artist) {
    return NextResponse.json({ error: "Title and artist are required" }, { status: 400 });
  }

  try {
    const proxyResponse = await fetch(
      `${PROXY_URL}/lyrics?title=${encodeURIComponent(title)}&artist=${encodeURIComponent(artist)}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!proxyResponse.ok) {
      const errorData = await proxyResponse.json().catch(() => ({}));
      console.error("Proxy error", proxyResponse.status, errorData);
      return NextResponse.json({ error: "Proxy request failed" }, { status: 500 });
    }

    const data = await proxyResponse.json();
    return NextResponse.json(data);
  } catch (error: any) {
    // console.error("Server error:", error?.message || error);
    return NextResponse.json({ error: "Lyrics fetch failed" }, { status: 500 });
  }
}
