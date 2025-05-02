import { useState, useEffect } from 'react'
import { Song } from '@/types'
import { GameSettingsData } from '@/components/GameSettings'

export function useGameFlow(
  songs: Song[],
  settings: GameSettingsData
) {
  const [gameActive, setGameActive] = useState(false)
  const [guessedSongs, setGuessedSongs] = useState<Song[]>([])
  const [score, setScore] = useState(0)
  const [currentSongIndex, setCurrentSongIndex] = useState(1)
  const [message, setMessage] = useState<string>('')
  const clearMessage = () => setMessage('')

  useEffect(() => {
    if (songs.length) {
      setGameActive(true)
      setGuessedSongs([])
      setScore(0)
      setCurrentSongIndex(1)
    }
  }, [songs, settings.numberOfSongs])

  function handleGuessResult(
    correct: boolean,
    song?: Song,
    wasSkipped = false
  ) {
    if (!song) return
    setGuessedSongs(prev => [...prev, song])
    // Score update and message
    if (correct) {
      setScore(prev => prev + 1)
      setMessage(`Correct! You guessed "${song.title}" by ${song.artist}`)
    } else {
      setMessage(wasSkipped
        ? `Skipped "${song.title}" by ${song.artist}`
        : `Wrong guess! It was "${song.title}" by ${song.artist}`)
    }
    // Advance index if not last
    if (guessedSongs.length + 1 < songs.length) {
      setCurrentSongIndex(i => i + 1)
    }
  }

  function reset() {
    setGameActive(false)
    setGuessedSongs([])
    setScore(0)
    setCurrentSongIndex(1)
    clearMessage()
  }

  return {
    gameActive,
    guessedSongs,
    score,
    currentSongIndex,
    handleGuessResult,
    reset,
    message,
    clearMessage
  }
}