import {NextRequest, NextResponse} from "next/server";
import axios from "axios";

const GENIUS_API_KEY = process.env.GENIUS_API_KEY;


export async function GET(request: NextRequest) {

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
        return NextResponse.json({ error: "Missing 'q' query parameter."}, {status: 400});
    }

    try {
        const response = await axios.get("https://api.genius.com/search", {
          params: { q: query },
          headers: {
            Authorization: `Bearer ${GENIUS_API_KEY}`,
          },
        });
    
        return NextResponse.json(response.data);
      } catch (error: any) {
        return NextResponse.json(
          { error: error.response?.data || error.message },
          { status: error.response?.status || 500 }
        );
      }

}