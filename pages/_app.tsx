import type { AppProps } from 'next/app'
import { ThemeProvider } from 'next-themes'
import { Space_Grotesk } from 'next/font/google'
import '../styles/globals.css'
import { useEffect, useState } from 'react'

const spaceGrotesk = Space_Grotesk({ 
  subsets: ["latin"],
  variable: '--font-space-grotesk',
})

function MyApp({ Component, pageProps }: AppProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <main className={`${spaceGrotesk.variable} font-sans`}>
        <Component {...pageProps} />
      </main>
    </ThemeProvider>
  )
}

export default MyApp