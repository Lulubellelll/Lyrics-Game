export const isValidSpotifyPlaylistUrl = (url: string) => {
    return url.startsWith('https://open.spotify.com/playlist/') || 
           url.startsWith('https://spotify.com/playlist/');
  };
  
  export const extractPlaylistId = (url: string) => {
    const match = url.match(/playlist\/([a-zA-Z0-9]+)/);
    return match ? match[1] : null;
  };
  
  export const getClientCredentialsToken = async () => {
    try {
      const response = await fetch('/api/spotify');
      
      if (!response.ok) {
        throw new Error(`Failed to get access token: ${response.status}`);
      }
      
      const data = await response.json();
      return data.access_token;
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  };
  
  export const fetchPlaylist = async (playlistId: string, accessToken: string) => {
    try {
      const apiEndpoint = 'https://api.spotify.com/v1';
      
      const playlistResponse = await fetch(`${apiEndpoint}/playlists/${playlistId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
  
      if (!playlistResponse.ok) {
        throw new Error(`Failed to fetch playlist: ${playlistResponse.status}`);
      }
  
      const playlistData = await playlistResponse.json();
  
      // Process tracks
      const tracks = playlistData.tracks.items.map((item: any, index: number) => {
        const track = item.track;
        return {
          number: index + 1,
          title: track.name,
          artist: track.artists.map((artist: any) => artist.name).join(', '),
          duration: formatDuration(track.duration_ms)
        };
      });
  
      return {
        playlistInfo: {
          title: playlistData.name,
          description: playlistData.description,
          owner: playlistData.owner.display_name,
          count: playlistData.tracks.total
        },
        songs: tracks
      };
    } catch (error) {
      console.error('Error fetching playlist:', error);
      throw error;
    }
  };
  
  export const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }; 