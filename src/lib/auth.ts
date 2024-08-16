import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

export const isUserAuthenticated = async () => {
  try {
    const { data, error } = await supabase.auth.getSession()
    if (error) {
      console.warn('Error checking authentication:', error)
      return false
    }
    return !!data.session
  } catch (error) {
    console.warn('Error checking authentication:', error)
    return false
  }
}

export const signInAnonymous = async () => {
  try {
    const { data, error } = await supabase.auth.signInAnonymously()
    if (error) {
      console.warn('Error signing in anonymously:', error)
      return null
    }
    return data.session
  } catch (error) {
    console.warn('Error signing in anonymously:', error)
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
