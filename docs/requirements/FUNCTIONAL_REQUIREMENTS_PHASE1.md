# Noggin Web App - Functional Requirements - Phase 1

**Version:** 1.0
**Date:** 2025-04-12
**Status:** Approved
**Related Documents:** `docs/plans/Noggin_Web_App_Phase1_Architecture.md`, `docs/specs/CONCEPTUAL_MODEL_WEB.md`

## 1. Introduction

This document outlines the functional requirements for Phase 1 of the Noggin web application. These requirements define the specific capabilities the application must provide to the user and the system operations necessary to support the initial feature set, focusing primarily on user authentication, module management, and basic navigation as defined in the Phase 1 Architecture (Plan v5.2).

## 2. General Requirements

*   **REQ-GEN-001:** The application MUST be accessible via modern web browsers (Chrome, Firefox, Safari, Edge).
*   **REQ-GEN-002:** The application MUST use HTTPS for all communication.
*   **REQ-GEN-003:** The application MUST provide a responsive user interface adapting to different screen sizes (desktop, tablet).

## 3. User Authentication & Authorization

*   **REQ-AUTH-001:** Users MUST be able to sign up for a new account using an email address and password.
*   **REQ-AUTH-002:** Users MUST be able to log in using their registered email and password.
*   **REQ-AUTH-003:** Users MUST be able to log out of the application.
*   **REQ-AUTH-004:** The system MUST securely store user credentials (handled by Supabase Auth).
*   **REQ-AUTH-005:** All subsequent API requests for user-specific data MUST be authenticated using a valid JWT access token.
*   **REQ-AUTH-006:** Users MUST only be able to access and modify their own data (Modules, Submissions, Stats, etc.). (Enforced by Supabase RLS).

## 4. Application Layout & Navigation (AppShell)

*   **REQ-NAV-001:** The application MUST display a persistent header (`AppShell.Header`).
*   **REQ-NAV-002:** The header MUST display breadcrumb navigation reflecting the user's current location within the application hierarchy (e.g., Home > Browse > Module Title).
*   **REQ-NAV-003:** The header MUST provide access to user settings and a logout action via a user menu.
*   **REQ-NAV-004:** The application MUST display a persistent sidebar (`AppShell.Navbar`).
*   **REQ-NAV-005:** The sidebar MUST contain a "Home" navigation link that navigates the user to the main dashboard/practice feed view.
*   **REQ-NAV-006:** The sidebar MUST contain a "Browse" navigation link that navigates the user to a page displaying all their modules.
*   **REQ-NAV-007:** The sidebar MUST contain the `LibraryExplorerPane` component.

## 5. Library Explorer Pane (`LibraryExplorerPane`)

*   **REQ-LEXP-001:** The `LibraryExplorerPane` MUST display the static title "LIBRARY EXPLORER".
*   **REQ-LEXP-002:** The `LibraryExplorerPane` MUST display a menu (e.g., triple-dot button).
*   **REQ-LEXP-003:** The menu MUST contain an action to initiate the "Create Module" workflow.
*   **REQ-LEXP-004:** The `LibraryExplorerPane` MUST display a scrollable list of all Modules belonging to the authenticated user.
*   **REQ-LEXP-005:** Each item in the list MUST display the Module title.
*   **REQ-LEXP-006:** Clicking a Module title in the list MUST navigate the user to the dedicated view for that Module within the main content area (`AppShell.Main`).

## 6. Home Page (Dashboard / Practice Feed)

*   **REQ-HOME-001:** The application MUST display a Home page when the "Home" navigation link is clicked.
*   **REQ-HOME-002:** The Home page MUST display a "Practice Feed" section.
*   **REQ-HOME-003:** The Practice Feed MUST display relevant Modules based on spaced repetition scheduling data (details of scheduling algorithm TBD, but requires access to `ModuleStats`). *(Initial implementation might show recently accessed or all modules).*

## 7. Browse Page (`LibraryPage`)

*   **REQ-BROWSE-001:** The application MUST display a Browse page when the "Browse" navigation link is clicked.
*   **REQ-BROWSE-002:** The Browse page MUST display all Modules belonging to the authenticated user.
*   **REQ-BROWSE-003:** The Browse page MUST present Modules in a user-friendly format (e.g., cards or a detailed list).
*   **REQ-BROWSE-004:** Clicking on a Module representation on the Browse page MUST navigate the user to the dedicated view for that Module.
*   **REQ-BROWSE-005:** The Browse page SHOULD provide basic search/filtering capabilities for Modules (e.g., filter by title). *(Stretch goal for Phase 1)*.

## 8. Module Management

*   **REQ-MOD-001:** Users MUST be able to initiate the creation of a new Module (via `LibraryExplorerPane` menu).
*   **REQ-MOD-002:** The Module creation process MUST allow the user to provide source material context (details TBD - e.g., text input, file upload).
*   **REQ-MOD-003:** The system (potentially using AI) MUST generate a suggested title and overview based on the source context during creation.
*   **REQ-MOD-004:** The user MUST be able to review and edit the suggested title and overview before finalizing creation.
*   **REQ-MOD-005:** The system MUST save the new Module data (title, overview, sourceContext, userId, createdAt) to the database.
*   **REQ-MOD-006:** The system MUST create an associated initial Lesson for the new Module (details of lesson generation TBD).
*   **REQ-MOD-007:** Users MUST be able to view the details of a selected Module (title, overview) on a dedicated Module page.
*   **REQ-MOD-008:** Users MUST be able to initiate deletion of an existing Module.
*   **REQ-MOD-009:** The system MUST confirm deletion with the user before proceeding.
*   **REQ-MOD-010:** Deleting a Module MUST also delete associated Lessons, Quizzes, Submissions, and Stats.
*   **REQ-MOD-011:** Users MUST be able to initiate editing of an existing Module's title and overview. *(Note: Core sourceContext and associated Quizzes/Lessons remain immutable as per conceptual model).*
*   **REQ-MOD-012:** The system MUST save updates to a Module's title and overview.

## 9. Quiz & Submission Management (Basic Viewing)

*   **REQ-QUIZ-001:** The Module page MUST display a list of Quizzes associated with the Module.
*   **REQ-QUIZ-002:** Users MUST be able to initiate taking a specific Quiz from the Module page.
*   **REQ-QUIZ-003:** The application MUST present the Quiz questions (multiple choice, written response) to the user in a focused interface.
*   **REQ-QUIZ-004:** Users MUST be able to submit their answers for a Quiz attempt.
*   **REQ-QUIZ-005:** The system MUST save the user's answers as a Submission record associated with the User, Quiz, and Module.
*   **REQ-QUIZ-006:** The Module page MUST display a list or summary of past Submissions for the quizzes within that Module.
*   **REQ-QUIZ-007:** Users MUST be able to view the details of a past Submission, including their answers and any available results/feedback.
*   *(Note: Quiz generation, grading, and feedback mechanisms are complex features; Phase 1 focuses on storing submissions and viewing basic data. Generation/Grading might be deferred or simplified initially).*

## 10. Lesson Management (Basic Viewing)

*   **REQ-LESSON-001:** The Module page MUST provide access to the Lesson associated with the Module.
*   **REQ-LESSON-002:** Users MUST be able to view the content (text, questions) of the Lesson units sequentially.
*   *(Note: Lesson generation details and interactive progress tracking within lessons might be simplified or deferred beyond basic viewing in Phase 1).*

## 11. Module Statistics & Spaced Repetition

*   **REQ-STATS-001:** The system MUST create/update a `ModuleStats` record for a user when they first interact with a Module (e.g., view it, attempt a quiz).
*   **REQ-STATS-002:** The system MUST update the `lastAccessed` timestamp in `ModuleStats` upon relevant user interaction.
*   **REQ-STATS-003:** The system MUST update `quizAttempts` and potentially `averageScore` in `ModuleStats` after a quiz submission is processed.
*   **REQ-STATS-004:** The system MUST store and update relevant spaced repetition data (`srsData`) based on quiz performance according to a chosen algorithm (specific algorithm TBD).
*   **REQ-STATS-005:** The Practice Feed (REQ-HOME-003) MUST utilize data from `ModuleStats` (e.g., `srsData` due date) to determine which modules to display.
