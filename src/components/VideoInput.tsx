'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useVideoStore } from '../store/videoStore'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { processVideo } from '@/lib/videoProcessing'
import { supabase } from '@/lib/supabase'
import AuthModal from './AuthModal'

interface VideoInputProps {
  onSuccess: () => void
  session: any
}

export default function VideoInput({ onSuccess, session }: VideoInputProps) {
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const { setVideoUrl, setTranscription, setSummary, setIsTranscribing, setIsSummarizing } = useVideoStore()
  const { toast } = useToast()
  const [userQuotaRemaining, setUserQuotaRemaining] = useState(3)

  useEffect(() => {
    if (session) {
      setIsAuthenticated(true)
      setUserQuotaRemaining(3)
    }
  }, [session])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input) {
      toast({
        title: "Error",
        description: "Please enter a YouTube URL",
        variant: "destructive",
      })
      return
    }

    if (userQuotaRemaining <= 0 && !isAuthenticated) {
      setShowAuthModal(true)
      return
    }

    setIsLoading(true)
    setIsTranscribing(true)
    setIsSummarizing(true)
    try {
      setVideoUrl(input)

      // Save video information to Supabase
      const { data: videoData, error: videoError } = await supabase
        .from('videos')
        .insert({ url: input })
        .select()
        .single()

      if (videoError) throw videoError

      const { transcription, summary } = await processVideo(input, session.user.id, session)
        
      setTranscription(transcription)
      setSummary(summary)

      // Save transcription to Supabase
      const { error: transcriptionError } = await supabase
        .from('transcriptions')
        .insert({ video_id: videoData.id, content: transcription })

      if (transcriptionError) throw transcriptionError

      // Save summary to Supabase
      if (isAuthenticated) {
        const { error: summaryError } = await supabase
          .from('summaries')
          .insert({ video_id: videoData.id, content: summary })

        if (summaryError) throw summaryError
      }
        
      toast({
        title: "Success",
        description: "Video processed and saved successfully!",
      })

      if (userQuotaRemaining > 0) {
        setUserQuotaRemaining(userQuotaRemaining - 1)
      }

      onSuccess()
    } catch (error:any) {
      console.error(error)
      toast({
        title: "Error",
        description: error.message || "Failed to process video. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsTranscribing(false)
      setIsSummarizing(false)
      setInput('')
    }
  }

  return (
    <div>
      <motion.form
        onSubmit={handleSubmit}
        className="flex flex-col space-y-4 w-full max-w-md mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center bg-muted rounded-md p-2">
          <Input
            type="text"
            placeholder="Enter YouTube URL"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="bg-transparent text-foreground placeholder:text-muted-foreground"  
            aria-label="YouTube URL input"
          />
          <img src="/youtube-logo.svg" alt="YouTube logo" className="w-6 h-6 ml-2" />
        </div>
        <div className="flex justify-between items-center">
          {isAuthenticated && (
            <div className="flex items-center space-x-2">
              <div className="text-sm font-semibold text-primary">
                Quota Remaining: {userQuotaRemaining}
              </div>
              <div className="w-24 h-2 bg-muted rounded-full">
                <div className="h-2 bg-primary rounded-full" style={{ width: `${(userQuotaRemaining / 3) * 100}%` }}></div>
              </div>
            </div>
          )}
          {!isAuthenticated && (
            <div className="text-sm text-muted-foreground">
              <span>Need more quota?</span>
              <button 
                className="ml-2 text-primary hover:underline"
                onClick={() => setShowAuthModal(true)}
              >
                Sign in
              </button>
            </div>
          )}
        </div>
        <div className="relative">
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/80 transition-colors text-primary-foreground"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 mr-2 border-2 border-primary-foreground rounded-full border-r-transparent animate-spin"></div>
                <span>Processing...</span>
              </div>
            ) : (
              'Generate Summary'
            )}
          </Button>
        </div>
      </motion.form>
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  )
}