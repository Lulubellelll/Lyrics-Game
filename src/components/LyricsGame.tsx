'use client';

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
  initializeLineDisplay, 
  formatLyricsArray,
  LyricLine
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

const LyricsGame: React.FC<LyricsGameProps> = (props) => {
  const { 
    playlistInfo, 
    allSongs, 
    suggestionSongs, 
    onGuessResult, 
    gameSettings 
  } = props;
  
  const [currentLyrics, setCurrentLyrics] = useState<LyricLine[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [userGuess, setUserGuess] = useState('');
  const [suggestions, setSuggestions] = useState<Song[]>([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState<number>(-1);
  const [loading, setLoading] = useState(false);
  const [lyricsArray, setLyricsArray] = useState<LyricLine[]>([]);
  const [shownLineIndices, setShownLineIndices] = useState<number[]>([]);
  const [nextLineIndex, setNextLineIndex] = useState<number>(0);
  const [justSelectedSuggestion, setJustSelectedSuggestion] = useState(false);
  const [availableSongs, setAvailableSongs] = useState<Song[]>([]);
  
  // Initialize availableSongs only once when component mounts
  useEffect(() => {
    if (allSongs.length > 0) {
      setAvailableSongs(allSongs);
    }
  }, [allSongs.length]); // Only depend on allSongs.length

  // Handle song selection
  useEffect(() => {
    const shouldSelectNewSong = !currentSong && availableSongs.length > 0 && !loading;
    
    if (shouldSelectNewSong) {
      const selectSong = async () => {
        await selectRandomSong();
      };
      selectSong();
    }
  }, [availableSongs.length, currentSong, loading]); // Only depend on length, not the entire array

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

  const selectRandomSong = React.useCallback(async () => {
    if (availableSongs.length === 0) {
      console.log('No more songs available, resetting song list');
      setAvailableSongs(allSongs);
      setLoading(false);
      return;
    }

    setLoading(true);
    const tempAvailableSongs = [...availableSongs];
    
    // Create a copy of the current state to avoid multiple state updates
    let foundLyrics = false;
    
    while (tempAvailableSongs.length > 0 && !foundLyrics) {
      const randomIndex = Math.floor(Math.random() * tempAvailableSongs.length);
      const selected = tempAvailableSongs[randomIndex];
      
      console.log(`Trying to fetch lyrics for: ${selected.title} by ${selected.artist}`);
      
      try {
        const lyrics = await fetchLyrics(selected.title, selected.artist);
        
        if (lyrics) {
          // Filter out empty lines and lines in brackets
          const filteredLyrics = filterBracketLines(lyrics);
          
          if (filteredLyrics.length > 0) {
            console.log(`Successfully found lyrics for: ${selected.title}`);
            
            // Process everything before updating state
            const processedLyrics = applyExcludeSongName(
              filteredLyrics, 
              selected.title, 
              gameSettings.excludeSongName
            );
            
            const { shownLineIndices: newShownLineIndices, nextLineIndex: newNextLineIndex } = initializeLineDisplay({
              displayMode: gameSettings.displayMode,
              startFromRandomLine: gameSettings.startFromRandomLine,
              lyricsLength: filteredLyrics.length,
            });
            
            // Single state update to prevent multiple re-renders
            setCurrentSong(selected);
            setLyricsArray(filteredLyrics);
            setShownLineIndices(newShownLineIndices);
            setNextLineIndex(newNextLineIndex);
            setCurrentLyrics(processedLyrics);
            
            // Update available songs
            setAvailableSongs(prev => 
              prev.filter(song => !(song.title === selected.title && song.artist === selected.artist))
            );
            
            foundLyrics = true;
            setLoading(false);
            return;
          }
        }
      } catch (error) {
        console.error(`Error fetching lyrics for ${selected.title}:`, error);
      }
      
      if (!foundLyrics) {
        console.log(`No lyrics found for "${selected.title}" by ${selected.artist}, trying another song`);
        tempAvailableSongs.splice(randomIndex, 1);
        
        if (tempAvailableSongs.length === 0) {
          console.log('No more songs with available lyrics, resetting song list');
          setAvailableSongs(allSongs);
          setCurrentLyrics([{ 
            text: "Sorry, couldn't find lyrics for any songs in this playlist.", 
            time: { total: 0, minutes: 0, seconds: 0, hundredths: 0 } 
          }]);
          setLoading(false);
          return;
        }
      }
    }
    
    setLoading(false);
  }, [allSongs, availableSongs, gameSettings.excludeSongName, gameSettings.displayMode, gameSettings.startFromRandomLine]);
  


  const handleNextLine = () => {
    if (!currentSong) return;
    
    const { updatedShownLineIndices, updatedNextLineIndex } = computeNextLineIndices({
      displayMode: gameSettings.displayMode,
      randomizeLyrics: gameSettings.randomizeLyrics,
      startFromRandomLine: gameSettings.startFromRandomLine,
      lyricsArray,
      shownLineIndices,
      nextLineIndex,
    });
    
    // Find the newly added line index
    const newLineIndex = updatedShownLineIndices.find(idx => !shownLineIndices.includes(idx));
    
    if (newLineIndex !== undefined) {
      // Get the current lyrics
      const updatedLyrics = [...currentLyrics];
      
      // If we need to exclude the song name, process the new line
      if (gameSettings.excludeSongName) {
        const lineToUpdate = { ...lyricsArray[newLineIndex] };
        const regex = new RegExp(currentSong.title, 'gi');
        lineToUpdate.text = lineToUpdate.text.replace(regex, '...');
        updatedLyrics[newLineIndex] = lineToUpdate;
      } else {
        // If not excluding, just copy the line as is
        updatedLyrics[newLineIndex] = { ...lyricsArray[newLineIndex] };
      }
      
      setCurrentLyrics(updatedLyrics);
    }
    
    setShownLineIndices(updatedShownLineIndices);
    setNextLineIndex(updatedNextLineIndex);
  };

  const handleSkipSong = () => {
    if (currentSong) {
      // Skip to the next song without increasing score
      const songToSkip = currentSong;
      
      // Clear current song state
      setCurrentSong(null);
      setCurrentLyrics([]);
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
    setCurrentLyrics([]);
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
      
      {currentLyrics.length > 0 && (
        <div className={styles.lyricsContainer}>
          <h3>Guess the song from these lyrics:</h3>
          <div className={styles.lyrics}>
            {shownLineIndices.map((lineIndex) => {
              const line = lyricsArray[lineIndex];
              return line ? <p key={lineIndex}>{line.text}</p> : null;
            })}
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
