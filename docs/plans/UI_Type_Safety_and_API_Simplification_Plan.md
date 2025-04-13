# Noggin Web App - Zod Schema-Driven View Types & API/Route Simplification Plan

**Status:** Revised
**Date:** 2025-04-13

## Goal

Refactor the application to use **Zod schemas as the source of truth for view data structures, deriving type-safe TypeScript types (View Types)**. Simplify data fetching logic by leveraging database relationships and primary keys, and update routing accordingly. This addresses type safety issues and optimizes data flow using a **hybrid fetching strategy** with TanStack Query, fetching data granularly as needed while maintaining a conceptually nested data model (Modules -> Quizzes -> Questions/Submissions -> Responses).

## Phase 1: Define Zod Schemas, View Types & Mappers

1.  **Define Zod Schemas & Derive View Types:**
    *   **Action:** Define core Zod schemas within `src/types/` in separate files (e.g., `src/types/module.types.ts`, `src/types/quiz.types.ts`, etc.). Use clear, concise names (e.g., `moduleSchema`, `quizSchema`).
        *   Schemas **should** define the *complete* potential nested structure for clarity (e.g., `moduleSchema` nesting `quizSchema` arrays, etc.), but API functions will return partially populated objects based on the fetching context (see Phase 2).
            *   `moduleSchema` nests `moduleStatsSchema`, `moduleSourceSchema`, and an array of `quizSchema`.
            *   `quizSchema` nests arrays of `questionSchema` and `submissionSchema`.
            *   `submissionSchema` nests an array of `responseSchema`.
        *   The `questionSchema` **must not** include correct answer information.
        *   The `responseSchema` should be a discriminated union based on grading status (`pending`/`graded`), with grading details included only in the `graded` variant.
    *   **Action:** In each schema file, derive and export the corresponding TypeScript type using `z.infer<typeof ...Schema>` (e.g., `export type Module = z.infer<typeof moduleSchema>;`). Use clear, non-prefixed names (`Module`, `Quiz`, `Question`, etc.). These are the **global View Types**.
    *   **Rationale:** Ensures runtime validation via Zod, provides type safety derived from schemas, decouples views from DB schema, allows view-specific shaping, and defines the target structure for data, even if fetched granularly.

2.  **Implement Mapper Functions:**
    *   **Action:** Create mapper functions within the `src/api/` directory, colocated with the API files they serve. Prefer separate files for clarity (e.g., `src/api/moduleApi.mappers.ts` alongside `src/api/moduleApi.ts`).
    *   **Action:** Implement functions like `mapDbModuleToModule`, `mapDbQuizToQuiz`, etc. These functions take raw DB types and transform them into the corresponding **derived View Types** (`Module`, `Quiz`, etc.). Mappers should handle potentially missing nested data based on the fetching context (e.g., mapping a DB module without quizzes to a `Module` type with an empty `quizzes` array).
    *   **Rationale:** Centralizes the transformation logic between database and view data structures while keeping it close to the relevant API fetching logic.

## Phase 2: Refactor Data Access & Hooks (Hybrid Fetching Strategy)

3.  **Simplify & Update API Layer (`src/api/`)**:
    *   **Action:** Implement API functions supporting the hybrid fetching strategy:
        *   `getModuleList()`: Fetches only essential module data (ID, title, basic stats) for lists/explorer views. Returns `Module[]` (partially populated).
        *   `getModuleDetails(moduleId)`: Fetches a specific module's details, including its list of quizzes (e.g., `Quiz[]` with ID, title). Returns `Module` (partially populated).
        *   `getQuizDetails(quizId)`: Fetches quiz details, including its questions (`Question[]`) and list of submissions (`Submission[]` with ID, attempt, grade). Returns `Quiz` (partially populated).
        *   `getSubmissionDetails(submissionId)`: Fetches submission details, including its responses (`Response[]`). Returns `Submission`.
    *   **Action:** Update Supabase queries to fetch only the necessary data for each function (e.g., use specific `select()` clauses).
    *   **Action:** Ensure API functions use mapper functions (from the colocated mapper files) and return the **derived View Types**, handling partial population gracefully.
    *   **Rationale:** Implements efficient, granular data fetching while providing data in the type-safe format expected by the application.

4.  **Update Hook Layer (`src/hooks/`)**:
    *   **Action:** Refactor/Create custom hooks (`useModuleList`, `useModuleDetails`, `useQuizDetails`, `useSubmissionDetails`, etc.) to call the corresponding granular API functions.
    *   **Action:** Update hooks to expect and return the **derived View Types** (`Module`, `Quiz`, etc.), reflecting the level of detail fetched.
    *   **Action:** Update query keys (`query-keys.ts`) to align with the granular fetching approach (e.g., `moduleKeys.list`, `moduleKeys.detail(moduleId)`, `quizKeys.detail(quizId)`, `submissionKeys.detail(submissionId)`). Remove or adapt keys for overly broad/nested fetches if they no longer apply (e.g., `detailWithDetails`, `detailWithQuestions`, `detailWithResponses` might merge into simpler `detail` keys if the hooks fetch the appropriate level).
    *   **Rationale:** Provides focused data fetching hooks for different view contexts, leveraging TanStack Query's caching per resource.

## Phase 3: Refactor Routing & UI

5.  **Refactor Routes (`src/routes/`)**:
    *   **Action:** Ensure route files use simplified parameters based on primary keys (e.g., `submission.$submissionId.tsx`, `quiz.view.$quizId.tsx`, `module.view.$moduleId.tsx`).
    *   **Action:** Update `createFileRoute` definitions and route loaders (`loader` functions) to use the simplified parameters and call the appropriate *detail* hooks/API functions (e.g., `module.view.$moduleId.tsx` loader calls `ensureQueryData(moduleDetailsQueryOptions(moduleId))`).
    *   **Action:** Update `useParams` usage within route components.
    *   **Rationale:** Creates cleaner route structures aligned with fetching specific resources by ID.

6.  **Refactor UI Components (`src/components/`, `src/pages/`)**:
    *   **Action:** Update component props and internal state to use the **derived View Types** (`Module`, `Quiz`, etc.). Components should handle potentially missing nested data gracefully (e.g., show a loader or placeholder if quiz details haven't been fetched yet within a module view) using optional chaining (`?.`), nullish coalescing (`??`), and conditional rendering.
    *   **Action:** Update components to call the refactored, granular hooks (e.g., `ModulePage` uses `useModuleDetails`, `QuizPage` uses `useQuizDetails`).
    *   **Action:** Update `useNavigate` calls to use the simplified route paths and parameters.
    *   **Action:** Address type errors arising from the use of derived View Types.
    *   **Rationale:** Completes the integration of derived View Types and the hybrid data flow throughout the frontend.

## Phase 4: Verification

7.  **Build & Type Check:**
    *   **Action:** Run `pnpm build` and `pnpm typecheck`.
    *   **Action:** Address any TypeScript errors or build failures.
    *   **Rationale:** Ensures the refactored codebase is type-safe and buildable.

8.  **Basic Functional Testing (Manual):**
    *   **Action:** Manually test core user flows, paying attention to loading states and data availability during navigation.
    *   **Rationale:** Provides initial confirmation that the refactoring didn't break fundamental functionality and that the hybrid fetching works as expected.

## Appendix: Criteria for Colocated View Types

While the primary approach is to use the globally defined View Types derived from Zod schemas in `src/types/`, creating a feature-specific, colocated type (within a component or feature folder) may be justified under specific circumstances. Use these criteria as guidelines:

1.  **Significant Data Reshaping or Aggregation:**
    *   **Justified when:** The component needs a data structure representing a *combination* or *transformation* of data from multiple core entities not easily represented by standard global types (e.g., a dashboard widget combining module, quiz, and submission stats).
    *   **Not Justified when:** The component needs fewer fields than the global type provides (use the global type and access needed fields).

2.  **Dedicated Backend Logic/Endpoint:**
    *   **Justified when:** Fetching the specific data view requires a custom Supabase RPC function or complex backend query with a unique response shape. The colocated type models this unique response.
    *   **Not Justified when:** Data can be fetched using standard API functions returning global View Types.

3.  **Highly Localized and Unique Use Case:**
    *   **Justified when:** The specific data shape is needed *only* for this feature/component and is highly unlikely to be reused, making a global type variation unnecessary clutter (e.g., a complex form's temporary state).
    *   **Not Justified when:** The data view might be useful elsewhere (e.g., a "QuizSummary").

4.  **Significant Simplification Benefit:**
    *   **Justified when:** The component requires **complex, multi-step derivations or transformations** when starting from the global type structure (e.g., multiple nested loops/filters/maps, complex aggregations across nested arrays, non-standard data combinations). Using a colocated type, fetched specifically, makes the component's rendering logic **demonstrably cleaner, more readable, and significantly less prone to errors**.
        *   **Example:** A `ModulePerformanceTrends` component needs to display, for each quiz, the score trend and average time of the *last 5 graded attempts*. Deriving this in the component involves nested filtering, sorting, slicing, and calculations per quiz. A dedicated backend function returning a specific `ModulePerformanceTrendsView` type would significantly simplify the component.
    *   **Not Justified when:** The component's needs are met using standard patterns on the global type (optional chaining, nullish coalescing, simple filters/maps, conditional rendering).
    *   **Core Principle:** The simplification benefit must clearly outweigh the maintenance overhead of the separate colocated type.

## Diagrammatic Overview (Reflecting Hybrid Fetching)

```mermaid
graph LR
    subgraph Initial Load / List Views
        direction LR
        CompList["UI Component (ModuleExplorer, LibraryPage)"] -- Uses --> HookList["Hook (useModuleList)"]
        HookList -- Calls --> APIList["API (getModuleList)"]
        APIList -- Fetches --> DB["Supabase DB (Modules - Basic Info)"]
        DB -- Raw DB Types --> APIList
        APIList -- Maps --> HookList
        HookList -- Provides Module[] (Basic) --> CompList
    end

    subgraph Detail View (e.g., Module)
        direction LR
        CompDetail["UI Component (ModulePage)"] -- Uses --> HookDetail["Hook (useModuleDetails)"]
        HookDetail -- Calls --> APIDetail["API (getModuleDetails)"]
        APIDetail -- Fetches --> DBDetail["Supabase DB (Module + Quiz List)"]
        DBDetail -- Raw DB Types --> APIDetail
        APIDetail -- Maps --> HookDetail
        HookDetail -- Provides Module (w/ Quiz List) --> CompDetail
    end

    subgraph Deeper Detail View (e.g., Quiz)
        direction LR
        CompQuiz["UI Component (QuizPage)"] -- Uses --> HookQuiz["Hook (useQuizDetails)"]
        HookQuiz -- Calls --> APIQuiz["API (getQuizDetails)"]
        APIQuiz -- Fetches --> DBQuiz["Supabase DB (Quiz + Questions + Submissions List)"]
        DBQuiz -- Raw DB Types --> APIQuiz
        APIQuiz -- Maps --> HookQuiz
        HookQuiz -- Provides Quiz (w/ Questions/Submissions) --> CompQuiz
    end

    %% Link phases to general flow
    Phase1["Phase 1: Schemas, Types, Mappers"] --> APIList & APIDetail & APIQuiz
    Phase2["Phase 2: Data Access (API/Hooks)"] --> HookList & HookDetail & HookQuiz
    Phase3["Phase 3: UI & Routing"] --> CompList & CompDetail & CompQuiz
    Phase4["Phase 4: Verification"]

    %% Dependencies
    APIList --> Phase1
    APIDetail --> Phase1
    APIQuiz --> Phase1
    HookList --> Phase2
    HookDetail --> Phase2
    HookQuiz --> Phase2
    CompList --> Phase3
    CompDetail --> Phase3
    CompQuiz --> Phase3
```
