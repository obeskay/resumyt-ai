import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { signIn } from "@/lib/auth"

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await signIn(email, password)
      if (response.error) {
        throw new Error(response.error)
      }
      toast({
        title: 'Success',
        description: 'You have been signed in successfully.',
      })
      // Redirect or perform any additional actions after successful sign-in
    } catch (error) {
      console.error('Sign-in error:', error)
      toast({
        title: 'Error',
        description: 'Failed to sign in. Please check your credentials and try again.',
        variant: 'destructive',
      })
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col space-y-4 w-full max-w-md mx-auto"
    >
      <Input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input
        type="password"
        placeholder="Enter your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button type="submit" className="w-full bg-primary text-primary-foreground">
        Sign In
      </Button>
    </form>
  )
}