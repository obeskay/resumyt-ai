import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { signInAnonymous, isUserAuthenticated, supabase } from '@/lib/auth'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSignIn = () => {
    if (router) {
      router.push('/auth/signin')
      onClose()
    } else {
      console.warn('Router is not available. Sign-in process cannot be completed.')
    }
  }

  const handleSignUp = () => {
    if (router) {
      router.push('/auth/signup')
      onClose()
    } else {
      console.warn('Router is not available. Sign-up process cannot be completed.')
    }
  }

  const handleContinueAnonymous = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const session = await signInAnonymous()
      if (session) {
        onClose()
      } else {
        setError('Failed to sign in anonymously. Please check your internet connection and try again.')
      }
    } catch (error) {
      setError('An unexpected error occurred while signing in anonymously. Please try again later.')
      console.error('Error signing in anonymously:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const checkAuthState = async () => {
      const isUserAuth = await isUserAuthenticated()
      if (isUserAuth) {
        onClose()
      }
    }

    checkAuthState()
  }, [onClose])

  if (isOpen) {
    return (
      <Dialog open={isOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogDescription>
              You need to be signed in to create a summary
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 mt-4">
            <Button
              onClick={handleContinueAnonymous}
              disabled={isLoading}
              isLoading={isLoading}
            >
              Continue as Anonymous
            </Button>
            {error && <p className="text-error">{error}</p>}
            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={handleSignIn}>
                Sign In
              </Button>
              <Button onClick={handleSignUp}>Sign Up</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return null
}