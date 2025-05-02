import { useState } from 'react'
import { GameSettingsData } from '@/components/GameSettings'

export function useGameSettings(
  fetchSongs: (settings: GameSettingsData) => Promise<void>
) {
  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings] = useState<GameSettingsData>({
    numberOfSongs: 5,
    displayMode: 'line-by-line',
    excludeSongName: true,
    randomizeLyrics: false,
    startFromRandomLine: true
  })

  async function handleSettingsSaved(newSettings: GameSettingsData) {
    setSettings(newSettings)
    setShowSettings(false)
    await fetchSongs(newSettings)
  }

  function handleSettingsCancelled() {
    setShowSettings(false)
  }

  return {
    showSettings,
    settings,
    setShowSettings,
    handleSettingsSaved,
    handleSettingsCancelled
  }
}