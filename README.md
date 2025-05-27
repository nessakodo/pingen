# CollabMoodboard.AI

Transform your Pinterest boards with AI-powered creative collaboration. Add your twist to any board and generate new, inspired content.

## Features

- 🎨 Analyze Pinterest board aesthetics
- ✨ Add your creative twist
- 🤖 AI-powered content generation
- 🎯 Generate image prompts, titles, and hashtags
- 🌙 Dark mode support
- 📱 Responsive design

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/collab-moodboard.git
cd collab-moodboard
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory with your API keys:
```env
OPENAI_API_KEY=your_openai_api_key_here
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Enter a Pinterest board URL
2. Add your creative twist (e.g., "add sunset tones and playful shapes")
3. Click "Remix Moodboard"
4. View your AI-generated ideas

## Development

### Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── remix/
│   │       └── route.ts    # API endpoint for remixing
│   │   ├── page.tsx            # Main page component
│   │   └── layout.tsx          # Root layout
├── components/             # Reusable components
└── styles/                # Global styles
```

### Technologies Used

- Next.js 14
- TypeScript
- Tailwind CSS
- OpenAI API
- Framer Motion
- Heroicons

## Deployment

The application can be deployed on Vercel:

```bash
npm run build
vercel deploy
```

## Future Enhancements

- Direct Pinterest API integration
- Image generation with DALL·E
- User accounts and saved boards
- Collaborative features
- Export to Pinterest
- Custom themes and branding

## License

MIT License - feel free to use this project for your own purposes.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
