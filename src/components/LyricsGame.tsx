import React, { useState, useEffect, useRef } from 'react';
import styles from '../styles/components/LyricsGame.module.css';
import { Song } from '@/types';
import LoadingSpinner from './LoadingSpinner';
import { fetchLyrics } from '@/services/lyrics';

interface LyricsGameProps {
  playlistInfo: {
    title: string;
    description: string;
    owner: string;
    count: number;
  };
  allSongs: Song[];
  onGuessResult: (correct: boolean, song?: Song) => void;
}

const LyricsGame: React.FC<LyricsGameProps> = ({ playlistInfo, allSongs, onGuessResult }) => {
  const [currentLyrics, setCurrentLyrics] = useState('');
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [userGuess, setUserGuess] = useState('');
  const [suggestions, setSuggestions] = useState<Song[]>([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState<number>(-1);
  const [loading, setLoading] = useState(false);

  // Single useEffect to trigger song selection when needed.
  useEffect(() => {
    if (!currentSong && allSongs.length > 0 && !loading) {
      selectRandomSong();
    }
  }, [allSongs, currentSong, loading]);

  const selectRandomSong = async () => {
    if (allSongs.length === 0) return;
    
    setLoading(true);
    const availableSongs = [...allSongs]; // Create a copy to avoid mutating props
    
    // Try selecting a song with available lyrics
    while (availableSongs.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableSongs.length);
      const selected = availableSongs[randomIndex];
      setCurrentSong(selected);

      const data = await fetchLyrics(selected.title, selected.artist);
          
      if (data.lyrics) {
        setCurrentLyrics(data.lyrics);
        setLoading(false);
        return
      } else {
        availableSongs.splice(randomIndex, 1);
        console.log(`No lyrics found for "${selected.title}" by ${selected.artist}, trying another song`);
      }
    }
    
    setLoading(false);
    setCurrentLyrics("Sorry, couldn't find lyrics for any songs in this playlist.");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setUserGuess(input);
    if (!input.trim()) {
      setSuggestions([]);
      setSelectedSuggestionIndex(-1);
      return;
    }
    const filteredSuggestions = allSongs.filter(song =>
      song.title.toLowerCase().includes(input.toLowerCase()) ||
      song.artist.toLowerCase().includes(input.toLowerCase())
    );
    setSuggestions(filteredSuggestions);
    setSelectedSuggestionIndex(-1);
  };

  const handleSuggestionClick = (suggestion: Song) => {
    setUserGuess(`${suggestion.title} - ${suggestion.artist}`);
    setSuggestions([]);
    setSelectedSuggestionIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev =>
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev =>
        prev > 0 ? prev - 1 : suggestions.length - 1
      );
      return;
    }
    if (e.key === 'Enter') {
      if (suggestions.length > 0 && selectedSuggestionIndex >= 0) {
        const selected = suggestions[selectedSuggestionIndex];
        setUserGuess(`${selected.title} - ${selected.artist}`);
        setSuggestions([]);
        setSelectedSuggestionIndex(-1);
        return;
      }
      handleSubmitGuess();
    }
  };

  const handleSubmitGuess = (songGuess: string = userGuess) => {
    if (!currentSong) return;
    if (!songGuess.trim()) return;
    
    const guess = songGuess.trim();
    const correct = guess === `${currentSong.title} - ${currentSong.artist}`;
    
    setUserGuess('');
    setSuggestions([]);
    setSelectedSuggestionIndex(-1);
    
    onGuessResult(correct, currentSong);
    
    if (correct) {
      // Clear currentSong and lyrics; the useEffect will trigger a new selection.
      setCurrentSong(null);
      setCurrentLyrics('');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading song lyrics..." />;
  }

  return (
    <div className={styles.gameContainer}>
      <div className={styles.guessContainer}>
        <input
          type="text"
          value={userGuess}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Type song name..."
          className={styles.guessInput}
          autoComplete="off"
        />
        <button 
          onClick={() => handleSubmitGuess()}
          className={styles.guessButton}
        >
          Submit Guess
        </button>
        {suggestions.length > 0 && (
          <div className={styles.suggestionsContainer}>
            {suggestions.map((song, index) => (
              <div 
                key={index} 
                className={`${styles.suggestionItem} ${
                  index === selectedSuggestionIndex ? styles.selectedSuggestion : ''
                }`}
                onClick={() => handleSuggestionClick(song)}
              >
                {song.title} - {song.artist}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {currentLyrics && (
        <div className={styles.lyricsContainer}>
          <h3>Guess the song from these lyrics:</h3>
          <div className={styles.lyrics}>
            {currentLyrics.split('\n').map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LyricsGame;
