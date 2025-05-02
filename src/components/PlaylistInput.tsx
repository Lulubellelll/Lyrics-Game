import React from 'react'
import styles from '@/styles/app/page.module.css'

interface PlaylistInputProps {
  playlistUrl: string
  onUrlChange: (url: string) => void
  onStart: () => void
}

const PlaylistInput: React.FC<PlaylistInputProps> = ({
  playlistUrl,
  onUrlChange,
  onStart
}) => (
  <div className={styles.inputSection}>
    <input
      type="text"
      value={playlistUrl}
      onChange={e => onUrlChange(e.target.value)}
      placeholder="Enter Spotify playlist URL"
      className={styles.input}
    />
    <button onClick={onStart} className={styles.button}>
      Start Game
    </button>
  </div>
)

export default PlaylistInput