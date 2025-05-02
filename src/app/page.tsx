'use client';

import { fetchLyrics } from "../services/lyrics";
import { useState } from 'react';
import styles from '../styles/app/page.module.css';
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorMessage from "@/components/ErrorMessage";
import LyricsGame from "@/components/LyricsGame";
import GameSettings, { GameSettingsData } from "@/components/GameSettings";
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
  const [allPlaylistSongs, setAllPlaylistSongs] = useState<Song[]>([]);

  // New state for game
  const [gameActive, setGameActive] = useState(false);
  const [guessedSongs, setGuessedSongs] = useState<Song[]>([]);
  const [score, setScore] = useState(0);
  
  // New state for game settings
  const [showSettings, setShowSettings] = useState(false);
  const [gameSettings, setGameSettings] = useState<GameSettingsData>({
    numberOfSongs: 5,
    displayMode: 'line-by-line',
    excludeSongName: true,
    randomizeLyrics: false,
    startFromRandomLine: true,
  });
  
  // Store the playlist ID for use in handleSettingsSaved
  const [currentPlaylistId, setCurrentPlaylistId] = useState<string>('');

  // Add current song index tracking
  const [currentSongIndex, setCurrentSongIndex] = useState<number>(1);

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
    
    // Store the playlist ID for later use
    setCurrentPlaylistId(playlistId);
    
    // Show settings modal instead of starting the game immediately
    setShowSettings(true);
  };
  
  const handleSettingsSaved = async (settings: GameSettingsData) => {
    setGameSettings(settings);
    setShowSettings(false);
    
    // Now start loading the playlist
    resetUI();
    setLoading(true);
  
    try {
      // Get access token using client credentials
      const accessToken = await getClientCredentialsToken();

      if (!accessToken) {
        throw new Error('Failed to get access token');
      }

      // Fetch playlist data
      const { playlistInfo: info, songs: trackList } = await fetchPlaylist(currentPlaylistId, accessToken);
      setPlaylistInfo(info);
      
      // Store all playlist songs for suggestions
      setAllPlaylistSongs(trackList);
      
      // Use only the number of songs specified in settings
      // Shuffle the tracks and select a subset based on numberOfSongs
      const shuffledTracks = [...trackList].sort(() => Math.random() - 0.5);
      const selectedTracks = shuffledTracks.slice(0, settings.numberOfSongs);
      setSongs(selectedTracks);
      
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
  
  const handleSettingsCancelled = () => {
    setShowSettings(false);
  };

  const handleGuessResult = (correct: boolean, song?: Song, wasSkipped: boolean = false) => {
    if (!song) return;
    
    // Add to guessed songs
    setGuessedSongs(prev => [...prev, song]);
    
    // Check if this was the last song before updating counters
    const isLastSong = guessedSongs.length + 1 >= songs.length;
    
    if (correct) {
      // Update score
      setScore(prev => prev + 1);
      
      // Only increment song index if not the last song
      if (!isLastSong) {
        setCurrentSongIndex(prev => prev + 1);
      }
      
      // Show success message
      setError(`Correct! You guessed "${song.title}" by ${song.artist}`);
    } else {
      // Only increment song index if not the last song
      if (!isLastSong) {
        setCurrentSongIndex(prev => prev + 1);
      }
      
      // Show different messages for wrong guess vs. skip
      if (wasSkipped) {
        setError(`Skipped "${song.title}" by ${song.artist}`);
      } else {
        setError(`Wrong guess! It was "${song.title}" by ${song.artist}`);
      }
    }
  };

  const resetUI = () => {
    setError('');
    setPlaylistInfo(null);
    setSongs([]);
    setAllPlaylistSongs([]);
    setGameActive(false);
    setGuessedSongs([]);
    setScore(0);
    setCurrentSongIndex(1);
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
      
      {!gameActive && !loading && !showSettings && (
        <p className={styles.instructions}>
          Enter a Spotify playlist URL to start the game. 
          You'll be shown lyrics from songs in the playlist and need to guess the song title.
        </p>
      )}
      
      {loading && <LoadingSpinner message="Fetching playlist data..." />}
      
      <ErrorMessage message={error} onClear={clearError} />
      
      {/* Game Settings Modal */}
      {showSettings && (
        <GameSettings 
          onSettingsSaved={handleSettingsSaved} 
          onCancel={handleSettingsCancelled} 
        />
      )}
      
      {gameActive && playlistInfo && (
        <div className={styles.gameStatus}>
          <div className={styles.scoreDisplay}>
            Score: {score}/{songs.length} • Song: {currentSongIndex}/{songs.length}
          </div>
          <div className={styles.gameSettings}>
            <span>Songs: {gameSettings.numberOfSongs}</span> | 
            <span>Display: {gameSettings.displayMode === 'line-by-line' ? 'Line by Line' : 'All at Once'}</span> | 
            <span>Exclude Names: {gameSettings.excludeSongName ? 'Yes' : 'No'}</span>
          </div>
          <div className={styles.gameSettings}>
            <span>Random Start: {gameSettings.startFromRandomLine ? 'Yes' : 'No'}</span> | 
            <span>Randomize Lyrics: {gameSettings.randomizeLyrics ? 'Yes' : 'No'}</span>
          </div>
          {songs.length === guessedSongs.length && songs.length > 0 && (
            <div className={styles.gameComplete}>
              Game Over! You've guessed {score} of {songs.length} songs correctly!
            </div>
          )}
        </div>
      )}
      
      {gameActive && playlistInfo && songs.length > 0 && guessedSongs.length < songs.length && (
        <LyricsGame 
          playlistInfo={playlistInfo}
          allSongs={songs.filter(song => !guessedSongs.some(g => g.number === song.number))}
          suggestionSongs={allPlaylistSongs}
          onGuessResult={handleGuessResult}
          gameSettings={gameSettings}
        />
      )}
    </div>
  );
}
