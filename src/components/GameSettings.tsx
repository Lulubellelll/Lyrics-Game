import React, { useState, ChangeEvent } from 'react';
import styles from '../styles/components/GameSettings.module.css';

export interface GameSettingsProps {
  onSettingsSaved: (settings: GameSettingsData) => void;
  onCancel: () => void;
}

export interface GameSettingsData {
  numberOfSongs: number;
  displayMode: 'line-by-line' | 'all-at-once';
  excludeSongName: boolean;
  randomizeLyrics: boolean;
  startFromRandomLine: boolean;
}

const GameSettings: React.FC<GameSettingsProps> = ({ onSettingsSaved, onCancel }) => {
  const [settings, setSettings] = useState<GameSettingsData>({
    numberOfSongs: 5,
    displayMode: 'line-by-line',
    excludeSongName: true,
    randomizeLyrics: false,
    startFromRandomLine: true,
  });

  const handleSave = () => {
    onSettingsSaved(settings);
  };
  
  const handleSongNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'range' 
      ? parseInt(e.target.value) 
      : parseInt(e.target.value) || 1;
      
    // Enforce the limits between 1 and 50
    const limitedValue = Math.min(Math.max(value, 1), 50);
    
    setSettings({...settings, numberOfSongs: limitedValue});
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>Game Settings</h2>
        
        <div className={styles.settingGroup}>
          <label>Number of Songs: {settings.numberOfSongs}</label>
          <div className={styles.rangeContainer}>
            <input
              type="range"
              min="1"
              max="50"
              value={settings.numberOfSongs}
              onChange={handleSongNumberChange}
              className={styles.rangeSlider}
            />
            <input
              type="number"
              min="1"
              max="50"
              value={settings.numberOfSongs}
              onChange={handleSongNumberChange}
              className={styles.numberInput}
            />
          </div>
        </div>

        <div className={styles.settingGroup}>
          <label>Display of Lyrics:</label>
          <div className={styles.optionButtons}>
            <button
              className={settings.displayMode === 'line-by-line' ? styles.selected : ''}
              onClick={() => setSettings({...settings, displayMode: 'line-by-line'})}
            >
              Line by Line
            </button>
            <button
              className={settings.displayMode === 'all-at-once' ? styles.selected : ''}
              onClick={() => setSettings({...settings, displayMode: 'all-at-once'})}
            >
              All at Once
            </button>
          </div>
        </div>

        <div className={styles.settingGroup}>
          <label>Exclude Name of Song:</label>
          <div className={styles.optionButtons}>
            <button
              className={settings.excludeSongName ? styles.selected : ''}
              onClick={() => setSettings({...settings, excludeSongName: true})}
            >
              Yes
            </button>
            <button
              className={!settings.excludeSongName ? styles.selected : ''}
              onClick={() => setSettings({...settings, excludeSongName: false})}
            >
              No
            </button>
          </div>
        </div>
        
        <div className={styles.settingGroup}>
          <label>Randomize Lines:</label>
          <div className={styles.optionButtons}>
            <button
              className={settings.randomizeLyrics ? styles.selected : ''}
              onClick={() => setSettings({...settings, randomizeLyrics: true})}
            >
              Yes
            </button>
            <button
              className={!settings.randomizeLyrics ? styles.selected : ''}
              onClick={() => setSettings({...settings, randomizeLyrics: false})}
            >
              No
            </button>
          </div>
        </div>
        
        <div className={styles.settingGroup}>
          <label>Start from a random Line:</label>
          <div className={styles.optionButtons}>
            <button
              className={settings.startFromRandomLine ? styles.selected : ''}
              onClick={() => setSettings({...settings, startFromRandomLine: true})}
            >
              Yes
            </button>
            <button
              className={!settings.startFromRandomLine ? styles.selected : ''}
              onClick={() => setSettings({...settings, startFromRandomLine: false})}
            >
              No
            </button>
          </div>
        </div>

        <div className={styles.modalActions}>
          <button className={styles.cancelButton} onClick={onCancel}>Cancel</button>
          <button className={styles.saveButton} onClick={handleSave}>Start Game</button>
        </div>
      </div>
    </div>
  );
};

export default GameSettings; 