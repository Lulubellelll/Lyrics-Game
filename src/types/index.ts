export interface PlaylistInfo {
    title: string;
    description: string;
    owner: string;
    count: number;
  }
  
  export interface Song {
    number: number;
    title: string;
    artist: string;
    duration: string;
  }
  
  export interface LyricsResponse {
    lyrics?: string;
    message?: string;
    error?: string;
  } 