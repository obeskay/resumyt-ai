'use client'

import { useVideoStore } from '../store/videoStore'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function TranscriptionDisplay() {
  const { transcription, isTranscribing } = useVideoStore()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <Card className="h-full bg-card text-card-foreground">
        <CardHeader>
          <CardTitle>Transcription</CardTitle>
        </CardHeader>
        <CardContent>
          {isTranscribing ? (
            <Skeleton className="w-full h-[200px]" />
          ) : transcription !== '' ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="max-h-[400px] overflow-y-auto"
            >
              {transcription}
            </motion.p>
          ) : (
            <p className="text-muted-foreground">No transcription available</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}