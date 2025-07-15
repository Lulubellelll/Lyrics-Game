import {NextRequest, NextResponse} from "next/server";
import { Client } from 'genius-lyrics';


const genius = new Client(process.env.GENIUS_ACCESS_TOKEN);
export const runtime = "nodejs";

export async function GET(request: NextRequest) {

    const results = await genius.songs.search('imagine jhon lennon');
    console.log(results);
    const song = results.find(
      (s) =>
        s.artist?.name?.toLowerCase().includes("jhonn lenon") ||
        s.title.toLowerCase().includes("imagine")
    );

    if (!song) return NextResponse.json({ error: 'Song not found' });

    const lyrics = await song.lyrics();
    return NextResponse.json({ lyrics });

}