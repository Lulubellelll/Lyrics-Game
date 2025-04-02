'use client';

import { fetchLyrics } from "../services/lyrics";
import { useState } from 'react';
import styles from '../styles/app/page.module.css';
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorMessage from "@/components/ErrorMessage";
import LyricsGame from "@/components/LyricsGame";
import { 
  isValidSpotifyPlaylistUrl, 
  extractPlaylistId, 
  getClientCredentialsToken, 
  fetchPlaylist 
} from '@/services/spotify';
import { Song } from "@/types";
import { execArgv } from "process";

export default function Home() {

  const [playlistUrl, setPlaylistUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [playlistInfo, setPlaylistInfo] = useState<any>(null);
  const [songs, setSongs] = useState<Song[]>([]);

  // New state for game
  const [gameActive, setGameActive] = useState(false);
  const [guessedSongs, setGuessedSongs] = useState<Song[]>([]);
  const [score, setScore] = useState(0);

  const handleFetchPlaylist = async () => {
    if (!isValidSpotifyPlaylistUrl(playlistUrl)) {
      setError('Please enter a valid Spotify playlist URL');
      return;
    }

    // Extract playlist ID from URL
    const playlistId = extractPlaylistId(playlistUrl);
    if (!playlistId) {
      setError('Could not extract playlist ID from URL');
      return;
    }
    resetUI();
    setLoading(true);
  
    try {
      // Get access token using client credentials
      const accessToken = await getClientCredentialsToken();

      if (!accessToken) {
        throw new Error('Failed to get access token');
      }

      // Fetch playlist data
      const { playlistInfo: info, songs: trackList } = await fetchPlaylist(playlistId, accessToken);
      setPlaylistInfo(info);
      setSongs(trackList);
      
      // Start game
      setGameActive(true);
      setGuessedSongs([]);
      setScore(0);
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to fetch playlist data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuessResult = (correct: boolean, song?: Song) => {
    if (correct && song) {
      // Add to guessed songs
      setGuessedSongs(prev => [...prev, song]);
      
      // Update score
      setScore(prev => prev + 1);
      
      // Show success message - no need for setTimeout here
      setError(`Correct! You guessed "${song.title}" by ${song.artist}`);
    } else {
      // Show error for incorrect guess - no need for setTimeout here
      setError('Incorrect! Try again.');
    }
  };

  const resetUI = () => {
    setError('');
    setPlaylistInfo(null);
    setSongs([]);
    setGameActive(false);
    setGuessedSongs([]);
    setScore(0);
  };

  const clearError = () => {
    setError('');
  };


  const handleClick = async () => {
    try {
      const data = await fetchLyrics("Gönül", "Fikret Kızılok");
      console.log("Lyrics:", data.lyrics);
    } catch (error) {
      console.error("Failed to fetch lyrics:", error);
    }
  };

  return (
    <div className={styles.container}>
      <h1>Spotify Lyrics Guessing Game</h1>
      
      <div className={styles.inputSection}>
        <input 
          type="text" 
          value={playlistUrl}
          onChange={(e) => setPlaylistUrl(e.target.value)}
          placeholder="Enter Spotify playlist URL" 
        />
        <button onClick={handleFetchPlaylist}>Start Game</button>
      </div>
      
      {!gameActive && !loading && (
        <p className={styles.instructions}>
          Enter a Spotify playlist URL to start the game. 
          You'll be shown lyrics from songs in the playlist and need to guess the song title.
        </p>
      )}
      
      {loading && <LoadingSpinner message="Fetching playlist data..." />}
      
      <ErrorMessage message={error} onClear={clearError} />
      
      {gameActive && playlistInfo && (
        <div className={styles.gameStatus}>
          <div className={styles.scoreDisplay}>
            Score: {score}/{songs.length}
          </div>
          {songs.length === guessedSongs.length && songs.length > 0 && (
            <div className={styles.gameComplete}>
              Game Complete! You've guessed all songs!
            </div>
          )}
        </div>
      )}
      
      {gameActive && playlistInfo && songs.length > 0 && guessedSongs.length < songs.length && (
        <LyricsGame 
          playlistInfo={playlistInfo}
          allSongs={songs.filter(song => !guessedSongs.some(g => g.number === song.number))}
          onGuessResult={handleGuessResult}
        />
      )}
    </div>
  );
}
