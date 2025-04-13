# UI Refinement Principles & Learnings (Complement to UI_Type_Safety_and_API_Simplification_Plan.md)

**Date:** 2025-04-13

This document captures key principles and learnings derived during the implementation of the Zod Schema-Driven View Types plan. These should be applied consistently throughout the refactoring process.

## Core Principles & Refinement Learnings

1.  **Type Definitions Location:**
    *   All custom type definitions, including Zod schemas, derived View Types (`Module`, `Quiz`, etc.), and specific input/subset types (e.g., `ModuleListItem`, `CreateSubmissionInput`), MUST reside within the `src/types/` directory.
    *   Organize types into appropriate files (e.g., `module.types.ts`, `module-list-item.types.ts`).
    *   Mapper files (`*.mappers.ts`) or API files (`*.api.ts`) MUST import types from `src/types/` and MUST NOT define their own types (except for internal, unexported helper types if absolutely necessary).

2.  **Use `Pick` for Input Types:**
    *   When defining input types for API or hook functions that require only a subset of fields from a larger type (like `TablesInsert`), prefer the `Pick` utility type over `Omit` for clarity and explicitness.
    *   Define these `Pick`ed types in `src/types/`.

3.  **Mapper Responsibilities:**
    *   Mappers (`src/api/*.mappers.ts`) are solely responsible for transforming raw database row objects into their corresponding View Types defined in `src/types/`.
    *   Mappers MUST validate the final mapped object against the relevant Zod schema from `src/types/` using `.parse()` before returning, ensuring runtime type safety.
    *   Mappers should only depend on types (from `src/types/`) and potentially other mapper functions. They MUST NOT import from or depend on API implementation files (`src/api/*.ts`).

4.  **API Function Responsibilities:**
    *   API functions (`src/api/*.ts`) handle fetching raw data from Supabase (using specific `select` clauses where appropriate) and calling the corresponding mapper functions.
    *   API functions MUST return data that fully conforms to the target View Type schema defined in `src/types/`, including any required nested structures (e.g., a `Submission` must include its `responses` array).
    *   Avoid creating API functions that return partially populated View Types where the schema defines required nested data. Fetch all necessary data (potentially through joins or multiple queries) to fulfill the View Type contract before calling the mapper.

5.  **Mapper Call Signatures:**
    *   Ensure that calls to mapper functions precisely match the function's signature.
    *   If a mapper accepts optional arguments (like `dbResponses` in `mapDbSubmissionToSubmission`), the calling code must explicitly provide a value (e.g., `[]` or the actual data) if the mapper requires it for its logic or if the target View Type requires that field.
