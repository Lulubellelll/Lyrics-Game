import type { GameSettingsData } from './GameSettings';

export interface LyricLine {
  text: string;
  time: {
    total: number;
    minutes: number;
    seconds: number;
    hundredths: number;
  }
}

export const filterBracketLines = (lyrics: LyricLine[]): LyricLine[] => {
  return lyrics.filter(line => {
    if (!line.text.trim()) return false;
    const bracketRegex = /^\s*\[.*\]\s*$/;
    return !bracketRegex.test(line.text);
  });
};

export interface NextLineParams {
  displayMode: GameSettingsData['displayMode'];
  randomizeLyrics: boolean;
  startFromRandomLine: boolean;
  lyricsArray: LyricLine[];
  shownLineIndices: number[];
  nextLineIndex: number;
}

export const computeNextLineIndices = ({ displayMode, randomizeLyrics, startFromRandomLine, lyricsArray, shownLineIndices, nextLineIndex }: NextLineParams): { updatedShownLineIndices: number[]; updatedNextLineIndex: number } => {
  if (displayMode !== 'line-by-line' || lyricsArray.length === 0) {
    return { updatedShownLineIndices: shownLineIndices, updatedNextLineIndex: nextLineIndex };
  }

  let updatedShownLineIndices = [...shownLineIndices];
  let updatedNextLineIdx = nextLineIndex;

  if (randomizeLyrics) {
    const notShown = Array.from({ length: lyricsArray.length }, (_, i) => i).filter(i => !shownLineIndices.includes(i));
    if (notShown.length > 0) {
      const rnd = Math.floor(Math.random() * notShown.length);
      updatedShownLineIndices = [...shownLineIndices, notShown[rnd]].sort((a, b) => a - b);
    }
  } else {
    if (nextLineIndex < lyricsArray.length) {
      updatedShownLineIndices = [...shownLineIndices, nextLineIndex].sort((a, b) => a - b);
      updatedNextLineIdx = nextLineIndex + 1;
    } else if (startFromRandomLine) {
      const notShown = Array.from({ length: lyricsArray.length }, (_, i) => i).filter(i => !shownLineIndices.includes(i));
      if (notShown.length > 0) {
        const nextIdx = notShown.sort((a, b) => a - b)[0];
        updatedShownLineIndices = [...shownLineIndices, nextIdx].sort((a, b) => a - b);
        const remaining = notShown.filter(i => i !== nextIdx);
        if (remaining.length > 0) updatedNextLineIdx = remaining.sort((a, b) => a - b)[0];
      }
    }
  }

  return { updatedShownLineIndices, updatedNextLineIndex: updatedNextLineIdx };
}

export const implementLBLSetting = (startFromRandomLine: boolean, lyricsLength: number) => {
  let startIndex = 0;

  if (startFromRandomLine && lyricsLength > 0) {
    startIndex = Math.floor(Math.random() * Math.min(lyricsLength, 8));
  }

  return startIndex;
}

// Apply excludeSongName setting: replace occurrences of title
export const applyExcludeSongName = (
  lyrics: LyricLine[],
  title: string,
  excludeSongName: boolean
): LyricLine[] => {
  if (!excludeSongName || !title) {
    return [...lyrics];
  }
  
  const regex = new RegExp(title, 'gi');
  return lyrics.map(line => ({
    ...line,
    text: line.text.replace(regex, '...')
  }));
};

// Format lyrics array to extract just the text
export const formatLyricsArray = (lyrics: LyricLine[]): string[] => {
  return lyrics
    .filter(line => line.text.trim() !== "")
    .map(line => line.text);
};

export interface InitialLineDisplayParams {
  displayMode: GameSettingsData['displayMode'];
  startFromRandomLine: boolean;
  lyricsLength: number;
}

export const initializeLineDisplay = ({
  displayMode,
  startFromRandomLine,
  lyricsLength
}: InitialLineDisplayParams): { shownLineIndices: number[]; nextLineIndex: number } => {
  if (displayMode !== 'line-by-line') {
    const allIndices = Array.from({ length: lyricsLength }, (_, i) => i);
    return { shownLineIndices: allIndices, nextLineIndex: 0 };
  }
  const startIndex = implementLBLSetting(startFromRandomLine, lyricsLength);
  return { shownLineIndices: [startIndex], nextLineIndex: startIndex + 1 };
};