import { Modkit } from '@noggin/types/mod-types'
import { createContext, useContext, useState } from 'react'

export type ModkitContextType = {
    modkit: Modkit | null
    setModkit: (modkit: Modkit | null) => void
}

export const ModkitContext = createContext<ModkitContextType>({
    modkit: null,
    setModkit: () => {},
})

export function ModkitProvider({ children }: { children: React.ReactNode }) {
    const [modkit, setModkit] = useState<Modkit | null>(null)

    return <ModkitContext.Provider value={{ modkit, setModkit }}>{children}</ModkitContext.Provider>
}

export function useModkit() {
    return useContext(ModkitContext)
}
