import { UserSettings } from '@noggin/types/user-settings-types'
import { store } from '@renderer/services/electron-store-service'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

export interface UserSettingsContext {
    settings: UserSettings
    openaiApiKey?: string
    setUserSettings: (settings: UserSettings) => void
    isLoadingUserSettings: boolean
}

const UserSettingsContext = createContext<UserSettingsContext | undefined>(undefined)

export function UserSettingsProvider({ children }: { children: React.ReactNode }) {
    const [userSettings, setUserSettingsState] = useState<UserSettings>({ openaiApiKey: undefined })
    const [isLoadingUserSettings, setIsLoading] = useState(true)

    useEffect(() => {
        async function loadSettings() {
            try {
                const storedSettings = await store.get('userSettings')
                setUserSettingsState(storedSettings)
            } catch (error) {
                console.error('Failed to load user settings:', error)
                // Do nothing, continue on with the default settings
            } finally {
                setIsLoading(false)
            }
        }

        loadSettings()
    }, [])

    const openaiApiKey = useMemo(
        () => userSettings.openaiApiKey || import.meta.env.VITE_OPENAI_API_KEY || undefined,
        [userSettings]
    )

    const setUserSettings = useCallback(
        (settings: UserSettings) => {
            setUserSettingsState(settings)
            store.set('userSettings', settings)
        },
        [setUserSettingsState]
    )

    return (
        <UserSettingsContext.Provider
            value={{
                settings: userSettings,
                openaiApiKey,
                setUserSettings,
                isLoadingUserSettings,
            }}
        >
            {children}
        </UserSettingsContext.Provider>
    )
}

export function useUserSettings(): UserSettingsContext {
    const context = useContext(UserSettingsContext)
    if (!context) {
        throw new Error('useUserSettings must be used within a UserSettingsProvider')
    }
    return context
}
