import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const artist = searchParams.get('artist');
  const song = searchParams.get('song');

  if (!artist || !song) {
    return NextResponse.json({ error: 'Missing artist or song query parameter.' }, { status: 400 });
  }

  const url = `https://musixmatch-lyrics-songs.p.rapidapi.com/songs/lyrics?t=${artist}&a=${song}&type=json`;
  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': '4d4565b890msh06bebcbda9aa4bbp1cddb1jsnf76ed25c5665',
      'x-rapidapi-host': 'musixmatch-lyrics-songs.p.rapidapi.com'
    }
  };

  try {
    const response = await fetch(url, options);
    const result = await response.text();
    
    return NextResponse.json({ result });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch lyrics.' }, { status: 500 });
  }



}