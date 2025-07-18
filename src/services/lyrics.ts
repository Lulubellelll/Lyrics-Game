export interface LyricLine {
  text: string;
  time: {
    total: number;
    minutes: number;
    seconds: number;
    hundredths: number;
  };
}

export const fetchLyrics = async (song: string, artist: string): Promise<LyricLine[] | null> => {
  try {
    const response = await fetch(
      `/api/lyrics?song=${encodeURIComponent(song)}&artist=${encodeURIComponent(artist)}`,
      { 
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        // Prevent caching to get fresh results
        cache: 'no-store'
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("API error", response.status, errorData);
      return null;
    }

    const data = await response.json();
    
    // Check for API-level error in the response
    if (data.error) {
      console.error("Lyrics service error:", data.error);
      return null;
    }
    
    // Handle empty or missing lyrics
    if (!data || (Array.isArray(data.lyrics) && data.lyrics.length === 0)) {
      console.log(`No lyrics found for "${song}" by ${artist}`);
      return null;
    }
    
    // If we have lyrics in the response, return them
    if (Array.isArray(data.lyrics)) {
      return data.lyrics;
    }
    
    // Fallback: if the response is an array, use it directly
    if (Array.isArray(data) && data.length > 0) {
      return data;
    }
    
    console.log('Unexpected response format:', data);
    return null;
  } catch (error) {
    console.error("Error fetching lyrics:", error);
    return null;
  }
};
