# Task: Migrate Noggin Codebase to Align with Updated Specifications

**Goal:** Refactor the Noggin application code to implement the changes recently finalized in the specification documents:

- @/docs/specs/PROTOCOL.md
- @/docs/specs/FEATURES.md
- @/docs/specs/DESIGN.md
  This involves updating internal data structures, filesystem interactions, entity identification, and related workflows.

**Key Migration Areas:**

1.  **Internal Identification (UUID v6):**

    - Replace existing identification mechanisms (e.g., slugs, timestamps) with UUID v6 for Libraries, Modules, Quizzes, and Submissions.
    - Update all internal data structures, state management, API calls, and cross-referencing logic to use these UUIDs as the primary identifiers.
    - Ensure UUIDs are correctly generated and stored in the respective metadata files (`.lib/meta.json`, `.mod/meta.json`) or JSON data (Quizzes, Submissions).
    - Remove UUID usage for Lessons.

2.  **Filesystem Naming and Structure:**

    - **Libraries:** Implement creation logic where the user provides a name (validated for filesystem safety) and selects a parent directory. Ensure the target directory `[parent directory]/[library name]` is checked for non-existence or emptiness before creation.
    - **Modules:** Refactor creation logic to use the user-validated title directly as the folder name. Implement validation for filesystem safety and uniqueness within the parent library. Remove any slug generation/storage/usage. Update loading/discovery logic.
    - **Quizzes:** Ensure quiz generation creates files named `quiz_N.json` additively. Update quiz loading/referencing logic.
    - **Submissions:** Implement saving submissions as `submission_N.json`, using a module-wide attempt counter. Update submission loading/referencing logic.

3.  **Metadata Updates:**

    - Adjust the structure of `.lib/meta.json`, `.mod/meta.json`, quiz JSON, and submission JSON to reflect the use of UUIDs and the removal of redundant fields (like slugs).

4.  **Generation Workflows:**

    - Ensure quiz generation logic correctly adds new `quiz_N.json` files without overwriting existing ones.

5.  **UI/UX Adjustments:**

    - Update the Practice Feed's "Start Quiz" button functionality to link to the _most recently taken_ quiz for the module.
    - Ensure UI elements related to entity creation/naming reflect the new validation requirements (filesystem safety, uniqueness checks).
    - Update any displays or context menus that previously showed slugs or incorrect identifiers to use UUIDs or correct names where appropriate.

6.  **Code Cleanup:**
    - Remove obsolete functions or utilities related to slug generation, timestamp appending, and old filesystem naming conventions.
    - Refactor routing or internal linking logic that previously relied on slugs.

**Note:** This migration does not need to consider ANY potential impacts on existing user data. This is prototype software without users, so we must take advantage of this situation.

## Relevant Source files

### Types

@/src/types/electron-types.ts
@/src/types/library-types.ts
@/src/types/user-settings-types.ts
@/src/types/store-types.ts
@/src/types/quiz-types.ts
@/src/types/quiz-generation-types.ts

### Electron Services

@/src/main/services/library-service/index.ts
@/src/main/services/library-service/library-registry.ts
@/src/main/services/library-service/library-service.spec.ts
@/src/main/services/library-service/library-service.ts
@/src/main/services/library-service/types.ts
@/src/main/services/library-service/utils.ts
@/src/main/services/module-service
@/src/main/services/module-service/index.ts
@/src/main/services/module-service/module-core-service.spec.ts
@/src/main/services/module-service/module-core-service.ts
@/src/main/services/module-service/module-discovery-service.spec.ts
@/src/main/services/module-service/module-discovery-service.ts
@/src/main/services/module-service/module-quiz-service.spec.ts
@/src/main/services/module-service/module-quiz-service.ts
@/src/main/services/module-service/module-stats-service.spec.ts
@/src/main/services/module-service/module-stats-service.ts
@/src/main/services/module-service/module-submission-service.spec.ts
@/src/main/services/module-service/module-submission-service.ts
@/src/main/services/gemini-service.ts
@/src/main/services/generate-service.ts
@/src/main/services/openai-service.ts
@/src/main/services/practice-feed-service.spec.ts
@/src/main/services/practice-feed-service.ts
@/src/main/services/store-service.ts

### Electron IPC and Bridge

@/src/preload/index.ts
@/src/main/ipc/filesystem-ipc.ts
@/src/main/ipc/gemini-ipc.ts
@/src/main/ipc/generate-ipc.ts
@/src/main/ipc/library-ipc.ts
@/src/main/ipc/module-explorerer-ipc.ts
@/src/main/ipc/module-ipc.ts
@/src/main/ipc/openai-ipc.ts
@/src/main/ipc/practice-feed-ipc.ts
@/src/main/ipc/store-ipc.ts

### Hooks

@/src/renderer/src/app/hooks/library/use-delete-library.ts
@/src/renderer/src/app/hooks/library/use-read-all-libraries.ts
@/src/renderer/src/app/hooks/library/use-read-library.ts
@/src/renderer/src/app/hooks/library/use-save-library.ts
@/src/renderer/src/app/hooks/query-keys.ts
@/src/renderer/src/app/hooks/use-grades-generator.tsx
@/src/renderer/src/app/hooks/use-module.tsx
@/src/renderer/src/app/hooks/use-noggin-store.tsx
@/src/renderer/src/app/hooks/use-practice-feed.tsx
@/src/renderer/src/app/hooks/use-quiz-generator.tsx
@/src/renderer/src/app/hooks/use-user-settings.tsx

### Renderer Stores

@/src/renderer/src/app/stores/ui-store.spec.ts
@/src/renderer/src/app/stores/ui-store.ts

### Routes

@/src/renderer/src/routes/library/view.$libraryId.tsx
@/src/renderer/src/routes/module
@/src/renderer/src/routes/module/create.tsx
@/src/renderer/src/routes/module/view.$libraryId.$moduleId.tsx
@/src/renderer/src/routes/quiz
@/src/renderer/src/routes/quiz/session.$libraryId.$moduleId.$quizId.tsx
@/src/renderer/src/routes/quiz/view.$libraryId.$moduleId.$quizId.tsx
@/src/renderer/src/routes/__root.tsx
@/src/renderer/src/routes/index.tsx
@/src/renderer/src/routes/submission.$libraryId.$moduleId.$quizId.$attempt.tsx

### Components

(To many to list)

For now, only focus on migrating the types and the node process to the new id-based system. We can use the typechecker to figure out what else needs to be changed.

# v0.9.x release

- Implement libraries (almost done)
- Bring test coverage to 70% or higher
    - playwright is broken with electron-vite setup
- Can't manage libraries in settings?
- Deleting modules doesn't work properly
- Module objects contain an id (which is the slug) and a metadata object (which also has the slug). We should only have one slug.
    - Maybe should just remove the id from the module object?
- App Main Header should be shared and consistent across all pages
    - Hidden for certain pages, such as quiz session pages
    - AppLayout should be a shared component
    - AppLayout should have a hook (useAppLayout) that allows page components to configure the layout
- Ensure all pages have a consistent layout and styling
- Refine the style, add a theme picker in settings
- Quizzes are currently not timed
- Does the practice feed actually work? Needs more testing and probably more control over suggestions (like delay, ignore, etc.)
- Ensure modules detect changes to their source files and update accordingly (e.g the ui should notify the user and the module should be marked for review and show up in the practice feed)
- Update the README

- clicking on a filepath should open it. Right clicking on the file path should allow us to copy
- On the module page, plus botton next to quizzes title
    - plus button opens a dropdown menu with options like "create new quiz", "open last quiz", "edit quizzes"
    - Delete should be more difficult to access, so it should be accessible in an "edit mode" for the list of quizzes
    - How do you exit the edit mode?
- Should be able to change quiz or module titles
- Different view modes for quizzes (cards or list)

    - Is card grid actually good UX for the human brain?

- Bug when deleting a quiz
    - When clicking delete, after deletion, the list of quiz doesn't update.
    - After deleting a quiz, it's submissions are still accessible.
        - But the quiz tied to them no longer exists! This breaks the "back to quiz" backlink on the submission page.

Okay, here is a draft prompt you can use for a new task to initiate the code migration:

# v1.0.x release

- Implement learning paths
- Implement generative lessons
