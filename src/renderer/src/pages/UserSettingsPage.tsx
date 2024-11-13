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
})

type UserSettingsForm = z.infer<typeof userSettingsSchema>

export function UserSettingsPage() {
    const { settings, setUserSettings } = useUserSettings()

    // Note, we use a memoized form to avoid recreating the form on every render
    const form = useForm<UserSettingsForm>({
        initialValues: {
            openaiApiKey: settings.openaiApiKey || '',
        },
        validate: zodResolver(userSettingsSchema),
    })

    const handleSubmit = useCallback(
        (values: UserSettingsForm) => {
            setUserSettings({ openaiApiKey: values.openaiApiKey })
        },
        [setUserSettings]
    )

    return (
        <Paper maw={600} mx="auto" p="md" withBorder>
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack>
                    <TextInput
                        label="OpenAI API Key"
                        placeholder="sk-1234567890abcdefghijklmnopqrstuvwxyz"
                        {...form.getInputProps('openaiApiKey')}
                    />
                    <Button type="submit" w="fit-content">
                        Save Settings
                    </Button>
                </Stack>
            </form>
        </Paper>
    )
}
