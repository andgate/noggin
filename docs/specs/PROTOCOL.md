# Noggin Protocol for Modular, Self-Directed Learning

**Author**: Gabriel Anderson
**Date**: April 10, 2025

---

### Introduction

Noggin is a modular, self-directed learning system designed to empower learners to explore and master any subject through a flexible, transparent, and adaptive framework. The system emphasizes simplicity, user autonomy, and the ability to track learning progress through locally stored metadata and structured quizzes.

By integrating with external AI providers for generating outlines, extracting content, and forming quiz questions, Noggin remains lightweight and focused. All metadata—such as quizzes, source materials, and quiz submissions—is stored locally in accessible formats to ensure full user control and observability.

### Purpose and Style of the Protocol Document

This protocol document serves as a comprehensive specification for implementing the Noggin learning system. It outlines the functional and implementation requirements necessary for any application to adhere to the Noggin framework. The document maintains a formal tone, suitable for specification, and provides a clear, structured approach to content organization, user interaction, and data management.

### Core Objectives

1.  **Modular Design**: Organize learning into self-contained modules, each focused on a specific topic, with clear, accessible metadata. Modules are immutable once created.
2.  **Transparent Storage**: Store all data—including library metadata, quizzes, lessons, and submissions—in accessible local folders using user-friendly names for easy review and full user autonomy.
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
    - Modules are **immutable** once created.

This three-tier structure provides flexibility while maintaining clear organization: Libraries provide a customizable way to organize content, Learning Paths create structured progressions, and Modules deliver the actual learning material.

#### Libraries

Libraries serve as general-purpose containers for organizing learning content. Each library is a directory containing learning paths, standalone modules, and associated metadata. Users can choose to use a single library for all their content or create multiple libraries to suit their organizational preferences.
When creating a library, the user provides a name (validated for filesystem safety) and selects an existing parent directory. The system checks if the target directory `[parent directory]/[library name]` either does not exist or is empty before creating it.

#### Library Identification

Each library is uniquely identified by a standard Version 6 UUID (Universally Unique Identifier).

- This `id` is generated when the library is first created and stored within its `.lib/meta.json` file.
- The UUID remains constant throughout the library's lifetime, providing a stable reference.
- This `id` is used for all internal referencing and API calls.
- Example UUID: `f47ac10b-58cc-4372-a567-0e02b2c3d479`

#### Library Structure

```
<library path>/
├── .lib/
│   └── meta.json     # Library metadata (contains UUID) and configuration
├── Introduction to Python/  # Learning path using user-validated name
├── Web Development Basics/  # Another learning path
├── Binary Search Trees/    # Standalone module using user-validated name
└── Sorting Algorithms/     # Another standalone module
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
Modules are **immutable** once created; their source content cannot be changed. If modifications are needed, a new module must be created.

- **Source Materials**: User-provided materials, such as PDFs or text files, stored in the module root.
- **Module Metadata**: Essential static module information stored in `.mod/meta.json`.
- **Module Statistics**: Dynamic usage data stored in `.mod/stats.json`.
- **Quizzes**: A set of structured, static quizzes stored in `.mod/quizzes/`.
- **Quiz Submissions**: Individual quiz attempt records stored in `.mod/submissions/`.
- **Generated Lesson**: AI-generated training material, created alongside the module, stored in `.mod/lesson.json`.

#### Directory Structure Example:

```
<module_name>/ # Directory uses the user-validated module name
├── .mod/
│   ├── meta.json      # Static module information
│   ├── stats.json     # Dynamic usage statistics
│   ├── lesson.json    # Current active lesson
│   ├── quizzes/
│   │   ├── quiz_1.json
│   │   ├── quiz_2.json
│   ├── submissions/ # Contains submissions for quizzes in this module
│   │   ├── submission_1.json
│   │   ├── submission_2.json # Example submission filenames
│   ├── source_material.pdf
│   ├── source_notes.txt
```

#### Module Metadata Format (meta.json)

Module metadata stores essential static information about each learning module. This immutable data defines the module's identity and core characteristics, serving as a reference point for the learning system:
Each module is uniquely identified by a standard Version 6 UUID stored in the `id` field.

```json
{
    "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
    "title": "Region-Based Memory Management",
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

Learning paths provide structured progression through multiple modules. Each learning path is uniquely identified by a Version 6 UUID and uses a user-validated name for its directory.
Each learning path maintains its own metadata (including its UUID) and progress tracking while preserving the autonomy of individual modules.

#### Learning Path Structure

```
<library path>/Introduction to Python/
├── .path/
│   ├── meta.json        # Learning path configuration
│   └── progress.json    # User progression data
├── Python Basics/       # First module in sequence
│   ├── .mod/
│   │   └── ...
│   └── source_files
└── Control Flow/        # Second module in sequence
    ├── .mod/
    │   └── ...
    └── source_files
```

#### Learning Path Metadata

The `.path/meta.json` file defines the learning path configuration:

```json
{
    "id": "b2c3d4e5-f6a7-8901-2345-67890abcdef0",
    "title": "Python for Beginners",
    "description": "A structured introduction to Python programming",
    "createdAt": 1703567451722,
    "modules": [
        {
            "moduleId": "a1b2c3d4-e5f6-7890-1234-567890abcdef", // UUID of "Python Basics" module
            "title": "Python Basics", // Stored for display convenience
            "unlockRequirements": []
        },
        {
            "moduleId": "c3d4e5f6-a7b8-9012-3456-7890abcdef01", // UUID of "Control Flow" module
            "title": "Control Flow",
            "unlockRequirements": ["a1b2c3d4-e5f6-7890-1234-567890abcdef"] // Depends on "Python Basics" UUID
        }
    ]
}
```

#### Progress Tracking

The `.path/progress.json` file maintains user progression data:

```json
{
    "completedModules": ["a1b2c3d4-e5f6-7890-1234-567890abcdef"],
    "unlockedModules": [
        "a1b2c3d4-e5f6-7890-1234-567890abcdef",
        "c3d4e5f6-a7b8-9012-3456-7890abcdef01"
    ],
    "currentModule": "c3d4e5f6-a7b8-9012-3456-7890abcdef01",
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
The lesson is generated during the module creation process.

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
- The initial lesson is generated during module creation. Generating a new lesson replaces the existing `lesson.json` file.
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
- All state is maintained in the single `lesson.json` file.
- Lessons persist until explicitly replaced or deleted

#### Quizzes

**Quizzes** are the primary mechanism for assessing and tracking learning progress. Each quiz is tied to the content of its module and is static to maintain consistency in evaluation.

#### Question Types

- **Multiple Choice**: Questions with four answer options (A-D) and exactly one correct answer.
- **Written Response**: Open-ended questions requiring users to type their answer.

#### Storage

Quizzes are stored in the `.mod/quizzes/` folder, with each quiz saved as a JSON file. The filename follows the pattern:
`quiz_<N>.json`

Where `<N>` is a sequential number (1, 2, 3, ...) indicating the order of generation for quizzes within that module.
Example: `quiz_1.json`, `quiz_2.json`

Each quiz file contains a unique Version 6 UUID (`id`) for internal identification. Quiz generation is **additive**; generating a new quiz adds the next numbered file to the directory without removing existing ones.

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
`submission_<N>.json`

Where:

- `<N>` is the attempt number for that module (1, 2, 3, etc.). This number reflects the total count of submissions across all quizzes for the module.
- Example: `submission_1.json`, `submission_2.json`, `submission_3.json`

Each submission file contains:

```json
{
    "id": "f6a7b8c9-d0e1-2345-6789-0abcdef012345",
    "quizId": "e5f6a7b8-c9d0-1234-5678-90abcdef0123",
    "submissionTimestamp": 1703567489123,
    "attempt": 1, // Module-wide attempt number
    "answers": [
        // ... structure for answers, feedback, pass/fail status ...
    ]
}
```

---

### Progress Tracking and Scheduling

Learning progress is tracked through quiz submissions. Each submission represents a record of a user's attempt at a quiz, including answers, scores, and timestamps. Submissions are stored as files in `.mod/submissions/`, ensuring users can review their learning journey at any time.
Because modules are immutable, an attempt on **any quiz** associated with a module updates that module's statistics (`.mod/stats.json`), which are used for spaced repetition scheduling.
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

### Module Immutability

Once a module is created, its source content is considered **immutable**. Users cannot modify the source files within an existing module directory. If changes to the learning material are required, the user must create a **new module** with the updated content. This ensures the integrity of the learning statistics and quizzes associated with each module instance.

### Module Creation Workflow

The module creation process follows these specific steps:

1.  **Source Selection**

    - User selects one or more input files (PDFs, text files, etc.)

2.  **Module Generation**

    - File contents are extracted and provided to the AI model
    - AI generates:
        - A suggested module `title` based on content analysis.
        - A brief `overview` summarizing the module contents.
        - The initial `lesson.json` content.

3.  **Module Storage**
    - User reviews the AI-generated `title` and `overview`.
    - User confirms or edits the `title`. This final title is validated to ensure it is a safe and unique directory name within the chosen library. This validated name is used as the folder name.
    - User selects an existing destination library (directory path).
    - System creates a new directory named with the validated module name within the chosen library path.
    - Source files are copied into the new module directory.
    - Module metadata (id, title, overview, createdAt) is saved to `.mod/meta.json`.
    - The generated lesson is saved to `.mod/lesson.json`.

---

### Naming Conventions

The Noggin protocol uses consistent identification and naming conventions:

#### Internal Identification: UUIDs

- All core entities—Libraries, Learning Paths, Modules, Quizzes, and Submissions—are uniquely identified internally by a standard Version 6 UUID.
- This UUID is stored within the entity's metadata file (e.g., `.lib/meta.json`, `.mod/meta.json`, `.path/meta.json`) or directly within its JSON data (for Quizzes and Submissions). Lessons do **not** have a UUID.
- UUIDs provide stable, unique references for internal logic, API calls, and cross-referencing, regardless of changes to user-facing names or filesystem locations.
- Example UUID: `f47ac10b-58cc-4372-a567-0e02b2c3d479`

#### Filesystem Naming

- **Libraries:** The filesystem location is determined by the path chosen by the user during library creation (e.g., `[parent directory]/[library name]`). The library's user-facing name is stored in `.lib/meta.json`. The directory is only created if the target path doesn't exist or is an empty directory.
- **Modules & Learning Paths:** The directory name is the user-validated title provided during creation. This name must be unique within its parent library and conform to filesystem naming restrictions.
    - Example Module Directory: `Binary Search Trees/`
    - Example Path Directory: `Introduction to Python/`
- **Quizzes:** Stored within `.mod/quizzes/` using sequentially numbered filenames: `quiz_1.json`, `quiz_2.json`, etc.
- **Submissions:** Stored within `.mod/submissions/` using a module-wide attempt number: `submission_1.json`, `submission_2.json`, etc.
- **Lessons:** Stored as a single file: `.mod/lesson.json`.

### Conclusion

This protocol provides a robust yet flexible framework for building modular, self-directed learning applications. By adhering to these specifications, developers can create systems that empower users with transparent data management, customizable content organization, and effective tools for tracking learning progress. The emphasis on local storage, user autonomy, and module immutability ensures that learners remain in full control of their educational journey while benefiting from reliable spaced repetition tracking.
