import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const artist = searchParams.get('artist');
  const song = searchParams.get('song');

  if (!artist || !song) {
    return NextResponse.json({ error: 'Missing artist or song query parameter.' }, { status: 400 });
  }

  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'API key is not configured.' }, { status: 500 });
  }

  const url = `https://musixmatch-lyrics-songs.p.rapidapi.com/songs/lyrics?t=${artist}&a=${song}&type=json`;
  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': apiKey,
      'x-rapidapi-host': 'musixmatch-lyrics-songs.p.rapidapi.com'
    }
  };

  try {
    const response = await fetch(url, options);
    const result = await response.text();
    const resultJson = await JSON.parse(result);

    //console.log(formatLyricsArray(resultJson));
    
    return NextResponse.json(resultJson);

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch lyrics.' }, { status: 500 });
  }


}

interface LyricLine {
  text: string;
  time: {
    total: number;
    minutes: number;
    seconds: number;
    hundredths: number;
  }
}

const formatLyricsArray = ( lines: LyricLine[] ): string[] => {
  const formattedLyrics = lines
                      .map(line => line.text)
                      .filter(item => item !== "");

  return formattedLyrics;
}