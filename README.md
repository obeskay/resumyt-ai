# ResumYT

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

An AI-powered YouTube video summarizer that extracts key insights from any video quickly and efficiently.

## What it does

- **Automatic transcription** - Extracts audio and generates text from YouTube videos
- - **AI summarization** - Uses multiple AI providers (OpenAI, OpenRouter, DeepSeek) for intelligent summaries
  - - **Multiple formats** - Customizable summary lengths and styles
    - - **Real-time processing** - Live progress tracking during video analysis
      - - **Multi-language support** - Works with videos in various languages
       
        - ## Quick Start
       
        - ### Prerequisites
        - - Node.js 18+
          - - At least one AI provider API key (OpenAI, OpenRouter, or DeepSeek)
            - - YouTube Data API v3 key
             
              - ### Installation
             
              - 1. **Clone and install**
                2. ```bash
                   git clone https://github.com/obeskay/resumyt-ai.git
                   cd resumyt-ai
                   npm install
                   ```

                   2. **Configure environment**
                   3. ```bash
                      cp .env.example .env
                      ```

                      Edit `.env` with your API keys:
                      ```env
                      # Required: At least one AI provider
                      OPENAI_API_KEY=your_key_here
                      OPENROUTER_API_KEY=your_key_here
                      DEEPSEEK_API_KEY=your_key_here

                      # Required: YouTube API
                      NEXT_PUBLIC_YOUTUBE_API_KEY=your_youtube_api_key

                      # Database (Supabase)
                      NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
                      NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
                      ```

                      3. **Run the application**
                      4. ```bash
                         npm run dev
                         ```

                         Open [http://localhost:3000](http://localhost:3000) to start using the tool.

                         ## Features

                         ### Smart Processing
                         - Multiple transcription fallback methods
                         - - Intelligent content preprocessing
                           - - Real-time progress tracking
                            
                             - ### AI Integration
                             - - **Primary**: OpenAI GPT-4 for high-quality summaries
                               - - **Fallback**: OpenRouter for reliability
                                 - - **Efficient**: DeepSeek for fast processing
                                  
                                   - ### User Experience
                                   - - Clean, responsive interface
                                     - - Dark/light theme support
                                       - - Anonymous and authenticated usage
                                         - - Usage quota management
                                          
                                           - ## Technology Stack
                                          
                                           - - **Frontend**: Next.js 14, TypeScript, Tailwind CSS
                                             - - **Backend**: Next.js API routes, Supabase
                                               - - **AI**: OpenAI, OpenRouter, DeepSeek APIs
                                                 - - **Deployment**: Vercel (recommended)
                                                  
                                                   - ## Deployment
                                                  
                                                   - ### Vercel (Recommended)
                                                   - ```bash
                                                     npm run build
                                                     vercel --prod
                                                     ```

                                                     ### Docker
                                                     ```bash
                                                     docker build -t resumyt .
                                                     docker run -p 3000:3000 --env-file .env resumyt
                                                     ```

                                                     ## License

                                                     MIT License - see [LICENSE](LICENSE) file for details.
