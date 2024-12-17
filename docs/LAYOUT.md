# Project Layout

This document outlines the project's directory structure and key components, based on a review of the codebase.

## Main Directories

-   `src/`: Contains all source code for the application.
    -   `src/main/`: Contains the main process code for the Electron application.
        -   `src/main/index.ts`: Entry point for the main process, responsible for creating the main window and setting up the application.
        -   `src/main/ipc/`: Contains files for inter-process communication (IPC) between the main process and the renderer process.
            -   `src/main/ipc/dialog-ipc.ts`: Handles dialog-related IPC.
            -   `src/main/ipc/gemini-ipc.ts`: Handles Gemini API related IPC.
            -   `src/main/ipc/mod-ipc.ts`: Handles module related IPC.
            -   `src/main/ipc/openai-ipc.ts`: Handles OpenAI API related IPC.
            -   `src/main/ipc/store-ipc.ts`: Handles store related IPC.
        -   `src/main/services/`: Contains backend services.
            -   `src/main/services/gemini-service.ts`: Provides services for interacting with the Gemini API.
            -   `src/main/services/mod-service.ts`: Provides services for managing modules.
            -   `src/main/services/openai-service.ts`: Provides services for interacting with the OpenAI API.
    -   `src/preload/`: Contains code that runs in the preload script, providing access to Node.js APIs in the renderer process.
        -   `src/preload/index.ts`: Entry point for the preload script.
    -   `src/renderer/`: Contains the renderer process code for the Electron application (frontend).
        -   `src/renderer/src/`: Contains the source code for the React frontend.
            -   `src/renderer/src/common/`: Contains common utility functions.
                -   `src/renderer/src/common/grading-helpers.ts`: Contains helper functions for grading.
            -   `src/renderer/src/components/`: Contains React components.
                -   `src/renderer/src/components/DefaultCatchBoundary.tsx`: A default error boundary component.
                -   `src/renderer/src/components/DirectoryPicker.tsx`: A component for selecting directories.
                -   `src/renderer/src/components/ModuleExplorer.tsx`: A component for exploring modules.
                -   `src/renderer/src/components/NewModuleWizard.tsx`: A component for creating new modules.
                -   `src/renderer/src/components/NotFound.tsx`: A component for displaying a "not found" message.
                -   `src/renderer/src/components/PracticeFeed.tsx`: A component for displaying practice feeds.
                -   `src/renderer/src/components/RainbowWrapper.tsx`: A component for wrapping content with a rainbow effect.
                -   `src/renderer/src/components/UserSettingsPanel.tsx`: A component for displaying user settings.
            -   `src/renderer/src/hooks/`: Contains React hooks.
                -   `src/renderer/src/hooks/use-generative.tsx`: A hook for generative AI streaming functionality, useful for very large data sets.
                -   `src/renderer/src/hooks/use-grades-generator.tsx`: A hook for generating grades.
                -   `src/renderer/src/hooks/use-module.tsx`: A hook for managing modules.
                -   `src/renderer/src/hooks/use-quiz-generator.tsx`: A hook for generating quizzes.
                -   `src/renderer/src/hooks/use-user-settings.tsx`: A hook for managing user settings.
            -   `src/renderer/src/pages/`: Contains React components for different pages.
                -   `src/renderer/src/pages/DashboardPage.tsx`: The dashboard page.
            -   `src/renderer/src/routes/`: Contains route definitions.
                -   `src/renderer/src/routes/index.tsx`: Defines the main routes.
                -   `src/renderer/src/routes/__root.tsx`: Defines the root layout.
            -   `src/renderer/src/services/`: (Deprecated) Contains frontend services (now mostly replaced by hooks and backend services).
            -   `src/renderer/src/stores/`: Contains application state management.
                -   `src/renderer/src/stores/ui-store.ts`: Manages the UI state.
-   `docs/`: Contains project documentation.

## Key Architectural Points

-   The project uses Electron for building a cross-platform desktop application.
-   The frontend is built with React.
-   The application uses a combination of hooks on the frontend and services/ipc on the backend for data fetching and state management.
-   The backend services interact with external APIs like Gemini and OpenAI.
