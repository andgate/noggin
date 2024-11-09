import { getUserSettings, updateUserSettings } from '@renderer/services/user-settings-service'
import { UserSettings } from '@renderer/types/user-settings-types'
import { createContext, useCallback, useContext, useEffect, useState } from 'react'

export interface UserSettingsContext {
    settings: UserSettings
    setUserSettings: (settings: UserSettings) => void
}

const UserSettingsContext = createContext<UserSettingsContext | undefined>(undefined)

export function UserSettingsProvider({ children }: { children: React.ReactNode }) {
    const [userSettings, setUserSettingsState] = useState<UserSettings>({})
    const [isLoading, setIsLoading] = useState(true)

    // When we mount, we want to load the user settings
    useEffect(() => {
        // Call an async function to load the settings
        async function loadSettings() {
            const settings = await getUserSettings()
            setUserSettingsState(settings)
            setIsLoading(false)
        }
        loadSettings()
    }, [])

    const setUserSettings = useCallback(
        async (settings: UserSettings) => {
            setUserSettingsState(settings)
            await updateUserSettings(settings)
        },
        [setUserSettingsState]
    )

    return (
        <UserSettingsContext.Provider value={{ settings: userSettings, setUserSettings }}>
            {isLoading ? <div>Loading user settings...</div> : children}
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
