import { store } from '@renderer/store'
import { UserSettings } from '@renderer/types/user-settings-types'
import { createContext, useCallback, useContext, useMemo, useState } from 'react'

export interface UserSettingsContext {
    settings: UserSettings
    openaiApiKey?: string
    setUserSettings: (settings: UserSettings) => void
}

const UserSettingsContext = createContext<UserSettingsContext | undefined>(undefined)

export function UserSettingsProvider({ children }: { children: React.ReactNode }) {
    const [userSettings, setUserSettingsState] = useState<UserSettings>(
        store.get('userSettings', {})
    )

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
            value={{ settings: userSettings, openaiApiKey, setUserSettings }}
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
