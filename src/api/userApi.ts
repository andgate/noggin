import { supabase } from '@noggin/app/common/supabase-client'
import type { Tables, TablesUpdate } from '@noggin/types/database.types'

export type DbUserProfile = Tables<'user_profiles'>

/**
 * Fetches the profile for the currently authenticated user.
 */
export const getUserProfile = async (): Promise<DbUserProfile | null> => {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error('Error fetching user:', authError?.message)
      return null
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error) {
      console.error('Error fetching user profile:', error.message)
      return null
    }

    return data
  } catch (err) {
    console.error('Unexpected error fetching user profile:', err)
    return null
  }
}

/**
 * Updates the profile for the currently authenticated user.
 * Excludes user_id, created_at, and encrypted_gemini_api_key.
 */
export const updateUserProfile = async (
  updates: Omit<
    TablesUpdate<'user_profiles'>,
    'user_id' | 'created_at' | 'encrypted_gemini_api_key'
  >
): Promise<DbUserProfile | null> => {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error('Error fetching user for update:', authError?.message)
      return null
    }

    const updatePayload = {
      ...updates,
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .update(updatePayload)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating user profile:', error.message)
      return null
    }

    return data
  } catch (err) {
    console.error('Unexpected error updating user profile:', err)
    return null
  }
}

/**
 * Sets the Gemini API key by calling a Supabase Edge Function.
 */
export const setGeminiApiKey = async (
  apiKey: string
): Promise<{ message: string } | { error: string }> => {
  try {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session) {
      console.error('Error getting session:', sessionError?.message)
      return { error: 'User not authenticated' }
    }

    const accessToken = session.access_token
    const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/set-gemini-key`

    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ apiKey }),
    })

    const result = await response.json()

    if (!response.ok) {
      console.error('Error calling set-gemini-key function:', result.error || response.statusText)
      return { error: result.error || `Function returned status ${response.status}` }
    }

    return { message: result.message || 'API key set successfully' }
  } catch (err) {
    console.error('Unexpected error setting Gemini API key:', err)
    // Check if err is an instance of Error before accessing message
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred'
    return { error: `Unexpected error: ${errorMessage}` }
  }
}
