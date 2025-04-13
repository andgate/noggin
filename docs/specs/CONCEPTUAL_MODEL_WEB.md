# Noggin Web Application - Conceptual Data Model v1

**Version:** 1.0
**Date:** 2025-04-12
**Status:** Approved
**Related Documents:** `docs/plans/Noggin_Web_App_Phase1_Architecture.md`, `docs/specs/PROTOCOL.md` (Original Desktop)

## 1. Introduction

This document defines the conceptual data model for the Noggin web application. It outlines the core entities, their attributes, relationships, and key principles governing the data structure. This model serves as the foundation for the database schema (Supabase/PostgreSQL) and the API design. It adapts concepts from the original Noggin desktop protocol for a cloud-based environment.

## 2. Core Principles

*   **User-Centric:** All primary data entities (Modules, Collections, Paths, Submissions) belong to a specific authenticated User.
*   **Single Implicit Library:** Users do not manage multiple explicit libraries. All their content resides within their single, implicit personal library space.
*   **Module Immutability:** Once a Module's core content/sources are defined upon creation, they are considered immutable. Changes require creating a new Module. Associated data like Quizzes are also static post-creation. Statistics and Submissions are dynamic.
*   **Database-Backed:** Data is persisted in a relational database (Supabase/PostgreSQL), not directly on the filesystem as JSON files.
*   **UUIDs for Identification:** Core entities (User, Module, Collection, Learning Path, Quiz, Submission) are uniquely identified by standard UUIDs (likely v4 or v7 for database generation).

## 3. Core Entities

### 3.1. User

*   **Description:** Represents an authenticated user of the Noggin application.
*   **Source:** Managed by Supabase Auth.
*   **Key Attributes:**
    *   `id` (UUID): Primary key, provided by Supabase Auth.
    *   `email` (String): User's email address.
    *   Other profile attributes as needed (e.g., `name`, `avatar_url`, settings).
*   **Relationships:**
    *   One User has many Modules.
    *   One User has many Collections (Optional, Deferred Phase 1).
    *   One User has many Learning Paths (Optional, Deferred Phase 1).
    *   One User has many Submissions.
    *   One User has many ModuleStats entries.

### 3.2. Module

*   **Description:** The fundamental, immutable unit of learning content. Encapsulates source material context, generated lessons, quizzes, and tracks user interaction statistics and submissions.
*   **Key Attributes:**
    *   `id` (UUID): Primary key.
    *   `userId` (UUID): Foreign key referencing the User who owns the module.
    *   `title` (String): User-defined or AI-suggested title.
    *   `overview` (String): AI-generated summary of the module content.
    *   `sourceContext` (Text/JSONB): Information about the source material used (e.g., filenames, URLs, text snippets). *Exact structure TBD.*
    *   `createdAt` (Timestamp): When the module was created.
    *   `collectionId` (UUID, Nullable): Foreign key referencing the Collection it belongs to (if any, Deferred Phase 1).
*   **Relationships:**
    *   Belongs to one User.
    *   Optionally belongs to one Collection (Deferred Phase 1).
    *   Can be part of multiple Learning Path Steps (Deferred Phase 1).
    *   Has one Lesson.
    *   Has many Quizzes.
    *   Has many ModuleStats entries (one per user).
    *   Has many Submissions (indirectly via Quizzes).
*   **Note:** Module immutability applies to `title`, `overview`, `sourceContext`, and associated `Quizzes` after creation.

### 3.3. Lesson

*   **Description:** Structured, interactive guidance through module content, typically AI-generated during module creation. Focuses on immediate comprehension.
*   **Key Attributes:**
    *   `id` (UUID): Primary key.
    *   `moduleId` (UUID): Foreign key referencing the Module it belongs to.
    *   `title` (String): Lesson title.
    *   `units` (JSONB): Array of learning units, each containing text content and comprehension questions (multiple choice, written response) with correct answers.
    *   `createdAt` (Timestamp): When the lesson was generated.
*   **Relationships:**
    *   Belongs to one Module (a Module typically has only one active Lesson).
*   **Note on Progress:** User-specific lesson progress (e.g., current unit, completed units, answers) should likely be stored in a separate `UserLessonProgress` table to support potential future multi-user scenarios or lesson reuse, rather than directly modifying the shared `Lesson.units` JSONB. For Phase 1 (single-user focus), this might be simplified, but a separate table is recommended for scalability.

### 3.4. Quiz

*   **Description:** A static set of questions used to assess understanding of a Module's content. Quizzes are generated based on module content and are immutable once created.
*   **Key Attributes:**
    *   `id` (UUID): Primary key.
    *   `moduleId` (UUID): Foreign key referencing the Module it belongs to.
    *   `quizNumber` (Integer): Sequential number indicating generation order within the module (e.g., 1, 2, 3).
    *   `questions` (JSONB): Array of questions, each specifying type (multipleChoice, writtenResponse), question text, options (for MC), and correct answer(s).
    *   `createdAt` (Timestamp): When the quiz was generated.
*   **Relationships:**
    *   Belongs to one Module.
    *   Has many Submissions.

### 3.5. Submission

*   **Description:** Records a user's attempt at completing a specific Quiz.
*   **Key Attributes:**
    *   `id` (UUID): Primary key.
    *   `quizId` (UUID): Foreign key referencing the Quiz attempted.
    *   `userId` (UUID): Foreign key referencing the User who made the submission.
    *   `moduleId` (UUID): Foreign key referencing the Module (for easier querying/aggregation).
    *   `attemptNumber` (Integer): Module-wide attempt number for this user.
    *   `answers` (JSONB): Array storing the user's submitted answers for each question.
    *   `feedback` (JSONB, Nullable): Stores feedback generated for each answer (potentially AI-generated).
    *   `results` (JSONB, Nullable): Stores pass/fail status for each answer and overall score/grade.
    *   `submittedAt` (Timestamp): When the submission was completed.
    *   `gradedAt` (Timestamp, Nullable): When the grading/feedback process was completed.
*   **Relationships:**
    *   Belongs to one Quiz.
    *   Belongs to one User.
    *   Belongs to one Module.

### 3.6. ModuleStats

*   **Description:** Tracks dynamic usage statistics and spaced repetition data for a User's interaction with a Module.
*   **Key Attributes:**
    *   `id` (UUID): Primary key (or composite key of `moduleId`, `userId`).
    *   `moduleId` (UUID): Foreign key referencing the Module.
    *   `userId` (UUID): Foreign key referencing the User.
    *   `lastAccessed` (Timestamp, Nullable): Last time the user interacted with the module/quiz.
    *   `reviewCount` (Integer): Number of review sessions.
    *   `quizAttempts` (Integer): Total number of quiz submissions for this module by the user.
    *   `averageScore` (Float, Nullable): Running average score across submissions.
    *   `srsData` (JSONB, Nullable): Flexible field to store algorithm-specific spaced repetition data (e.g., interval, ease factor, due date, Leitner box).
*   **Relationships:**
    *   Belongs to one Module.
    *   Belongs to one User.
*   **Note:** A unique constraint MUST exist on (`moduleId`, `userId`).

### 3.7. Collection (Deferred in Phase 1 Implementation)

*   **Description:** An optional, user-defined grouping for thematically related Modules and Learning Paths. Collections are flat (cannot contain other Collections).
*   **Key Attributes:**
    *   `id` (UUID): Primary key.
    *   `userId` (UUID): Foreign key referencing the User who owns the collection.
    *   `name` (String): User-defined name for the collection.
    *   `createdAt` (Timestamp): When the collection was created.
*   **Relationships:**
    *   Belongs to one User.
    *   Has many Modules (via `Module.collectionId`).
    *   Has many Learning Paths (via `LearningPath.collectionId`).

### 3.8. Learning Path (Deferred in Phase 1 Implementation)

*   **Description:** A structured, ordered sequence of Modules designed to guide learning.
*   **Key Attributes:**
    *   `id` (UUID): Primary key.
    *   `userId` (UUID): Foreign key referencing the User who owns the path.
    *   `collectionId` (UUID, Nullable): Foreign key referencing the Collection it belongs to (if any).
    *   `title` (String): User-defined title for the path.
    *   `description` (String, Nullable): Optional description.
    *   `createdAt` (Timestamp): When the path was created.
*   **Relationships:**
    *   Belongs to one User.
    *   Optionally belongs to one Collection.
    *   Has many Learning Path Steps.
    *   Has many Learning Path Progress entries (one per user).

### 3.9. Learning Path Step (Deferred in Phase 1 Implementation)

*   **Description:** Defines a single step within a Learning Path, linking to a specific Module and defining its order and prerequisites.
*   **Key Attributes:**
    *   `id` (UUID): Primary key.
    *   `learningPathId` (UUID): Foreign key referencing the Learning Path.
    *   `moduleId` (UUID): Foreign key referencing the Module included in this step.
    *   `stepOrder` (Integer): Defines the sequence within the path.
    *   `unlockPrereqStepIds` (Array of UUIDs, Nullable): List of `LearningPathStep` IDs that must be completed before this step is unlocked.
*   **Relationships:**
    *   Belongs to one Learning Path.
    *   References one Module.
    *   Referenced by Learning Path Progress.

### 3.10. Learning Path Progress (Deferred in Phase 1 Implementation)

*   **Description:** Tracks a specific User's progress through a specific Learning Path.
*   **Key Attributes:**
    *   `id` (UUID): Primary key (or composite key of `learningPathId`, `userId`).
    *   `learningPathId` (UUID): Foreign key referencing the Learning Path.
    *   `userId` (UUID): Foreign key referencing the User.
    *   `completedStepIds` (Array of UUIDs): List of `LearningPathStep` IDs completed by the user.
    *   `unlockedStepIds` (Array of UUIDs): List of `LearningPathStep` IDs currently accessible to the user.
    *   `currentStepId` (UUID, Nullable): The `LearningPathStep` ID the user is currently focused on.
    *   `lastAccessed` (Timestamp, Nullable).
*   **Relationships:**
    *   Belongs to one Learning Path.
    *   Belongs to one User.
*   **Note:** A unique constraint MUST exist on (`learningPathId`, `userId`).
