# Noggin Protocol for Modular, Self-Directed Learning

**Author**: Gabriel Anderson
**Date**: December 9, 2024

---

### Introduction

Noggin is a modular, self-directed learning system designed to empower learners to explore and master any subject through a flexible, transparent, and adaptive framework. The system emphasizes simplicity, user autonomy, and the ability to track learning progress through locally stored metadata and structured quizzes.

By integrating with external AI providers for generating outlines, extracting content, and forming quiz questions, Noggin remains lightweight and focused. All metadata—such as quizzes, source materials, and quiz submissions—is stored locally in accessible formats to ensure full user control and observability.

---

### Core Objectives

1. **Modular Design**: Organize learning into self-contained modules, each focused on a specific topic, with clear, accessible metadata.
2. **Transparent Storage**: Store all module data—including quizzes, sources, and submissions—in accessible local folders for easy review and full user autonomy.
3. **User-Driven Learning**: Provide tools to help users track their learning progress through quiz submissions while keeping control over what and when to study.
4. **Simplicity in Implementation**: Focus on straightforward workflows that reduce complexity and empower users to manage their own learning processes effectively.

---

### Module Structure

A **module** is the fundamental unit of learning in Noggin, encapsulating source materials, quizzes, and tracking data. The following structure defines a module:

-   **Source Materials**: User-provided materials, such as PDFs or text files, stored in the module root.
-   **Quizzes**: A set of structured, static quizzes based on the content of the module. Quizzes are stored in the `.mod/quizzes/` folder for easy access and review.
-   **Quiz Submissions**: Individual quiz attempt records are stored as files in `.mod/submissions/`.

#### Directory Structure Example:

```
<module_slug>/
├── .mod/
│   ├── quizzes/
│   │   ├── quiz1.json
│   │   ├── quiz2.json
│   ├── submissions/
│   │   ├── submission1.json
│   │   ├── submission2.json
├── source_material.pdf
├── source_notes.txt
```

This structure ensures that all module-related data is centralized, accessible, and easy to manage.

---

### Quizzes

**Quizzes** are the primary mechanism for assessing and tracking learning progress. Each quiz is tied to the content of its module and is static to maintain consistency in evaluation.

#### Question Types

-   **Multiple Choice**: Questions with four answer options (A-D) and exactly one correct answer.
-   **Written Response**: Open-ended questions requiring users to type their answer.

#### Storage

Quizzes are stored in the `.mod/quizzes/` folder, with each quiz represented as a standalone file containing the questions and metadata (e.g., topics covered, difficulty). Users can attempt quizzes multiple times, with each attempt stored as a submission in `.mod/submissions/`.

---

### Tracking Progress

Learning progress is tracked through quiz submissions. Each submission represents a record of a user's attempt at a quiz, including answers, scores, and timestamps. Submissions are stored as files in `.mod/submissions/`, ensuring users can review their learning journey at any time.

This approach maintains simplicity while enabling users to observe trends in their performance and mastery over time.

---

### Spaced Repetition and Scheduling

Noggin supports long-term retention through periodic review recommendations. Users are encouraged to revisit modules based on their own priorities and practice schedules.

-   **Practice Feed**: Modules are surfaced in the feed based on their relevance or time since last review.
-   **User Autonomy**: Recommendations serve as guidance, but users retain full control over what and when to study.

This flexible approach empowers users to manage their learning without imposing strict deadlines or notifications.

---

### Simplified Module Updates

Users can freely update the contents of a module by modifying its source files. The system is designed to adapt seamlessly to these changes, reflecting updated content in newly created quizzes. There is no need for complex versioning or tracking—modules evolve naturally as users refine their learning materials.

---

### Conclusion

Noggin provides a streamlined, transparent, and modular framework for self-directed learning. Its focus on simplicity, user control, and locally stored data makes it an accessible and powerful tool for mastering any subject.

Key principles of the protocol include:

-   **Flat, Modular Design**: Each module is independent and self-contained.
-   **Simple, Clear Structure**: Organized data storage ensures observability and ease of use.
-   **Practical Learning Tools**: Static quizzes and tracked submissions support effective learning without unnecessary complexity.

The result is a system that adapts to the learner’s needs while maintaining clarity and focus.
