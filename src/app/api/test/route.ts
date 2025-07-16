import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio"; 

const GENIUS_API_KEY = process.env.GENIUS_API_KEY;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const artist = searchParams.get("artist");
  const song = searchParams.get("song");

  if (!artist || !song) {
    return NextResponse.json({ error: "Missing 'artist' or 'song' query parameter." }, { status: 400 });
  }

  try {
    const searchQuery = `${artist} ${song}`;

    const searchResponse = await axios.get("https://api.genius.com/search", {
      params: { q: searchQuery },
      headers: {
        Authorization: `Bearer ${GENIUS_API_KEY}`,
      },
    });

    const hits = searchResponse.data.response.hits;

    if (hits.length === 0) {
      return NextResponse.json({ error: "No song found." }, { status: 404 });
    }

    const songUrl = hits[0].result.url;

    const pageResponse = await axios.get(songUrl);
    const $ = cheerio.load(pageResponse.data);

    $('[data-lyrics-container="true"] [data-exclude-from-selection="true"]').remove();
    
    let lyricsLines: string[] = [];
    
    $('[data-lyrics-container="true"]').each((_, container) => {
      $(container).contents().each((_, node) => {
        if (node.type === 'text') {
          const text = $(node).text().trim();
          if (text) lyricsLines.push(text);
        } else if (node.type === 'tag' && node.name === 'br') {
          lyricsLines.push('\n');
        } else {
          const text = $(node).text().trim();
          if (text) lyricsLines.push(text);
        }
      });
    });
    
    // Merge lines, preserving intentional line breaks:
    const cleanedLyrics = lyricsLines.join('').replace(/\n{2,}/g, '\n').trim();

    console.log(cleanedLyrics);

    return NextResponse.json({
      artist,
      song,
      lyrics: cleanedLyrics || "Lyrics not found.",
      geniusUrl: songUrl,
    });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: error.message || "An error occurred." },
      { status: 500 }
    );
  }
}
