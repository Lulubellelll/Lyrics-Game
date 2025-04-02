import React from 'react';
import styles from '../styles/components/PlaylistInfo.module.css';

interface PlaylistInfoProps {
  playlistInfo: {
    title: string;
    description: string;
    owner: string;
    count: number;
  };
}

const PlaylistInfo: React.FC<PlaylistInfoProps> = ({ playlistInfo }) => {
  return (
    <div className={styles.playlistInfo}>
      <h2>{playlistInfo.title}</h2>
      <p>{playlistInfo.description}</p>
      <div className={styles.playlistMeta}>
        <span>Created by: {playlistInfo.owner}</span>
        <span>{playlistInfo.count} songs</span>
      </div>
    </div>
  );
};

export default PlaylistInfo; 