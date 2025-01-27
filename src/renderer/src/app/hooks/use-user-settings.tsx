import { UserSettings } from '@noggin/types/user-settings-types'
import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { useNogginStore } from './use-noggin-store'

export interface UserSettingsContext {
    settings: UserSettings
    geminiApiKey?: string
    libraryPaths: string[]
    setUserSettings: (settings: UserSettings) => void
    isLoadingUserSettings: boolean
}

const UserSettingsContext = createContext<UserSettingsContext | undefined>(undefined)

const defaultSettings: UserSettings = {
    geminiApiKey: '',
    libraryPaths: [],
}

export function UserSettingsProvider({ children }: { children: React.ReactNode }) {
    const [userSettings, setUserSettingsState] = useState<UserSettings>(defaultSettings)
    const [isLoadingUserSettings, setIsLoading] = useState(true)
    const { getStoreValue, setStoreValue } = useNogginStore()

    useEffect(() => {
        async function loadSettings() {
            try {
                const storedSettings = await getStoreValue('userSettings')
                setUserSettingsState(storedSettings || defaultSettings)
            } catch (error) {
                console.error('Failed to load user settings:', error)
                setUserSettingsState(defaultSettings)
            } finally {
                setIsLoading(false)
            }
        }

        loadSettings()
    }, [getStoreValue])

    const setUserSettings = useCallback(
        (settings: Partial<UserSettings>) => {
            const newSettings = {
                ...userSettings,
                ...settings,
            }
            setUserSettingsState(newSettings)
            setStoreValue('userSettings', newSettings)
        },
        [userSettings, setStoreValue]
    )

    return (
        <UserSettingsContext.Provider
            value={{
                settings: userSettings,
                geminiApiKey: userSettings.geminiApiKey,
                libraryPaths: userSettings.libraryPaths,
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
