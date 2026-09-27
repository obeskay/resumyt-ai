# ResumYT

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

An AI-powered YouTube video summarizer that extracts key insights from any video quickly and efficiently.

## What it does

- **Automatic transcription** — uses the video's YouTube captions, or its metadata when there are none
- **AI summarization** — summaries and chat through OpenRouter, suggested questions through OpenAI
- **Real-time processing** — live progress tracking during video analysis
- **Multi-language support** — works with videos in various languages

## Quick start

### Prerequisites

- Node.js 20.9+
- An OpenRouter API key (summaries, chat) and an OpenAI API key (suggested questions)
- A YouTube Data API v3 key
- A Supabase project (storage, auth and the per-IP quota). Its schema is not in this
  repo: `supabase-setup.md` predates the current tables and the
  `get_or_create_anonymous_user` / `decrement_quota` functions the app calls.

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
you need `OPENROUTER_API_KEY`, `OPENAI_API_KEY`, `NEXT_PUBLIC_YOUTUBE_API_KEY` and the
Supabase pair, which `npm run build` also needs; sign-in also needs the Google OAuth
and NextAuth values.

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

- **Summaries and chat** — OpenRouter
- **Suggested questions** — OpenAI

### User experience

- Clean, responsive interface
- Dark and light themes
- Anonymous and authenticated usage
- Usage quota management

## Technology stack

- **Frontend** — Next.js 16, TypeScript, Tailwind CSS, Radix UI
- **Backend** — Next.js API routes, Supabase
- **AI** — OpenRouter and OpenAI through the `openai` SDK, which also streams the chat
- **Transcripts** — `youtube-transcript` (YouTube captions)

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
