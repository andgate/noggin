# Noggin Protocol for Modular, Self-Directed Learning

**Author**: Gabriel Anderson
**Date**: December 12, 2024

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

- **Source Materials**: User-provided materials, such as PDFs or text files, stored in the module root.
- **Quizzes**: A set of structured, static quizzes based on the content of the module. Quizzes are stored in the `.mod/quizzes/` folder for easy access and review.
- **Quiz Submissions**: Individual quiz attempt records are stored as files in `.mod/submissions/`.

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

- **Multiple Choice**: Questions with four answer options (A-D) and exactly one correct answer.
- **Written Response**: Open-ended questions requiring users to type their answer.

#### Storage

Quizzes are stored in the `.mod/quizzes/` folder, with each quiz saved as a JSON file. The filename follows the pattern:
`<quiz-slug>-<timestamp>.json`

Where:

- `quiz-slug` is a URL-friendly version of the quiz title
- `timestamp` is the Unix timestamp when the quiz was created
- Example: `region-based-memory-management-quiz-1703567451722.json`

This naming scheme ensures unique filenames even when multiple quizzes have similar titles.

Users can attempt quizzes multiple times, with each attempt stored as a submission in `.mod/submissions/`.

### Quiz Submissions and Grading

Quiz submissions undergo a structured evaluation process that maintains the protocol's commitment to clear feedback and self-directed learning:

1. **Submission Processing**

    - Each submission is evaluated independently
    - Submissions remain in an ungraded state until fully processed
    - All responses receive individualized feedback

2. **Evaluation Criteria**

    - Each question response receives a binary assessment (pass/fail)
    - Assessment includes detailed, constructive feedback
    - Overall quiz performance is calculated as a percentage of passed responses

3. **Feedback Mechanism**

    - Learners receive specific feedback for each response
    - Feedback aims to be instructive rather than merely evaluative
    - Comments highlight areas for improvement and reinforce correct understanding

4. **Grade Representation**
    - Numerical grades reflect the percentage of successfully answered questions
    - Letter grades may be provided as an additional reference point
    - Grades serve primarily as progress indicators rather than formal assessments

This grading framework supports the protocol's core objective of facilitating self-directed learning while providing structured feedback for improvement.

#### Submission Storage Format

Submissions are stored as JSON files in `.mod/submissions/` using the following pattern:
`<quiz-slug>-<quiz-timestamp>-<attempt>.json`

Where:

- `quiz-slug` and `quiz-timestamp` match the parent quiz's identifier
- `attempt` is the attempt number (1, 2, 3, etc.)
- Example: `region-based-memory-management-quiz-1703567451722-1.json`

Each submission file contains:

```json
{
    "quiz_id": "region-based-memory-management-quiz-1703567451722",
    "submission_timestamp": 1703567489123,
    "attempt": 1,
    "answers": [
        // ... rest of the structure remains the same ...
    ]
}
```

---

### Tracking Progress

Learning progress is tracked through quiz submissions. Each submission represents a record of a user's attempt at a quiz, including answers, scores, and timestamps. Submissions are stored as files in `.mod/submissions/`, ensuring users can review their learning journey at any time.

This approach maintains simplicity while enabling users to observe trends in their performance and mastery over time.

---

### Spaced Repetition and Scheduling

Noggin supports long-term retention through periodic review recommendations. Users are encouraged to revisit modules based on their own priorities and practice schedules.

- **Practice Feed**: Modules are surfaced in the feed based on their relevance or time since last review.
- **User Autonomy**: Recommendations serve as guidance, but users retain full control over what and when to study.

This flexible approach empowers users to manage their learning without imposing strict deadlines or notifications.

---

### Simplified Module Updates

Users can freely update the contents of a module by modifying its source files. The system is designed to adapt seamlessly to these changes, reflecting updated content in newly created quizzes. There is no need for complex versioning or tracking—modules evolve naturally as users refine their learning materials.

### Module Creation Workflow

The module creation process follows these specific steps:

1. **Source Selection**

    - User selects one or more input files (PDFs, text files, etc.)

2. **Module Generation**

    - File contents are extracted and provided to the AI model
    - AI generates a descriptive module title based on content analysis
    - AI writes a brief overview summarizing the module contents
    - A URL-friendly slug is created from the module title

3. **Module Storage**
    - User confirms the generated title and overview
    - User selects destination directory for the module
    - System creates a new directory named with the slug in the chosen destination
    - Source files are copied into the new module directory, preserving their original filenames
    - Module metadata (title, overview) is saved

---

### Conclusion

Noggin provides a streamlined, transparent, and modular framework for self-directed learning. Its focus on simplicity, user control, and locally stored data makes it an accessible and powerful tool for mastering any subject.

Key principles of the protocol include:

- **Flat, Modular Design**: Each module is independent and self-contained.
- **Simple, Clear Structure**: Organized data storage ensures observability and ease of use.
- **Practical Learning Tools**: Static quizzes and tracked submissions support effective learning without unnecessary complexity.

The result is a system that adapts to the learner’s needs while maintaining clarity and focus.
