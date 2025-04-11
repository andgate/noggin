import { Button, Group, Paper, Stack, TextInput } from '@mantine/core'
import { useSetGeminiApiKey } from '@noggin/hooks/useUserHooks' // Import the new hook
import { useState } from 'react'
import { RegisteredLibraryList } from './components/RegisteredLibraryList'
// Removed: import { useForm, zodResolver } from '@mantine/form';
// Removed: import { UserSettings, userSettingsSchema } from '@noggin/types/user-settings-types';
// Removed: import { useUserSettings } from '@renderer/app/hooks/use-user-settings';
// Removed: import { useCallback } from 'react';

export function UserSettingsPanel() {
  // Removed: const { settings, setUserSettings } = useUserSettings();
  const setGeminiApiKeyMutation = useSetGeminiApiKey() // Use the new hook
  const [apiKeyInput, setApiKeyInput] = useState('') // Local state for the input

  // TODO: Ideally, fetch the current key on mount to pre-fill the input.
  // This requires a `useGetGeminiApiKey` hook which might not exist yet.
  // For now, it starts empty.
  // useEffect(() => {
  //   if (settings.geminiApiKey) { // Assuming settings could be fetched somehow initially
  //     setApiKeyInput(settings.geminiApiKey);
  //   }
  // }, [settings.geminiApiKey]); // Dependency would change based on how initial key is fetched

  // Removed: const form = useForm<UserSettings>(...);
  // Removed: const handleSubmit = useCallback(...);

  const handleSaveApiKey = () => {
    if (!apiKeyInput.trim()) {
      // TODO: Show notification - "API Key cannot be empty"
      console.error('API Key cannot be empty')
      return
    }
    setGeminiApiKeyMutation.mutate(apiKeyInput, {
      onSuccess: () => {
        // TODO: Show success notification
        console.log('Gemini API Key saved successfully!')
      },
      onError: (error) => {
        // TODO: Show error notification
        console.error('Failed to save Gemini API Key:', error)
      },
    })
  }

  return (
    <Paper maw={600} mx="auto" p="md" withBorder>
      {/* Removed: <form onSubmit={form.onSubmit(handleSubmit)}> */}
      <Stack>
        <Group align="flex-end">
          <TextInput
            style={{ flexGrow: 1 }}
            label="Gemini API Key"
            placeholder="Enter your Gemini API key"
            value={apiKeyInput}
            onChange={(event) => setApiKeyInput(event.currentTarget.value)}
            disabled={setGeminiApiKeyMutation.isPending} // Disable input while saving
            // Removed: {...form.getInputProps('geminiApiKey')}
          />
          <Button
            onClick={handleSaveApiKey}
            loading={setGeminiApiKeyMutation.isPending} // Show loading state
            disabled={!apiKeyInput.trim()} // Disable if input is empty
          >
            Save API Key
          </Button>
        </Group>

        <RegisteredLibraryList />

        {/* Removed: Save Settings Button */}
      </Stack>
      {/* Removed: </form> */}
    </Paper>
  )
}
