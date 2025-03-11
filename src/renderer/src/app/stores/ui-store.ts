import { Mod } from '@noggin/types/module-types'
import { create } from 'zustand'

interface UiState {
    explorerCollapsed: boolean
    toggleExplorer: () => void
    settingsOpen: boolean
    toggleSettings: () => void
    selectedModule: Mod | null
    setSelectedModule: (module: Mod | null) => void
}

export const useUiStore = create<UiState>((set) => ({
    explorerCollapsed: false,
    toggleExplorer: () => set((state) => ({ explorerCollapsed: !state.explorerCollapsed })),
    settingsOpen: false,
    toggleSettings: () => set((state) => ({ settingsOpen: !state.settingsOpen })),
    selectedModule: null,
    setSelectedModule: (module) => set({ selectedModule: module }),
}))
