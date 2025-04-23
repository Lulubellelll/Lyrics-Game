import LyricsGame from "@/components/LyricsGame";

export const fetchLyrics = async (title: string, artist: string) => {
    try {
      const response = await fetch(
        `/api/lyrics?title=${encodeURIComponent(title)}&artist=${encodeURIComponent(artist)}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        // console.error("API error", response.status, errorData);
        return { lyrics: null };
      }
  
      const data = await response.json();
      data.lyrics = formatLyrics(data.lyrics);
      return data;
    } catch (error) {
      // console.error("Error fetching lyrics:", error);
      return { lyrics: null };
    }
  };

const formatLyrics = ( lyrics: string ) => {

  if (lyrics) {
    const lyricsLines = lyrics.split("\n");
    const processedlyrics = lyricsLines.slice(1).join("\n");
    return processedlyrics
  } else {
    return lyrics
  }
}