import {
  getUserProfile,
  setGeminiApiKey,
  updateUserProfile,
  type DbUserProfile, // Import type from api file
} from '@noggin/api/userApi'
import type { TablesUpdate } from '@noggin/types/database.types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { userKeys } from './query-keys'

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

  // Define the input type based on the API function, excluding fields not updated
  type UpdateUserProfileInput = Omit<
    TablesUpdate<'user_profiles'>,
    'user_id' | 'created_at' | 'encrypted_gemini_api_key'
  >

  // Context for optimistic updates
  type UpdateUserProfileContext = {
    previousProfile: DbUserProfile | undefined
  }

  return useMutation<DbUserProfile | null, Error, UpdateUserProfileInput, UpdateUserProfileContext>(
    {
      mutationFn: updateUserProfile,
      onMutate: async (updates) => {
        // Cancel outgoing refetches for the user profile
        await queryClient.cancelQueries({ queryKey: userKeys.profile })

        // Snapshot the previous value
        const previousProfile = queryClient.getQueryData<DbUserProfile>(userKeys.profile)

        // Optimistically update to the new value
        if (previousProfile) {
          queryClient.setQueryData<DbUserProfile>(userKeys.profile, {
            ...previousProfile,
            ...updates,
            updated_at: new Date().toISOString(), // Optimistically set updated_at
          })
        }

        // Return a context object with the snapshotted value
        return { previousProfile }
      },
      // If the mutation fails, use the context returned from onMutate to roll back
      onError: (err, _variables, context) => {
        console.error('Error updating user profile:', err)
        if (context?.previousProfile) {
          queryClient.setQueryData(userKeys.profile, context.previousProfile)
        }
        // Invalidate on error to ensure we fetch the correct server state
        queryClient.invalidateQueries({ queryKey: userKeys.profile })
      },
      // Always refetch after error or success to ensure consistency
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: userKeys.profile })
      },
    }
  )
}

/**
 * Hook to set the Gemini API key via the Supabase Edge Function.
 */
export const useSetGeminiApiKey = () => {
  // Define the expected return type from the API function
  type SetApiKeyResult = { message: string } | { error: string }

  return useMutation<SetApiKeyResult, Error, string>({
    mutationFn: setGeminiApiKey,
    onSuccess: (result) => {
      if ('error' in result) {
        console.error('Failed to set Gemini API key:', result.error)
        // Potentially show an error notification to the user here
      } else {
        console.log('Gemini API key set successfully:', result.message)
        // Potentially show a success notification here
      }
    },
    onError: (error) => {
      console.error('Error calling setGeminiApiKey mutation:', error)
      // Potentially show a generic error notification here
    },
    // Optionally invalidate profile query if needed, though the key isn't part of the profile data fetched
    onSettled: () => {
      // Invalidating profile just in case, although not strictly necessary based on current data model
      // queryClient.invalidateQueries({ queryKey: userKeys.profile });
    },
  })
}
