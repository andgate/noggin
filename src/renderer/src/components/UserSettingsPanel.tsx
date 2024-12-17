import { Button, Paper, Stack, TextInput } from '@mantine/core'
import { useForm, zodResolver } from '@mantine/form'
import { UserSettings } from '@noggin/types/user-settings-types'
import { useUserSettings } from '@renderer/hooks/use-user-settings'
import { useCallback } from 'react'
import { z } from 'zod'

export interface UserSettingsProps {
    settings: UserSettings
}

const userSettingsSchema = z.object({
    openaiApiKey: z
        .string()
        .min(1, 'API key is required')
        .startsWith('sk-', 'Invalid OpenAI API key format'),
    geminiApiKey: z.string().optional(),
})

type UserSettingsForm = z.infer<typeof userSettingsSchema>

export function UserSettingsPanel() {
    const { settings, setUserSettings } = useUserSettings()

    const form = useForm<UserSettingsForm>({
        initialValues: {
            openaiApiKey: settings.openaiApiKey || '',
            geminiApiKey: settings.geminiApiKey || '',
        },
        validate: zodResolver(userSettingsSchema),
    })

    const handleSubmit = useCallback(
        (values: UserSettingsForm) => {
            setUserSettings({
                openaiApiKey: values.openaiApiKey,
                geminiApiKey: values.geminiApiKey,
            })
        },
        [setUserSettings]
    )

    return (
        <Paper maw={600} mx="auto" p="md" withBorder>
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack>
                    <TextInput
                        label="OpenAI API Key"
                        placeholder="Enter your OpenAI API key"
                        {...form.getInputProps('openaiApiKey')}
                    />
                    <TextInput
                        label="Gemini API Key"
                        placeholder="Enter your Gemini API key"
                        {...form.getInputProps('geminiApiKey')}
                    />
                    <Button type="submit" w="fit-content">
                        Save Settings
                    </Button>
                </Stack>
            </form>
        </Paper>
    )
}
