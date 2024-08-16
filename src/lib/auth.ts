import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createServerComponentClient({ cookies })

export const isUserAuthenticated = async () => {
  try {
    const { data, error } = await supabase.auth.getSession()
    if (error) {
      console.error('Error checking authentication:', error)
      return false
    }

    return !!data.session
  } catch (error) {
    console.error('Error checking authentication:', error)
    return false
  }
}

export const signInAnonymous = async () => {
  try {
    const { data, error } = await supabase.auth.signInAnonymously()
    if (error) {
      console.error('Error signing in anonymously:', error)
      return null
    }

    return data.session
  } catch (error) {
    console.error('Error signing in anonymously:', error)
    return null
  }
}

export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      console.error('Error signing in:', error)
      return null
    }
    return data.session
  } catch (error) {
    console.error('Error signing in:', error)
    return null
  }
}

export const signUp = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    if (error) {
      console.error('Error signing up:', error)
      return null
    }
    return data.session
  } catch (error) {
    console.error('Error signing up:', error)
    return null
  }
}
