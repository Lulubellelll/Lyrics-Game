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
        console.error("API error", response.status, errorData);
        throw new Error(`API error: ${response.status}`);
      }
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching lyrics:", error);
      throw error;
    }
  };
  