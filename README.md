# YouTube Summarizer

This is a Next.js project that allows users to generate summaries of YouTube videos using AI. The application uses the YouTube API to fetch video transcripts or metadata and OpenAI's GPT model to generate summaries.

## Features

- YouTube video summarization
- Automatic transcript fetching with fallback to video metadata
- User-friendly interface with real-time feedback
- Daily usage quota for anonymous users
- Caching system for improved performance
- Error handling and user notifications

## Recent Improvements

- Enhanced error handling in the summarize API route
- Implemented caching for summaries, video transcripts, and metadata
- Improved performance and reliability of video processing
- Added retry logic for API calls to handle temporary failures
- Updated UI to display user's remaining daily quota

## Getting Started

First, set up the environment variables:

1. Create a `.env.local` file in the root directory
2. Add the following variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   YOUTUBE_API_KEY=your_youtube_api_key
   OPENROUTER_API_KEY=your_openrouter_api_key
   ```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `src/app/`: Contains the main application pages and API routes
- `src/components/`: React components used throughout the application
- `src/lib/`: Utility functions and core logic for video processing
- `src/store/`: State management using Zustand
- `src/types/`: TypeScript type definitions

## Technologies Used

- Next.js 13 with App Router
- TypeScript
- Tailwind CSS for styling
- Zustand for state management
- Supabase for database and authentication (prepared for future implementation)
- YouTube API for fetching video data
- OpenAI GPT for generating summaries

## Future Improvements

- Implement user authentication system
- Add a user dashboard for viewing summarization history
- Enhance summary quality and customization options
- Implement comprehensive testing
- Optimize for better accessibility and mobile experience

## Learn More

To learn more about the technologies used in this project, check out the following resources:

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Supabase Documentation](https://supabase.io/docs)

## Deployment

This project can be easily deployed on platforms like Vercel or Netlify. Make sure to set up the environment variables in your deployment platform's settings.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
