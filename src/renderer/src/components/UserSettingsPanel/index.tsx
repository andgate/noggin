import { Button, Paper, Stack, TextInput } from '@mantine/core'
import { useForm, zodResolver } from '@mantine/form'
import { UserSettings, userSettingsSchema } from '@noggin/types/user-settings-types'
import { useLibrary } from '@renderer/app/hooks/use-library'
import { useUserSettings } from '@renderer/app/hooks/use-user-settings'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { RegisteredLibraryList } from './components/RegisteredLibraryList'

export function UserSettingsPanel() {
    const { settings, setUserSettings } = useUserSettings()
    const { readLibrary } = useLibrary()
    const [_libraries, setLibraries] = useState<Awaited<ReturnType<typeof readLibrary>>[]>([])

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

    const libraryPaths = useMemo(() => settings?.libraryPaths || [], [settings])

    // Load libraries when the library paths change
    useEffect(() => {
        const loadLibraries = async () => {
            if (!libraryPaths?.length) return
            const loadedLibraries = await Promise.all(libraryPaths.map((path) => readLibrary(path)))
            setLibraries(loadedLibraries)
        }
        loadLibraries()
    }, [libraryPaths, readLibrary])

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
