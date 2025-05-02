import React from 'react'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorMessage from '@/components/ErrorMessage'
import GameSettings, { GameSettingsData } from '@/components/GameSettings'
import LyricsGame from '@/components/LyricsGame'
import { Song } from '@/types'
import styles from '@/styles/app/page.module.css'

interface GameAreaProps {
  loading: boolean
  error: string
  clearError: () => void
  gameActive: boolean
  showSettings: boolean
  settings: GameSettingsData
  songs: Song[]
  guessedSongs: Song[]
  currentSongIndex: number
  score: number
  playlistInfo: any
  allPlaylistSongs: Song[]
  onSettingsSaved: (s: GameSettingsData) => void
  onSettingsCancelled: () => void
  onGuessResult: (correct: boolean, song?: Song, wasSkipped?: boolean) => void
  onReset: () => void
}

const GameArea: React.FC<GameAreaProps> = ({
  loading,
  error,
  clearError,
  gameActive,
  showSettings,
  settings,
  songs,
  guessedSongs,
  currentSongIndex,
  score,
  playlistInfo,
  allPlaylistSongs,
  onSettingsSaved,
  onSettingsCancelled,
  onGuessResult,
  onReset
}) => {
  if (loading) {
    return <LoadingSpinner message="Fetching playlist data..." />
  }

  return (
    <>
      <ErrorMessage message={error} onClear={clearError} />

      {showSettings && (
        <GameSettings
          initialData={settings}
          onSettingsSaved={onSettingsSaved}
          onSettingsCancelled={onSettingsCancelled}
        />
      )}

      {gameActive && !showSettings && (
        <>
          <div className={styles.gameStatus}>
            <div>
              Score: {score}/{songs.length} • Song: {currentSongIndex}/{songs.length}
            </div>
          </div>

          <LyricsGame
            playlistInfo={playlistInfo}
            allSongs={songs.filter(s => !guessedSongs.includes(s))}
            suggestionSongs={allPlaylistSongs}
            onGuessResult={onGuessResult}
            gameSettings={settings}
          />

          {guessedSongs.length === songs.length && songs.length > 0 && (
            <>
              <div className={styles.gameComplete}>
                Game Over! You've guessed {score} of {songs.length} songs correctly!
              </div>
              <div className={styles.centerButton}>
                <button onClick={onReset} className={styles.button}>
                  Play Again
                </button>
              </div>
            </>
          )}
        </>
      )}
    </>
  )
}

export default GameArea