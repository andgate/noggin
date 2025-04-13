import { Button, Group, Paper, Stack, TextInput } from '@mantine/core'
import { useSetGeminiApiKey } from '@noggin/hooks/useUserHooks'
import { useState } from 'react'

export function UserSettingsPanel() {
  const setGeminiApiKeyMutation = useSetGeminiApiKey()
  const [apiKeyInput, setApiKeyInput] = useState('')

  // TODO: Fetch current key on mount

  const handleSaveApiKey = () => {
    if (!apiKeyInput.trim()) {
      console.error('API Key cannot be empty')
      // TODO: Show notification
      return
    }
    setGeminiApiKeyMutation.mutate(apiKeyInput, {
      onSuccess: () => {
        console.log('Gemini API Key saved successfully!')
        // TODO: Show success notification
      },
      onError: (error) => {
        console.error('Failed to save Gemini API Key:', error)
        // TODO: Show error notification
      },
    })
  }

  return (
    <Paper maw={600} mx="auto" p="md" withBorder>
      <Stack>
        <Group align="flex-end">
          <TextInput
            style={{ flexGrow: 1 }}
            label="Gemini API Key"
            placeholder="Enter your Gemini API key"
            value={apiKeyInput}
            onChange={(event) => setApiKeyInput(event.currentTarget.value)}
            disabled={setGeminiApiKeyMutation.isPending}
          />
          <Button
            onClick={handleSaveApiKey}
            loading={setGeminiApiKeyMutation.isPending}
            disabled={!apiKeyInput.trim()}
          >
            Save API Key
          </Button>
        </Group>
      </Stack>
    </Paper>
  )
}
