import { Button, Paper, Stack, TextInput } from '@mantine/core'
import { useForm, zodResolver } from '@mantine/form'
import { UserSettings, userSettingsSchema } from '@noggin/types/user-settings-types'
import { useUserSettings } from '@renderer/app/hooks/use-user-settings'
import { useCallback } from 'react'
import { RegisteredLibraryList } from './components/RegisteredLibraryList'

export function UserSettingsPanel() {
    const { settings, setUserSettings } = useUserSettings()

    const form = useForm<UserSettings>({
        initialValues: {
            geminiApiKey: settings.geminiApiKey || '',
            libraryPaths: settings.libraryPaths || [],
        },
        validate: zodResolver(userSettingsSchema),
    })

    const handleSubmit = useCallback(
        (values: UserSettings) => {
            setUserSettings(values)
        },
        [setUserSettings]
    )

    return (
        <Paper maw={600} mx="auto" p="md" withBorder>
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack>
                    <TextInput
                        label="Gemini API Key"
                        placeholder="Enter your Gemini API key"
                        {...form.getInputProps('geminiApiKey')}
                    />

                    <RegisteredLibraryList />

                    <Button type="submit" w="fit-content">
                        Save Settings
                    </Button>
                </Stack>
            </form>
        </Paper>
    )
}
