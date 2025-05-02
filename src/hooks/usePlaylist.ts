import { useState } from 'react'
import {
  isValidSpotifyPlaylistUrl,
  extractPlaylistId,
  getClientCredentialsToken,
  fetchPlaylist
} from '@/services/spotify'
import { Song } from '@/types'
import { GameSettingsData } from '@/components/GameSettings'

export function usePlaylist() {
  const [playlistUrl, setPlaylistUrl] = useState<string>('')
  const [playlistId, setPlaylistId] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [playlistInfo, setPlaylistInfo] = useState<any>(null)
  const [allPlaylistSongs, setAllPlaylistSongs] = useState<Song[]>([])
  const [songs, setSongs] = useState<Song[]>([])

  const clearError = () => setError('')

  function handleFetchPlaylist(): boolean {
    clearError()
    if (!isValidSpotifyPlaylistUrl(playlistUrl)) {
      setError('Please enter a valid Spotify playlist URL')
      return false
    }
    const id = extractPlaylistId(playlistUrl)
    if (!id) {
      setError('Could not extract playlist ID')
      return false
    }
    setPlaylistId(id)
    return true
  }

  async function fetchSongs(settings: GameSettingsData) {
    setLoading(true)
    clearError()
    try {
      const token = await getClientCredentialsToken()
      if (!token) throw new Error('Auth failed')
      const { playlistInfo: info, songs: trackList } = await fetchPlaylist(playlistId, token)
      setPlaylistInfo(info)
      setAllPlaylistSongs(trackList)
      const subset = [...trackList]
        .sort(() => Math.random() - 0.5)
        .slice(0, settings.numberOfSongs)
      setSongs(subset)
    } catch (e) {
      console.error(e)
      setError('Failed to fetch playlist data')
    } finally {
      setLoading(false)
    }
  }

  return {
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
  }
}