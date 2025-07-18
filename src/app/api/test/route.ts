import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const artist = searchParams.get("artist");
  const song = searchParams.get("song");

  if (!artist || !song) {
    return NextResponse.json(
      { error: "Missing 'artist' or 'song' query parameter." },
      { status: 400 }
    );
  }

  try {
    const res = await axios.get(`https://api.lyrics.ovh/v1/${artist}/${song}`);
    return NextResponse.json({
      artist,
      song,
      lyrics: res.data.lyrics,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Lyrics not found or API unreachable." },
      { status: 404 }
    );
  }
}
