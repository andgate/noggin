# Noggin Protocol for Modular, Self-Directed Learning

**Author**: Gabriel Anderson
**Date**: January 9, 2025

---

### Introduction

Noggin is a modular, self-directed learning system designed to empower learners to explore and master any subject through a flexible, transparent, and adaptive framework. The system emphasizes simplicity, user autonomy, and the ability to track learning progress through locally stored metadata and structured quizzes.

By integrating with external AI providers for generating outlines, extracting content, and forming quiz questions, Noggin remains lightweight and focused. All metadata—such as quizzes, source materials, and quiz submissions—is stored locally in accessible formats to ensure full user control and observability.

### Purpose and Style of the Protocol Document

This protocol document serves as a comprehensive specification for implementing the Noggin learning system. It outlines the functional and implementation requirements necessary for any application to adhere to the Noggin framework. The document maintains a formal tone, suitable for specification, and provides a clear, structured approach to content organization, user interaction, and data management.

### Core Objectives

1.  **Modular Design**: Organize learning into self-contained modules, each focused on a specific topic, with clear, accessible metadata.
2.  **Transparent Storage**: Store all data—including library metadata, quizzes, lessons, and submissions—in accessible local folders for easy review and full user autonomy.
3.  **User-Driven Learning**: Provide tools to help users track their learning progress while keeping control over what and when to study.
4.  **Simplicity in Implementation**: Focus on straightforward workflows that reduce complexity and empower users to manage their own learning processes effectively.

---

### Core Specifications

The Noggin system uses a hierarchical structure to organize learning content:

- **Libraries** are flexible, top-level containers for organizing learning content
    - Each library can contain multiple learning paths and standalone modules
    - Users can maintain one or multiple libraries based on their organizational preferences
- **Learning Paths** are structured sequences within libraries
    - Each path contains multiple modules in a defined progression
    - Paths help guide learners through related topics systematically
- **Modules** are the fundamental learning units
    - Can exist either within learning paths or as standalone units in a library
    - Each module contains source materials, quizzes, and progress tracking

This three-tier structure provides flexibility while maintaining clear organization: Libraries provide a customizable way to organize content, Learning Paths create structured progressions, and Modules deliver the actual learning material.

#### Libraries

Libraries serve as general-purpose containers for organizing learning content. Each library is a directory containing learning paths, standalone modules, and associated metadata. Users can choose to use a single library for all their content or create multiple libraries to suit their organizational preferences.

#### Library Identification

Each library is uniquely identified by a standard Version 4 UUID (Universally Unique Identifier).

- This `id` is generated when the library is first created and stored within its `.lib/meta.json` file.
- The UUID remains constant throughout the library's lifetime, providing a stable reference.
- This `id` is used for all internal referencing, API calls, and routing (e.g., `/library/view/$libraryId`).
- Example UUID: `f47ac10b-58cc-4372-a567-0e02b2c3d479`

#### Library Structure

```
<library path>/
├── .lib/
│   └── meta.json     # Library metadata and configuration
├── introduction_to_python_1703567451722/  # Learning path using slug with timestamp
├── web_development_basics_1703567489123/  # Another learning path
├── binary_search_trees_1703567512456/    # Standalone module
└── sorting_algorithms_1703567534789/     # Another standalone module
```

#### Library Metadata

The `.lib/meta.json` file contains essential library information:

```json
{
    "name": "Computer Science Fundamentals",
    "description": "Core CS concepts and algorithms",
    "createdAt": 1703567451722,
    "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479"
}
```

#### Library Management

- Libraries maintain a flat structure, with learning paths and standalone modules as direct children
- Multiple libraries can exist simultaneously, allowing flexible organization of content
- Libraries are portable and can be backed up, transferred, or synced between devices
- The practice feed aggregates content from all available libraries

#### Content Organization

Libraries support two types of content organization:

1.  **Standalone Modules**: Independent learning units directly under the library root
2.  **Learning Paths**: Structured sequences of modules with defined progression

This dual approach allows flexibility in content organization while maintaining clear structure when needed.

#### Standalone Modules

- **Definition**: The fundamental unit of learning, encapsulating source materials, quizzes, training material, and tracking data.
- **Functionality**: Can exist independently or within learning paths, with standalone modules being immediately accessible.

---

### Module Structure

A **module** encapsulates source materials, quizzes, training material, and tracking data. The following structure defines a module:

- **Source Materials**: User-provided materials, such as PDFs or text files, stored in the module root.
- **Module Metadata**: Essential static module information stored in `.mod/meta.json`.
- **Module Statistics**: Dynamic usage data stored in `.mod/stats.json`.
- **Quizzes**: A set of structured, static quizzes stored in `.mod/quizzes/`.
- **Quiz Submissions**: Individual quiz attempt records stored in `.mod/submissions/`.
- **Generated Lesson**: Optional AI-generated training material stored in `.mod/lesson.json`.

#### Directory Structure Example:

```
<module_slug>/
├── .mod/
│   ├── meta.json  # Static module information
│   ├── stats.json     # Dynamic usage statistics
│   ├── lesson.json    # Current active lesson
│   ├── quizzes/
│   │   ├── quiz1.json
│   │   ├── quiz2.json
│   ├── submissions/
│   │   ├── submission1.json
│   │   ├── submission2.json
├── source_material.pdf
├── source_notes.txt
```

#### Module Metadata Format (meta.json)

Module metadata stores essential static information about each learning module. This immutable data defines the module's identity and core characteristics, serving as a reference point for the learning system:

```json
{
    "title": "Region-Based Memory Management",
    "slug": "region-based-memory-management-1703567451722",
    "overview": "An exploration of region-based memory management techniques...",
    "createdAt": 1703567451722
}
```

#### Module Statistics Format (stats.json)

Module statistics provide real-time insights into learning progress and engagement patterns. These dynamic metrics are stored in `stats.json` and automatically update as users interact with the module:

```json
{
    "lastAccessed": 1703567489123,
    "reviewCount": 5,
    "quizAttempts": 12,
    "averageScore": 85.5
}
```

The statistics format is implementation-specific, allowing systems to track learning progress according to their chosen methodologies. While basic usage statistics like access times and quiz performance are commonly tracked, the exact structure can be extended to support various spaced repetition algorithms and learning approaches.

Different learning systems may extend this format according to their needs. For instance, systems might add fields to support specific spaced repetition algorithms like SM-2 (tracking intervals and ease factors) or Leitner (tracking box numbers and review dates).

This separation ensures clear distinction between immutable module properties and dynamic usage data that changes as users interact with the module.

#### Learning Paths

Learning paths provide structured progression through multiple modules. Each learning path has its own unique path slug (e.g., `introduction-to-python-1703567451722`) that follows the same naming convention as modules: a URL-friendly name followed by a creation timestamp. This path slug serves as both the directory name and unique identifier for the learning path.

Each learning path maintains its own metadata and progress tracking while preserving the autonomy of individual modules.

#### Learning Path Structure

```
<library path>/introduction_to_python_1703567451722/
├── .path/
│   ├── meta.json        # Learning path configuration
│   └── progress.json    # User progression data
├── python_basics_1703567489123/           # First module in sequence
│   ├── .mod/
│   │   └── ...         # Standard module structure
│   └── source_files
└── control_flow_1703567512456/           # Second module in sequence
    ├── .mod/
    │   └── ...         # Standard module structure
    └── source_files
```

#### Learning Path Metadata

The `.path/meta.json` file defines the learning path configuration:

```json
{
    "title": "Python for Beginners",
    "description": "A structured introduction to Python programming",
    "createdAt": 1703567451722,
    "modules": [
        {
            "slug": "python_basics_1703567489123",
            "title": "Python Basics",
            "unlockRequirements": []
        },
        {
            "slug": "control_flow_1703567512456",
            "title": "Control Flow",
            "unlockRequirements": ["python_basics_1703567489123"]
        }
    ]
}
```

#### Progress Tracking

The `.path/progress.json` file maintains user progression data:

```json
{
    "completedModules": ["module-1"],
    "unlockedModules": ["module-1", "module-2"],
    "currentModule": "module-2",
    "lastAccessed": 1703567489123
}
```

#### Module Unlocking

- Modules within a learning path may have unlock requirements
- Requirements typically include completion of prerequisite modules
- Unlocked modules appear in the practice feed when due for review
- Module completion is determined by quiz performance thresholds

---

### Interactive Learning Components

The protocol supports two primary forms of interactive learning: Lessons and Quizzes.

#### Lessons

Lessons provide structured, interactive guidance through module content. Each module maintains a single active lesson, stored in `.mod/lesson.json`. Lessons consist of Learning Units—sequential combinations of content and comprehension questions.

##### Lesson Structure

```json
{
    "title": "Introduction to Module Content",
    "units": [
        {
            "text": "Content explanation...",
            "questions": [
                {
                    "type": "multipleChoice",
                    "question": "Understanding check...",
                    "options": ["A", "B", "C", "D"],
                    "correctAnswer": "A"
                }
            ],
            "progress": {
                "completed": false,
                "userAnswers": []
            }
        }
    ],
    "progress": {
        "currentUnit": 0,
        "completedUnits": []
    }
}
```

##### Lesson Generation

- Lessons are AI-generated based on module source content
- Users may provide focus instructions to tailor lesson content
- Generating a new lesson replaces any existing lesson
- Users receive a warning before lesson replacement

##### Learning Units

Each Learning Unit contains:

- Text-based explanation or content excerpt
- One or more comprehension questions
- Progress tracking for the unit
- User response storage

##### Question Types

- **Multiple Choice**: Questions with predefined options and a single correct answer
- **Written Response**: Open-ended questions requiring text input

##### Progress Tracking

- Progress is maintained within the lesson.json file
- Tracks completion status of individual units
- Stores user responses for immediate feedback
- Does not contribute to long-term module statistics

##### Lesson Persistence

- Lessons are transient and focus on immediate comprehension
- Only one lesson exists per module at any time
- All state is maintained in the single `lesson.json` file
- Lessons persist until explicitly replaced or deleted

#### Quizzes

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

1.  **Submission Processing**

    - Each submission is evaluated independently
    - Submissions remain in an ungraded state until fully processed
    - All responses receive individualized feedback

2.  **Evaluation Criteria**

    - Each question response receives a binary assessment (pass/fail)
    - Assessment includes detailed, constructive feedback
    - Overall quiz performance is calculated as a percentage of passed responses

3.  **Feedback Mechanism**

    - Learners receive specific feedback for each response
    - Feedback aims to be instructive rather than merely evaluative
    - Comments highlight areas for improvement and reinforce correct understanding

4.  **Grade Representation**
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
    "quizId": "region-based-memory-management-quiz-1703567451722",
    "submissionTimestamp": 1703567489123,
    "attempt": 1,
    "answers": [
        // ... rest of the structure remains the same ...
    ]
}
```

---

### Progress Tracking and Scheduling

Learning progress is tracked through quiz submissions. Each submission represents a record of a user's attempt at a quiz, including answers, scores, and timestamps. Submissions are stored as files in `.mod/submissions/`, ensuring users can review their learning journey at any time.

This approach maintains simplicity while enabling users to observe trends in their performance and mastery over time.

Noggin supports long-term retention through periodic review recommendations. Users are encouraged to revisit modules based on their own priorities and practice schedules.

- **Practice Feed**: Modules are surfaced in the feed based on their relevance or time since last review.
- **User Autonomy**: Recommendations serve as guidance, but users retain full control over what and when to study.

#### Algorithm Support

The protocol provides flexible support for spaced repetition algorithms through a standardized stats tracking mechanism:

- **Module Stats**: Each module can maintain its own statistics in `.mod/stats.json`
- **Algorithm Flexibility**: The protocol is algorithm-agnostic, allowing implementations to use Leitner, SM-2, or custom approaches
- **Local Scope**: Statistics are maintained at the module level, as the protocol doesn't specify global storage locations
- **Implementation Freedom**: While the protocol focuses on module-level tracking, specific implementations may implement their own system-wide storage solutions as needed

The practice feed leverages these statistics to generate intelligent review recommendations while maintaining the user's autonomy in directing their learning journey.

This flexible approach empowers users to manage their learning without imposing strict deadlines or notifications, while still benefiting from proven spaced repetition techniques.

### Simplified Module Updates

Users can freely update the contents of a module by modifying its source files. The system is designed to adapt seamlessly to these changes, reflecting updated content in newly created quizzes. There is no need for complex versioning or tracking—modules evolve naturally as users refine their learning materials.

### Module Creation Workflow

The module creation process follows these specific steps:

1.  **Source Selection**

    - User selects one or more input files (PDFs, text files, etc.)

2.  **Module Generation**

    - File contents are extracted and provided to the AI model
    - AI generates a descriptive module title based on content analysis
    - AI writes a brief overview summarizing the module contents
    - A URL-friendly slug is created from the module title

3.  **Module Storage**
    - User confirms the generated title and overview
    - User selects destination directory for the module
    - System creates a new directory named with the slug in the chosen destination
    - Source files are copied into the new module directory, preserving their original filenames
    - Module metadata (title, overview) is saved

---

### Naming Conventions

The Noggin protocol uses consistent naming conventions across all components to ensure uniqueness and clarity:

#### Slug Format (for Modules and Learning Paths)

Slugs for modules and learning paths follow these rules:

1.  **Basic Transformation**:

    - Trim leading and trailing whitespace
    - Split on whitespace into parts
    - Remove any empty parts
    - For each part:
        - Convert to lowercase
        - Remove all non-alphanumeric characters
    - Join parts with underscores
    - Truncate to 255 characters for filesystem compatibility

2.  **Timestamp Addition**:

    - Modules and learning paths append creation timestamp: `<slug>_<timestamp>`
    - Libraries are identified by a UUID (see Library Identification section) and do not use slugs.
    - Timestamp format: Compact ISO 8601 UTC (e.g., `20250217T021330Z`)
        - Format: `YYYYMMDD'T'HHMMSS'Z'`
        - No separators (dashes, colons)
        - No milliseconds
        - Always UTC timezone (Z suffix)

3.  **Usage Rules**:
    - Applications must prevent creation of duplicate slugs within their scope (modules/paths within a library).
    - Slugs are used for routing modules and learning paths (e.g., `/module/view/binary_search_trees_20250217T021330Z`), while library routes use the library ID (e.g., `/library/view/f47ac10b-58cc-4372-a567-0e02b2c3d479`).
    - Slugs serve as stable identifiers for cross-referencing modules and paths.
    - File paths and directory names for modules and paths use these slugs directly.

Examples (Modules/Paths):

- "C++ & Systems Programming!" -> `c_systems_programming`
- "Web Dev (2024) - Basics" -> `web_dev_2024_basics`
- Module: `binary_search_trees_20250217T021330Z`
- Learning Path: `introduction_to_python_20250217T021330Z`

#### Usage Throughout the System

- **Library IDs (UUIDs)**: Used for unique identification, API calls, and internal referencing.
    - Example: `f47ac10b-58cc-4372-a567-0e02b2c3d479`
- **Learning Path Slugs**: Used for learning path directory names and references.
    - Example: `introduction_to_python_20250217T021330Z`
- **Module Slugs**: Used for module directory names and references.
    - Example: `python_basics_20250217T021330Z`
- **Quiz Slugs**: Used in quiz filenames, combining with attempt numbers for submissions.
    - Quiz file: `python_basics_quiz_20250217T021330Z.json`

### Conclusion

This protocol provides a robust yet flexible framework for building modular, self-directed learning applications. By adhering to these specifications, developers can create systems that empower users with transparent data management, customizable content organization, and effective tools for tracking learning progress. The emphasis on local storage and user autonomy ensures that learners remain in full control of their educational journey.
