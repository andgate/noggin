import { create } from 'zustand'

interface UiState {
    explorerCollapsed: boolean
    toggleExplorer: () => void
    settingsOpen: boolean
    toggleSettings: () => void
}

export const useUiStore = create<UiState>((set) => ({
    explorerCollapsed: false,
    toggleExplorer: () => set((state) => ({ explorerCollapsed: !state.explorerCollapsed })),
    settingsOpen: false,
    toggleSettings: () => set((state) => ({ settingsOpen: !state.settingsOpen })),
}))
