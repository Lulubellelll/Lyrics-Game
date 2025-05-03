import React, { useState, useEffect, useRef } from 'react';
import styles from '../styles/components/LyricsGame.module.css';
import { Song } from '@/types';
import LoadingSpinner from './LoadingSpinner';
import { fetchLyrics } from '@/services/lyrics';
import { GameSettingsData } from './GameSettings';
import { 
  filterBracketLines, 
  computeNextLineIndices, 
  implementLBLSetting, 
  applyExcludeSongName, 
  splitAndFilterLyrics, 
  initializeLineDisplay 
} from './LyricsGameHelpers';

interface LyricsGameProps {
  playlistInfo: {
    title: string;
    description: string;
    owner: string;
    count: number;
  };
  allSongs: Song[];
  suggestionSongs: Song[];
  onGuessResult: (correct: boolean, song?: Song, wasSkipped?: boolean) => void;
  gameSettings: GameSettingsData;
}

const LyricsGame: React.FC<LyricsGameProps> = ({ 
  playlistInfo, 
  allSongs, 
  suggestionSongs, 
  onGuessResult, 
  gameSettings 
}) => {
  const [currentLyrics, setCurrentLyrics] = useState('');
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [userGuess, setUserGuess] = useState('');
  const [suggestions, setSuggestions] = useState<Song[]>([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState<number>(-1);
  const [loading, setLoading] = useState(false);
  const [lyricsArray, setLyricsArray] = useState<string[]>([]);
  const [shownLineIndices, setShownLineIndices] = useState<number[]>([]);
  const [nextLineIndex, setNextLineIndex] = useState<number>(0);
  const [justSelectedSuggestion, setJustSelectedSuggestion] = useState(false);
  
  // useEffect to trigger song selection when needed.
  useEffect(() => {
    if (!currentSong && allSongs.length > 0 && !loading) {
      selectRandomSong();
    }
  }, [allSongs, currentSong, loading]);

  // Reset justSelectedSuggestion after it's been used
  useEffect(() => {
    if (justSelectedSuggestion) {
      // Use small timeout to allow time for user to see the selected suggestion
      const timer = setTimeout(() => {
        setJustSelectedSuggestion(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [justSelectedSuggestion]);

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
        // Process lyrics to hide song name if needed
        const processedLyrics = applyExcludeSongName(data.lyrics, selected.title, gameSettings.excludeSongName);
        
        // Split into lines and filter out lines in brackets
        const lyricsLines = splitAndFilterLyrics(processedLyrics);
        setLyricsArray(lyricsLines);
        
        const { shownLineIndices, nextLineIndex } = initializeLineDisplay({
          displayMode: gameSettings.displayMode,
          startFromRandomLine: gameSettings.startFromRandomLine,
          lyricsLength: lyricsLines.length,
        });
        setShownLineIndices(shownLineIndices);
        setNextLineIndex(nextLineIndex);
        
        setCurrentLyrics(processedLyrics);
        setLoading(false);
        return;
      } else {
        availableSongs.splice(randomIndex, 1);
        console.log(`No lyrics found for "${selected.title}" by ${selected.artist}, trying another song`);
      }
    }
    
    setLoading(false);
    setCurrentLyrics("Sorry, couldn't find lyrics for any songs in this playlist.");
  };

  const handleNextLine = () => {
    const { updatedShownLineIndices, updatedNextLineIndex } = computeNextLineIndices({
      displayMode: gameSettings.displayMode,
      randomizeLyrics: gameSettings.randomizeLyrics,
      startFromRandomLine: gameSettings.startFromRandomLine,
      lyricsArray,
      shownLineIndices,
      nextLineIndex,
    });
    setShownLineIndices(updatedShownLineIndices);
    setNextLineIndex(updatedNextLineIndex);
  };

  const handleSkipSong = () => {
    if (currentSong) {
      // Skip to the next song without increasing score
      const songToSkip = currentSong;
      
      // Clear current song state
      setCurrentSong(null);
      setCurrentLyrics('');
      setLyricsArray([]);
      setShownLineIndices([]);
      setNextLineIndex(0);
      
      // Notify parent with wasSkipped=true
      onGuessResult(false, songToSkip, true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setUserGuess(input);
    if (!input.trim()) {
      setSuggestions([]);
      setSelectedSuggestionIndex(-1);
      return;
    }
    
    // Use suggestionSongs (all playlist songs) instead of allSongs (selected game songs)
    const filteredSuggestions = suggestionSongs.filter(song =>
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

  const selectFirstSuggestion = () => {
    if (suggestions.length > 0) {
      const firstSuggestion = suggestions[0];
      setUserGuess(`${firstSuggestion.title} - ${firstSuggestion.artist}`);
      setSuggestions([]);
      setSelectedSuggestionIndex(-1);
      setJustSelectedSuggestion(true);
      return true;
    }
    return false;
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
      e.preventDefault();
      
      // If there's a selected suggestion in the dropdown, use it
      if (suggestions.length > 0 && selectedSuggestionIndex >= 0) {
        const selected = suggestions[selectedSuggestionIndex];
        setUserGuess(`${selected.title} - ${selected.artist}`);
        setSuggestions([]);
        setSelectedSuggestionIndex(-1);
        setJustSelectedSuggestion(true);
        return;
      }
      
      // If we just selected a suggestion with the previous Enter press, submit now
      if (justSelectedSuggestion) {
        handleSubmitGuess();
        return;
      }
      
      // If there are suggestions but none selected, select the first one
      if (suggestions.length > 0) {
        selectFirstSuggestion();
        return;
      }
      
      // If no suggestions or we already auto-completed, submit the guess
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
    setJustSelectedSuggestion(false);
    
    // Store the current song before clearing it
    const currentSongCopy = currentSong;
    
    // Clear state regardless of correct or incorrect to move to next song
    setCurrentSong(null);
    setCurrentLyrics('');
    setLyricsArray([]);
    setShownLineIndices([]);
    setNextLineIndex(0);
    
    // Notify parent
    onGuessResult(correct, currentSongCopy, false);
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
            {shownLineIndices.map((lineIndex) => (
              <p key={lineIndex}>{lyricsArray[lineIndex]}</p>
            ))}
          </div>
          
          {gameSettings.displayMode === 'line-by-line' && shownLineIndices.length < lyricsArray.length && (
            <div className={styles.buttonContainer}>
              <button 
                className={styles.skipSongButton}
                onClick={handleSkipSong}
              >
                &gt; Skip Song &gt;
              </button>
              <button 
                className={styles.nextLineButton}
                onClick={handleNextLine}
              >
                Next Line &gt;
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LyricsGame;
