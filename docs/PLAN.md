# Noggin Supabase Migration Spike Plan

**Project Goal:** Migrate the Noggin application from an Electron-based, local-filesystem architecture to a Supabase-backed web application, focusing initially on setting up the database, core API, hooks, and authentication.

**Current Status (as of 2025-04-10):**
The initial setup is largely complete. Electron has been removed, the Supabase database schema is applied, basic authentication is working, and secure Gemini key handling via Edge Functions is implemented. API and Hook layers for Libraries and Modules are partially done. The next major phase involves completing the remaining API/Hook layers and refactoring the frontend components.

---

**Phase 1: Supabase Foundation & Core Feature Migration**

**Completed Steps:**

1.  **[DONE] Define Database Schema (SQL DDL):**
    *   Created SQL statements defining tables (`user_profiles`, `libraries`, `modules`, `module_stats`, `module_sources`, `learning_paths`, `learning_path_modules`, `quizzes`, `questions`, `submissions`, `responses`).
    *   Used v4 UUID PKs, `timestamptz`, user ownership FKs (with denormalization for RLS), `encrypted_gemini_api_key` (`bytea`), Leitner stats columns.
    *   Defined FK constraints and enabled basic RLS policies.

2.  **[DONE] Setup Supabase Project (Dev):**
    *   Schema applied via Supabase Studio SQL Editor.
    *   Storage bucket `noggin-dev-module-sources` created (assuming policies configured).

3.  **[DONE] Configure Vite Environment:**
    *   Created `.env` (for local dev) and `.env.example` (template).
    *   Updated `src/renderer/src/app/common/supabase-client.ts` to use `import.meta.env`.
    *   Ensured `.env` is in `.gitignore`.
    *   Updated `README.md` with setup instructions.

4.  **[DONE] Electron Removal:**
    *   Removed Electron dependencies and scripts from `package.json`.
    *   Updated Vite config and tsconfigs for standard web app build.
    *   Removed `src/main` and `src/preload` directories (assuming this was done manually or in a previous step not explicitly delegated).

5.  **[DONE] Implement Gemini Edge Functions & Security:**
    *   Defined AES-GCM encryption strategy using `GEMINI_ENCRYPTION_KEY` in Supabase Secrets.
    *   Implemented `/set-gemini-key` Edge Function for encryption.
    *   Implemented `/call-gemini` Edge Function with decryption logic.

6.  **[DONE] Implement Core Authentication UI (Partial):**
    *   Implemented `AuthProvider` and `useAuth` hook.
    *   Created `LoginPage`, `LoginForm`, and `/login` route.
    *   Added basic protected routing logic to `__root.tsx`.
    *   Added Logout functionality to `AppHeader`.
    *   Refactored `useUserSettings` hook (removed local store dependency).

7.  **[DONE] Develop API Layer (Partial):**
    *   Implemented `src/renderer/src/api/libraryApi.ts`.
    *   Implemented `src/renderer/src/api/moduleApi.ts`.

8.  **[DONE] Develop Hook Layer (Partial):**
    *   Implemented `src/renderer/src/hooks/useLibraryHooks.ts`.

**Remaining Steps:**

9.  **[DONE] Develop Hook Layer (Modules):**
    *   Create `src/renderer/src/hooks/useModuleHooks.ts`.
    *   Implement TanStack Query hooks wrapping functions in `moduleApi.ts` (for modules, stats, sources). Include query keys and cache management.

10. **[DONE] Develop API & Hook Layers (Quizzes):**
    *   Create `src/renderer/src/api/quizApi.ts` (CRUD for `quizzes`, `questions`).
    *   Create `src/renderer/src/hooks/useQuizHooks.ts`.

11. **[DONE] Develop API & Hook Layers (Submissions):**
    *   Create `src/renderer/src/api/submissionApi.ts` (CRUD for `submissions`, `responses`).
    *   Create `src/renderer/src/hooks/useSubmissionHooks.ts`.

12. **[DONE] Develop API & Hook Layers (User Settings & Profile):**
    *   Create/Update `src/renderer/src/api/userApi.ts` (fetch/update `user_profiles`, excluding Gemini key).
    *   Create/Update `src/renderer/src/hooks/useUserHooks.ts` (fetch/update profile data).
    *   Implement hook/mutation for calling `/set-gemini-key` Edge Function.

13. **[DONE] Develop API & Hook Layers (Storage):**
    *   Implement functions (e.g., in `moduleApi.ts` or `storageApi.ts`) for uploading files to Supabase Storage and getting URLs.
    *   Implement corresponding hooks/mutations.

14. **[DONE] Develop API & Hook Layers (AI Generation - Edge Functions):**
    *   Implement hooks/mutations to call `/call-gemini` for:
        *   Content Analysis (`analyzeContent`).
        *   Quiz Generation (`generateQuiz`).
        *   Submission Grading (`gradeSubmission`).

15. **[DONE] Develop API & Hook Layers (Practice Feed):**
    *   Implement API function(s) to fetch "due" modules based on `module_stats`.
    *   Implement API function to update `module_stats` after submission.
    *   Create `src/renderer/src/hooks/usePracticeFeedHooks.ts`.

16. **[PARTIALLY DONE] Integrate Core Features into Frontend:**
    *   Refactor components using `window.api.*` to use new hooks.
        *   **Completed:** `ModuleExplorer` and related hooks/components.
        *   **Completed:** Library View route and page.
        *   **Completed:** Module View route and page.
        *   **Completed:** Quiz View route and page.
        *   **Completed:** Quiz Session route and page.
        *   **Completed:** Submission View route and page.
        *   **Completed:** `UserSettingsPanel` (Gemini Key).
        *   **Completed:** `RegisteredLibraryList` & `CreateLibraryModal`.
    *   Update route loaders.
    *   Refactor `DirectoryPicker` for Supabase Storage.
    *   Connect AI components (`CreateModulePage`, `QuizGenerationWizard`, `SubmissionPage`, `useGradesGenerator`) to Edge Function hooks.
    *   **Completed:** Connect `UserSettingsPanel` Gemini key input to `/set-gemini-key` mutation.
    *   Connect user settings persistence (non-Gemini key) to `userApi.ts` hooks.

17. **[PARTIALLY DONE] Authentication UI (Continued):**
    *   **Completed:** Implement basic Signup UI/logic.
    *   (Later) Password Reset.

---

**Original Schema Overview (Mermaid):**

```mermaid
erDiagram
    USERS ||--o{ LIBRARIES : owns
    USERS ||--o{ SUBMISSIONS : creates
    USERS ||--o| USER_PROFILES : has
    LIBRARIES ||--o{ MODULES : contains_standalone
    LIBRARIES ||--o{ LEARNING_PATHS : contains
    LEARNING_PATHS ||--o{ LEARNING_PATH_MODULES : defines_sequence
    MODULES ||--o{ LEARNING_PATH_MODULES : part_of_sequence
    MODULES ||--o{ MODULE_STATS : has_stats
    MODULES ||--o{ MODULE_SOURCES : has_source
    MODULES ||--o{ QUIZZES : contains
    MODULES ||--o{ SUBMISSIONS : relates_to
    QUIZZES ||--o{ QUESTIONS : contains
    QUIZZES ||--o{ SUBMISSIONS : instance_of
    SUBMISSIONS ||--o{ RESPONSES : contains
    QUESTIONS ||--o{ RESPONSES : answers

    USER_PROFILES {
        uuid user_id PK, FK -- references auth.users(id)
        bytea encrypted_gemini_api_key "Encrypted User Key"
        timestamptz created_at
        timestamptz updated_at
        -- Future: plan_type, stripe_customer_id, etc.
    }
    LIBRARIES {
        uuid id PK
        uuid user_id FK
        text name
        text description
        timestamptz created_at
    }
    MODULES {
        uuid id PK
        uuid library_id FK
        uuid user_id FK -- Duplicated for RLS/query simplicity
        text title
        text overview
        jsonb lesson_content
        timestamptz created_at
        timestamptz updated_at
    }
    MODULE_STATS {
        uuid module_id PK, FK
        uuid user_id FK -- Duplicated for RLS/query simplicity
        int current_box
        timestamptz next_review_at
        timestamptz last_reviewed_at
        int review_count
        int quiz_attempts
        numeric average_score
    }
    MODULE_SOURCES {
        uuid id PK
        uuid module_id FK
        uuid user_id FK -- Duplicated for RLS/query simplicity
        text storage_object_path
        text file_name
        text mime_type
        bigint size_bytes
        timestamptz created_at
    }
    LEARNING_PATHS {
        uuid id PK
        uuid library_id FK
        uuid user_id FK -- Duplicated for RLS/query simplicity
        text title
        text description
        timestamptz created_at
    }
    LEARNING_PATH_MODULES {
        uuid path_id PK, FK
        uuid module_id PK, FK
        int sequence_order
        jsonb unlock_requirements
    }
    QUIZZES {
        uuid id PK
        uuid module_id FK
        uuid user_id FK -- Duplicated for RLS/query simplicity
        text title
        int time_limit_seconds
        timestamptz created_at
    }
    QUESTIONS {
        uuid id PK
        uuid quiz_id FK
        text question_type
        text question_text
        jsonb choices "MCQ options/answer"
        text correct_answer_text "Written answer"
        int sequence_order
    }
    SUBMISSIONS {
        uuid id PK
        uuid quiz_id FK
        uuid module_id FK
        uuid user_id FK
        int attempt_number
        timestamptz submitted_at
        int time_elapsed_seconds
        numeric grade_percent
        text letter_grade
        text status
    }
    RESPONSES {
        uuid id PK
        uuid submission_id FK
        uuid question_id FK
        uuid user_id FK -- Duplicated for RLS/query simplicity
        text student_answer_text
        boolean is_correct
        text feedback
        timestamptz graded_at
    }
```

---

**Future Phases:**

*   Implement billing/Stripe integration.
*   Build out the invite system and user tier limits.
*   Address GDPR/legal requirements thoroughly.
*   Develop content sharing features.
*   Refactor CI/CD for Cloudflare Pages deployment.
*   Comprehensive testing (unit, integration, E2E).
