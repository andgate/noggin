import {
  getUserProfile,
  setGeminiApiKey,
  updateUserProfile,
  type DbUserProfile, // Import type from api file
} from '@/core/api/userApi'
import type { TablesUpdate } from '@/shared/types/database.types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { userKeys } from './query-keys'

// --- Exported Hook Input/Context/Result Types ---

export type UpdateUserProfileHookInput = Omit<
  TablesUpdate<'user_profiles'>,
  'user_id' | 'created_at' | 'encrypted_gemini_api_key'
>

export type UpdateUserProfileHookContext = {
  previousProfile: DbUserProfile | undefined
}

export type SetApiKeyHookResult = { message: string } | { error: string }

// --- Hooks ---

/**
 * Hook to fetch the current user's profile.
 */
export const useGetUserProfile = () => {
  return useQuery<DbUserProfile | null, Error>({
    queryKey: userKeys.profile,
    queryFn: getUserProfile,
    staleTime: 1000 * 60 * 15, // 15 minutes stale time
  })
}

/**
 * Hook to update the current user's profile. Includes optimistic updates.
 */
export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient()

  return useMutation<
    DbUserProfile | null,
    Error,
    UpdateUserProfileHookInput,
    UpdateUserProfileHookContext
  >({
    mutationFn: updateUserProfile,
    onMutate: async (updates) => {
      await queryClient.cancelQueries({ queryKey: userKeys.profile })
      const previousProfile = queryClient.getQueryData<DbUserProfile>(userKeys.profile)
      if (previousProfile) {
        queryClient.setQueryData<DbUserProfile>(userKeys.profile, {
          ...previousProfile,
          ...updates,
          updated_at: new Date().toISOString(),
        })
      }
      return { previousProfile }
    },
    onError: (err, _variables, context) => {
      console.error('Error updating user profile:', err)
      if (context?.previousProfile) {
        queryClient.setQueryData(userKeys.profile, context.previousProfile)
      }
      queryClient.invalidateQueries({ queryKey: userKeys.profile })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.profile })
    },
  })
}

/**
 * Hook to set the Gemini API key via the Supabase Edge Function.
 */
export const useSetGeminiApiKey = () => {
  return useMutation<SetApiKeyHookResult, Error, string>({
    mutationFn: setGeminiApiKey,
    onSuccess: (result) => {
      if ('error' in result) {
        console.error('Failed to set Gemini API key:', result.error)
      } else {
        console.log('Gemini API key set successfully:', result.message)
      }
    },
    onError: (error) => {
      console.error('Error calling setGeminiApiKey mutation:', error)
    },
    // No invalidation needed as profile doesn't store the key directly
  })
}
