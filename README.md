# Lyrics Guessing Game

A music trivia game that challenges players to identify songs from lyrics snippets, powered by Spotify playlists and Genius lyrics.

## Features
- 🎵 Connect any public Spotify playlist
- 📜 Get random lyrics snippets from playlist songs
- 🔍 Typeahead suggestions for song guesses
- 📊 Track your score and progress

## Getting Started

### Prerequisites
- Spotify client ID & secret (`.env.local`)
- Node.js v18+
- Spotify playlist URL (public)

### Installation
```bash
git clone https://github.com/your-username/lyrics-game.git
cd lyrics-game
npm install
```

### Environment Setup
Create `.env.local`:
```env
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
NEXT_PUBLIC_GENIUS_ACCESS_TOKEN=your_genius_token
```

### Running the App
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

## Usage
1. Enter a Spotify playlist URL
2. Game loads playlist metadata and songs
3. Guess songs/artists from lyrics snippets
4. Earn points for correct guesses
5. Track your progress in real-time

## API Reference
### Spotify Integration
- Playlist validation
- Song metadata extraction
- Client credentials flow

### Lyrics Service
- Genius API integration
- Lyrics formatting/obfuscation
- Error handling

## Tech Stack
- Next.js 14 (App Router)
- TypeScript
- Spotify Web API
- Genius Lyrics API
- CSS Modules

## Contributing
1. Fork the repository
2. Create feature branch (`git checkout -b feature/foo`)
3. Commit changes (`git commit -am 'Add foo'`)
4. Push to branch (`git push origin feature/foo`)
5. Open Pull Request