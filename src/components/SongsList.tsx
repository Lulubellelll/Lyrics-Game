import React from 'react';
import styles from '../styles/components/SongsList.module.css';

interface Song {
  number: number;
  title: string;
  artist: string;
  duration: string;
}

interface SongsListProps {
  songs: Song[];
  onSongClick: (title: string, artist: string) => void;
}

const SongsList: React.FC<SongsListProps> = ({ songs, onSongClick }) => {
  return (
    <ul className={styles.songsList}>
      {songs.map((song) => (
        <li 
          key={`${song.number}-${song.title}`} 
          className={styles.songItem}
          onClick={() => onSongClick(song.title, song.artist)}
        >
          <span className={styles.songNumber}>{song.number}</span>
          <span className={styles.songTitle}>{song.title} - {song.artist}</span>
          <span className={styles.songDuration}>{song.duration}</span>
        </li>
      ))}
    </ul>
  );
};

export default SongsList; 