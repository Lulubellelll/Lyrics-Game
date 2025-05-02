'use client'
import { usePlaylist } from '@/hooks/usePlaylist'
import { useGameSettings } from '@/hooks/useGameSettings'
import { useGameFlow } from '@/hooks/useGameFlow'
import styles from '../styles/app/page.module.css'
import PlaylistInput from '@/components/PlaylistInput'
import GameArea from '@/components/GameArea'

export default function Home() {
  const {
    playlistUrl,
    setPlaylistUrl,
    loading,
    error,
    clearError,
    playlistInfo,
    allPlaylistSongs,
    songs,
    handleFetchPlaylist,
    fetchSongs
  } = usePlaylist()

  const {
    showSettings,
    settings,
    setShowSettings,
    handleSettingsSaved,
    handleSettingsCancelled
  } = useGameSettings(fetchSongs)

  const {
    gameActive,
    guessedSongs,
    score,
    currentSongIndex,
    handleGuessResult,
    reset,
    message,
    clearMessage: clearGameMessage
  } = useGameFlow(songs, settings)

  // Combine fetch errors and game result messages
  const displayError = error || message
  const handleClearAll = () => {
    if (error) clearError()
    else clearGameMessage()
  }

  return (
    <div className={styles.container}>
      <h1>Spotify Lyrics Guessing Game</h1>
      <PlaylistInput
        playlistUrl={playlistUrl}
        onUrlChange={setPlaylistUrl}
        onStart={() => {
          if (handleFetchPlaylist()) setShowSettings(true)
        }}
      />
      <GameArea
        loading={loading}
        error={displayError}
        clearError={handleClearAll}
        showSettings={showSettings}
        settings={settings}
        onSettingsSaved={handleSettingsSaved}
        onSettingsCancelled={handleSettingsCancelled}
        gameActive={gameActive}
        songs={songs}
        guessedSongs={guessedSongs}
        currentSongIndex={currentSongIndex}
        score={score}
        playlistInfo={playlistInfo}
        allPlaylistSongs={allPlaylistSongs}
        onGuessResult={handleGuessResult}
        onReset={reset}
      />
    </div>
  )
}