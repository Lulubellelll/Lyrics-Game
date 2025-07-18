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
    
    // Check if the response is OK (status 200-299)
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error: ${response.status} - ${errorText}`);
      return NextResponse.json(
        { error: 'Failed to fetch lyrics from the service.' },
        { status: response.status }
      );
    }

    // Get the response as text first to check if it's empty
    const responseText = await response.text();
    
    // If the response is empty, return an empty array
    if (!responseText.trim()) {
      console.log('Empty response from lyrics API');
      return NextResponse.json({ lyrics: [] });
    }

    // Try to parse the JSON
    try {
      const result = JSON.parse(responseText);
      
      // If the parsed result is empty or doesn't contain lyrics
      if (!result || (Array.isArray(result) && result.length === 0)) {
        console.log('No lyrics found in the response');
        return NextResponse.json({ lyrics: [] });
      }
      
      return NextResponse.json(result);
    } catch (parseError) {
      console.error('Error parsing JSON response:', parseError);
      return NextResponse.json(
        { error: 'Invalid response format from lyrics service.' },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error('Fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lyrics. Please try again later.' },
      { status: 500 }
    );
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