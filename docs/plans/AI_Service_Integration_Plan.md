# Plan: AI Service Integration and Data Flow

**Status:** Proposed
**Date:** 2025-04-13

## Goal

Define the architecture for integrating AI-driven content generation and grading using a dedicated service (`ai-service.ts`), ensuring a clear separation of concerns between AI interaction and database operations. This plan clarifies how raw AI output is handled and transformed before being persisted.

## Phase 1: Implement `ai-service.ts`

1.  **File Creation:** Create `src/services/ai-service.ts`.
2.  **Core Functions:** The service will export an object `aiService` containing the following asynchronous functions:
    *   `analyzeContent(input: AnalyzeContentInput): Promise<AnalyzedContent>`
    *   `generateQuiz(input: GenerateQuizInput): Promise<GeneratedQuiz>`
    *   `gradeSubmission(input: GradeSubmissionInput): Promise<GradedSubmission>`
3.  **Input Types:** Define input types (`AnalyzeContentInput`, `GenerateQuizInput`, `GradeSubmissionInput`) within `ai-service.ts`. These types will only include data necessary for AI context (e.g., text content, configuration, submission data, questions). They will *not* include database IDs unless essential for the AI prompt itself.
4.  **Return Types:** Functions will return promises resolving to the raw, validated data structures defined by Zod schemas in `src/types/analysis-types.ts` and `src/types/quiz-generation-types.ts` (i.e., `AnalyzedContent`, `GeneratedQuiz`, `GradedSubmission`). These return types **will not** contain database IDs.
5.  **Internal Logic:**
    *   Each function constructs the `parts` array for the AI prompt.
    *   Uses `toGeminiSchema` from `src/app/common/gemini-zod.ts` with the corresponding Zod schema (e.g., `analyzedContentSchema`, `generatedQuizSchema`, `gradedSubmissionSchema`) to generate the `geminiSchema` for the `/call-gemini` Edge Function.
    *   Calls an internal `callAiFunction` helper, passing `parts`, `geminiSchema`, and the original *Zod schema* for response validation.
    *   `callAiFunction` handles authentication, calls the Edge Function, and validates the raw JSON response against the provided Zod schema before returning.

## Phase 2: Integrate `aiService` into Components

This phase involves updating components that trigger AI operations.

1.  **Identify Components:**
    *   `src/pages/CreateModule/index.tsx` (uses `analyzeContent`)
    *   `src/components/QuizGenerationWizard.tsx` (uses `generateQuiz`)
    *   Component responsible for triggering grading (e.g., `SubmissionPage` or similar) (uses `gradeSubmission`)
2.  **Integration Steps for Each Component:**
    *   **Import `aiService`:** Import required functions from `src/services/ai-service.ts`.
    *   **Import API Layer Hooks:** Import necessary *mutation* hooks from `src/api/` (e.g., `useCreateModule`, `useCreateQuiz`, `useCreateQuestions`, `useUpdateSubmission`, etc.).
    *   **Local State:** Use `useState` for managing loading/error states specific to the AI call and subsequent database operations.
    *   **Call `aiService`:** Trigger `aiService` functions within event handlers.
    *   **Handle AI Response:**
        *   Receive raw AI-generated data (e.g., `GeneratedQuiz`).
        *   Combine this data with local context (e.g., `moduleId`).
        *   **Transform Data:** Map the combined data into the input format required by the API mutation hooks (e.g., `GeneratedQuiz` -> `CreateQuizInput` + `CreateQuestionInput[]`).
        *   **Call API Mutations:** Trigger the relevant API mutation hooks.
    *   **Manage Flow State:** Handle overall loading state and user feedback (notifications, loading indicators).
    *   **Completion:** Perform final actions (navigation, closing modals) only after *all* steps succeed.

## Example Flow: Quiz Generation (`QuizGenerationWizard.tsx`)

1.  User configures quiz options, clicks "Generate".
2.  Component sets `isGenerating` state to `true`.
3.  Calls `await aiService.generateQuiz(...)`.
4.  `aiService` returns validated `GeneratedQuiz` data.
5.  Component receives `GeneratedQuiz`, sets `isGenerating` to `false`, shows preview.
6.  User clicks "Save Quiz".
7.  Component sets `isSaving` state to `true`.
8.  Calls `createQuizMutation.mutate(...)` with title and `moduleId`.
9.  `onSuccess` of `createQuizMutation`:
    *   Receives `newQuiz` (with `quizId`).
    *   Transforms `GeneratedQuiz` questions into `CreateQuestionInput[]`.
    *   Calls `createQuestionsMutation.mutate({ quizId: newQuiz.id, questionsData: ... })`.
10. `onSuccess` of `createQuestionsMutation`:
    *   Sets `isSaving` to `false`.
    *   Shows success notification.
    *   Calls `onComplete` prop.
11. Errors from `aiService` or mutations are caught and handled appropriately.

## Diagram: Data Flow (Quiz Generation Example)

```mermaid
sequenceDiagram
    participant User
    participant Comp [QuizGenerationWizard]
    participant AISvc [aiService.ts]
    participant EdgeFn [/call-gemini]
    participant Gemini [Google Gemini API]
    participant QuizAPI [quizApi.ts]
    participant DB [Supabase DB]

    User->>Comp: Configure & Click Generate
    Comp->>Comp: Set isGenerating = true
    Comp->>AISvc: generateQuiz(input)
    AISvc->>EdgeFn: Request with parts & geminiSchema
    EdgeFn->>Gemini: Generate Content Request
    Gemini-->>EdgeFn: Raw JSON Response
    EdgeFn-->>AISvc: Raw JSON Response
    AISvc->>AISvc: Validate response with Zod (generatedQuizSchema)
    AISvc-->>Comp: Return Promise<GeneratedQuiz>
    Comp->>Comp: Receive GeneratedQuiz, Set isGenerating = false
    Comp->>User: Show Preview

    User->>Comp: Click Save Quiz
    Comp->>Comp: Set isSaving = true
    Comp->>QuizAPI: createQuizMutation.mutate({ moduleId, title })
    QuizAPI->>DB: INSERT INTO quizzes
    DB-->>QuizAPI: Return new DbQuiz (with ID)
    QuizAPI-->>Comp: onSuccess (newQuiz)
    Comp->>Comp: Transform GeneratedQuestions -> CreateQuestionInput[]
    Comp->>QuizAPI: createQuestionsMutation.mutate({ quizId, questionsData })
    QuizAPI->>DB: INSERT INTO questions
    DB-->>QuizAPI: Return new DbQuestions
    QuizAPI-->>Comp: onSuccess (newQuestions)
    Comp->>Comp: Set isSaving = false
    Comp->>User: Show Success Notification / Call onComplete
