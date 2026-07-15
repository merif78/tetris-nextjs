# Tetris Next.js

Classic Tetris game built with Next.js, TypeScript, and Tailwind CSS.

## Features

✅ Classic Tetris gameplay with all 7 tetromino pieces
✅ Score calculation based on completed lines
✅ Next piece preview
✅ Adjustable game speed
✅ Pause/Resume functionality
✅ Game over detection
✅ Keyboard controls (Arrow keys + Space)
✅ Responsive design
✅ Original Tetris colors
✅ Ready for Vercel deployment

## Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000 in your browser
```

## Controls

- **← →** : Move piece left/right
- **↑** : Rotate piece
- **↓** : Drop piece faster
- **Space** : Pause/Resume

## Build for Production

```bash
npm run build
npm start
```

## Deploy on Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Click "Deploy"

## Game Rules

- Clear lines by filling them completely with pieces
- Each line cleared gives 100 points
- Multiple lines cleared simultaneously grant bonus points
- Game ends when pieces reach the top of the board

## Tech Stack

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Hooks** - State management

## License

MIT
