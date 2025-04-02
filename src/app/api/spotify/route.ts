import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';


export async function GET(request: NextRequest) {
  try {
    // Your Spotify credentials from environment variables
    const client_id = process.env.SPOTIFY_CLIENT_ID;
    const client_secret = process.env.SPOTIFY_CLIENT_SECRET;

    if (!client_id || !client_secret) {
      return NextResponse.json({ error: 'Spotify credentials not configured' }, { status: 500 });
    }

    // Create the authorization string (Base64 encoded client_id:client_secret)
    const authString = Buffer.from(`${client_id}:${client_secret}`).toString('base64');

    // Make the request to Spotify API
    const response = await axios({
      method: 'post',
      url: 'https://accounts.spotify.com/api/token',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: 'grant_type=client_credentials',
    });

    // Return the access token to the client
    return NextResponse.json({ access_token: response.data.access_token });
  } catch (error) {
    console.error('Error fetching Spotify access token:', error);
    return NextResponse.json({ error: 'Failed to fetch Spotify access token' }, { status: 500 });
  }
} 