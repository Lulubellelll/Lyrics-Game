export interface PlaylistInfo {
    title: string;
    description: string;
    owner: string;
    count: number;
  }
  
  export interface Song {
    title: string;
    artist: string;
    album?: string;
    id?: string;
    number?: number;
    duration?: string;
  }
  
  export interface LyricsResponse {
    lyrics?: string;
    message?: string;
    error?: string;
  } 