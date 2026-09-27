# ResumYT

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

An AI-powered YouTube video summarizer that extracts key insights from any video quickly and efficiently.

## What it does

- **Automatic transcription** — extracts audio and generates text from YouTube videos
- **AI summarization** — uses multiple providers (OpenAI, OpenRouter, DeepSeek) for intelligent summaries
- **Multiple formats** — customizable summary lengths and styles
- **Real-time processing** — live progress tracking during video analysis
- **Multi-language support** — works with videos in various languages

## Quick start

### Prerequisites

- Node.js 18+
- At least one AI provider API key (OpenAI, OpenRouter, or DeepSeek)
- A YouTube Data API v3 key
- A Supabase project (used for storage and auth)

### 1. Clone and install

```bash
git clone https://github.com/obeskay/resumyt-ai.git
cd resumyt-ai
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Then fill in your keys. **`.env.example` is the authoritative list** — it covers the
AI providers, the YouTube Data API, Supabase, Google OAuth and NextAuth. At minimum
you need one AI provider key, the YouTube key, and the Supabase pair; sign-in also
needs the Google OAuth and NextAuth values.

### 3. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start using the tool.

## Features

### Smart processing

- Multiple transcription fallback methods
- Intelligent content preprocessing
- Real-time progress tracking

### AI integration

- **Primary** — OpenAI for high-quality summaries
- **Fallback** — OpenRouter for reliability
- **Efficient** — DeepSeek for fast processing

### User experience

- Clean, responsive interface
- Dark and light themes
- Anonymous and authenticated usage
- Usage quota management

## Technology stack

- **Frontend** — Next.js 14, TypeScript, Tailwind CSS, Radix UI
- **Backend** — Next.js API routes, Supabase
- **AI** — OpenAI, OpenRouter and DeepSeek via the Vercel AI SDK
- **Media** — ffmpeg for audio extraction
- **Monitoring** — Sentry

## Deployment

### Vercel

```bash
npm run build
vercel --prod
```

### Docker

A `Dockerfile` is included:

```bash
docker build -t resumyt .
docker run -p 3000:3000 --env-file .env resumyt
```

## License

MIT — see [LICENSE](LICENSE).
