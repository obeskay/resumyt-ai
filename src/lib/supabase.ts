import { createClient, User } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function getOrCreateAnonymousUser(ip: string): Promise<User | null> {
  console.log('Attempting to get or create anonymous user for IP:', ip)

  try {
    // Check if a user with this IP already exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('anonymous_users')
      .select('*')
      .eq('ip_address', ip)
      .single()

    if (fetchError) {
      console.error('Error fetching user:', fetchError)
      console.error('Error details:', JSON.stringify(fetchError, null, 2))
      if (fetchError.code !== 'PGRST116') {
        throw new Error('Failed to fetch user')
      }
    }

    if (existingUser) {
      console.log('Existing user found:', existingUser)
      return {
        id: existingUser.id,
        ip_address: existingUser.ip_address,
        transcriptions_used: existingUser.transcriptions_used || 0
      } as User
    }

    console.log('No existing user found. Attempting to create a new anonymous user.')

    // If no user exists, create a new anonymous user
    let retries = 3
    while (retries > 0) {
      const { data: newUser, error: createError } = await supabase
        .from('anonymous_users')
        .insert({ ip_address: ip, transcriptions_used: 0 })
        .select()
        .single()

      if (createError) {
        console.error('Error creating anonymous user:', createError)
        console.error('Error details:', JSON.stringify(createError, null, 2))
        retries--
        if (retries === 0) {
          throw new Error('Failed to create new user after multiple attempts')
        }
      } else {
        console.log('New user created:', newUser)
        return {
          id: newUser.id,
          ip_address: newUser.ip_address,
          transcriptions_used: newUser.transcriptions_used || 0
        } as User
      }
    }
  } catch (error) {
    console.error('Unexpected error in getOrCreateAnonymousUser:', error)
    return null
  }

  return null
}

export async function getAnonymousUserByIp(ip: string): Promise<User | null> {
  console.log('Attempting to get anonymous user for IP:', ip)

  try {
    const { data: user, error } = await supabase
      .from('anonymous_users')
      .select('*')
      .eq('ip_address', ip)
      .single()

    if (error) {
      console.error('Error fetching anonymous user:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      return null
    }

    console.log('User found:', user)
    return {
      id: user.id,
      ip_address: user.ip_address,
      transcriptions_used: user.transcriptions_used || 0
    } as User
  } catch (error) {
    console.error('Unexpected error in getAnonymousUserByIp:', error)
    return null
  }
}

export async function testSupabaseConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase.from('anonymous_users').select('count').single()
    if (error) throw error
    console.log('Supabase connection test successful. Row count:', data.count)
    return true
  } catch (error) {
    console.error('Supabase connection test failed:', error)
    return false
  }
}