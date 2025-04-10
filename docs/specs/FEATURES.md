# Noggin Desktop Application

**Author**: Gabriel Anderson
**Date**: April 10, 2025

## Document Purpose and Scope

This document outlines the functional requirements and capabilities of the Noggin desktop application. It focuses on high-level functional specifications, not on UI/UX implementation details, which are covered in DESIGN.md.

---

Noggin is a modular, self-directed learning desktop app built with Electron, React, and Mantine. It is designed to provide a streamlined and intuitive experience for learners, encouraging them to study topics through locally stored modules and quizzes. This document outlines the functional requirements and capabilities of the application.

## Core Principles

- **Local-First**: All modules, quizzes, and submissions are stored locally on the user's machine for complete transparency and control.
- **Modular Design**: Each module stands alone, containing sources, quizzes, and submissions. Modules are immutable once created. Users choose what to learn without being constrained by any hierarchy.
- **User-Driven Practice**: A feed-driven interface helps surface modules due for review. Users decide when and what to study based on their own goals and comfort.

---

## Core Features

### Practice Feed

The Practice Feed guides users through their study sessions by surfacing modules ready for review.

- **Content Aggregation**:
  The feed pulls content from all available libraries, respecting learning path progression when applicable.

- **Module Overview**:
  Displays each loaded module with its name and overall status.

- **Spaced Repetition with Leitner System**:
  Noggin implements the Leitner system as its spaced repetition algorithm, chosen for its simplicity and proven effectiveness in memory retention:

    - Modules are organized into 5 review boxes (1-5)
    - Box 1 modules reviewed daily (or sooner if just created)
    - Box 2 modules reviewed every 2 days
    - Box 3 modules reviewed weekly
    - Box 4 modules reviewed bi-weekly
    - Box 5 modules reviewed monthly
    - Successful reviews move module up one box
    - Failed reviews return module to Box 1
    - New modules start in Box 1 and are immediately available for review.
    - Attempts on **any** quiz for an immutable module update the module's Leitner state (its box and `nextReviewDate`).

    This systematic approach ensures regular review intervals that expand as users demonstrate mastery, while quickly identifying and reinforcing challenging content.

    Each module maintains its review state in a stats object:

    ```json
    {
        "moduleId": "example-module-20241212103000", // Module's internal ID
        "currentBox": 2,
        "nextReviewDate": "2024-03-17T10:30:00Z"
        // Other stats...
    }
    ```

    The algorithm processes these stats to:

    - Calculate review schedules based on the current box
    - Determine module priority in the practice feed based on `nextReviewDate`
    - Move modules between boxes based on quiz performance

- **Mastery Levels**:
  The Leitner box numbers are presented to users as mastery levels:

    - Box 1: "Beginner" - Just starting to learn the material
    - Box 2: "Learning" - Making progress but needs frequent review
    - Box 3: "Familiar" - Good understanding with occasional review
    - Box 4: "Confident" - Strong grasp with infrequent review
    - Box 5: "Mastered" - Excellent retention with minimal review

    These descriptive labels help users understand their progress while the underlying Leitner system handles the review scheduling.

- **Prioritization Logic**:

    - Modules are surfaced based on their current Leitner box and `nextReviewDate`.
    - Modules with `nextReviewDate <= current time` are eligible for review.
    - Overdue modules (current time significantly past `nextReviewDate`) are prioritized higher.
    - Lower box numbers receive a slight priority boost.

- **Focus and Flexibility**:
  With a single click, users can open the _most recently taken_ quiz from a chosen module or review their past submissions. Users can also select any specific quiz from the module page.

---

### Module Management

Modules represent individual subjects or topics. Each module's data is stored locally for easy review and editing. The user-provided, validated title serves as the module's directory name.

- **Sources (Immutable)**:
  Users add source materials (e.g., PDFs or text files) directly to the module folder **during creation**. Once created, the module's source content cannot be modified.

- **Module Information Display**:
  Each module shows:

    - Title (folder name) and overview
    - Associated library path
    - Learning path membership (if part of a path)
    - Creation date
    - Current review status and mastery level
    - Last accessed date
    - Source files list
    - Quiz count
    - Submission count

- **Module Source Inputs**:
  Noggin accepts learning content through three simple input methods during module creation:

    - **Local Files**: Import supported file formats as listed in Supported Source Files below.
    - **Plain Text**: Paste or type raw text content directly into a simple input field.
    - **Web URLs**: Basic HTML content extraction from publicly accessible web pages.
      Note: Some websites may block content extraction.
      All sources are copied locally into the module directory for consistent access and immutability.

- **Token Usage Visualization**:
  Users can see a visual representation of token usage for each source, helping manage content size effectively.

- **Quizzes**:
  Quizzes derived from the immutable sources reside in `.mod/quizzes/`. They serve as stable assessments for the module's content. Questions are multiple-choice or written response.
  Quizzes are generated additively (one per generation action) and stored using sequentially numbered filenames: `quiz_1.json`, `quiz_2.json`, etc.

- **Submissions**:
  Each quiz attempt is recorded as a submission in `.mod/submissions/`. Filenames use a module-wide attempt number: `submission_1.json`, `submission_2.json`, etc. This allows users to track their progress over time.

- **Viewing Capabilities**:
  Users can view modules and see:

    - The current active lesson (`lesson.json`)
    - List of quizzes (`quiz_N.json`) and submissions (`submission_N.json`)
    - Source materials

- **Module Context**:
  Modules can exist either as standalone units or within learning paths, maintaining their independence while supporting structured progression.

### Library Management

Libraries serve as simple path-based containers for organizing learning content.

- **Library Configuration**:
  Users manage libraries through the Settings Panel:

    - **Adding a Library:** User provides a name (validated for filesystem safety) and selects an existing parent directory on their filesystem. The system creates the library directory `[parent directory]/[library name]` only if the target path doesn't exist or is an empty directory. An internal ID (UUID v6) is generated and stored in `.lib/meta.json`.
    - **Removing a Library Path:** Removes the library reference from Noggin settings (does not delete the directory).
    - **Viewing Library Paths:** Lists configured library paths.

- **Library View**:

    - Browse learning paths and standalone modules within each library.
    - Filter and search content within a library.
    - Create, access, and manage modules and learning paths directly from the library view.
    - Libraries are referenced internally and in routes using their UUIDs.

- **Content Access**:
    - All modules from configured libraries appear in the practice feed.
    - Module and path information displays their associated library.
    - Library view provides structured navigation of learning content.

### Learning Paths

Learning paths create structured sequences for systematic learning. The user-provided, validated title serves as the path's directory name.

- **Path Creation**:
  Users can create learning paths within a library to organize related modules into a coherent progression.

- **Path Viewing**:

    - View complete path structure and module sequence.
    - See progress through the learning path.
    - Access unlocked modules directly.
    - View prerequisites for locked modules.
    - Track completion status for each module.

- **Progress Tracking**:

    - Track completion status of modules within paths.
    - Manage module unlock requirements.
    - View overall path progress.

- **Module Sequencing**:
    - Define prerequisites between modules.
    - Control module visibility based on progress.
    - Maintain flexible progression through content.

### Lessons

Lessons provide structured, interactive guidance through module content. Lessons do **not** have internal UUIDs.

- **Lesson Structure**:

    - Each module maintains a single active lesson, stored as `.mod/lesson.json`.
    - Lessons consist of Learning Units combining content and comprehension questions.
    - Progress is tracked within the lesson until completion or replacement.

- **Learning Units**:
  Each unit contains:

    - Text-based explanation or content excerpt
    - One or more comprehension questions
    - Progress tracking for the unit
    - User response storage

- **Question Types**:

    - Multiple Choice: Questions with predefined options and a single correct answer

- **Lesson Generation**:

    - AI-generated based on module source content. The initial lesson is generated once during module creation.
    - Generating a _new_ lesson replaces the existing `lesson.json` file.
    - Users receive a warning before lesson replacement.

- **Progress Tracking**:

    - Progress is maintained within the `lesson.json` file.
    - Tracks completion status of individual units.
    - Stores user responses for immediate feedback.
    - Does not contribute to long-term module statistics (Leitner state).

- **Lesson Interaction**:

    - Users can navigate between units freely.
    - Each unit requires answering questions before proceeding.
    - Immediate feedback provided for answers.
    - Progress automatically saved after each unit.

- **Lesson Completion**:

    - Summary view shows overall performance.
    - Displays breakdown of completed units.
    - Shows key takeaways from the lesson.
    - Provides options to:
        - Take a quiz
        - Return to module
        - Generate new lesson

- **Lesson Persistence**:

    - Lessons are transient and focus on immediate comprehension.
    - Only one lesson exists per module at any time.
    - All state is maintained in the single `lesson.json` file.
    - Lessons persist until explicitly replaced or deleted.

---

### Supported Source Files

Noggin supports a wide range of file formats as source materials, leveraging Gemini's multimodal capabilities:

- **Documents**:

    - PDF (application/pdf)
    - Plain Text (text/plain)
    - Markdown (text/md)
    - HTML (text/html)
    - CSV (text/csv)
    - RTF (text/rtf)
    - XML (text/xml)

- **Code Files**:

    - JavaScript (application/x-javascript, text/javascript)
    - Python (application/x-python, text/x-python)
    - CSS (text/css)

- **Images**:

    - PNG (image/png)
    - JPEG (image/jpeg)
    - WebP (image/webp)
    - HEIC (image/heic)
    - HEIF (image/heif)

- **Audio**:
    - WAV (audio/wav)
    - MP3 (audio/mp3)
    - AIFF (audio/aiff)
    - AAC (audio/aac)
    - OGG Vorbis (audio/ogg)
    - FLAC (audio/flac)

Each file type is processed appropriately for content extraction and quiz generation:

- **Documents & Code**: Full text extraction with preservation of structure
- **Images**: Visual content analysis and description
- **Audio**: Speech-to-text transcription and content analysis

File size limits and processing guidelines:

- Individual files up to 2GB
- Maximum 20GB total storage per project
- For optimal performance, files are processed according to Gemini's specifications:
    - Images are scaled to optimal resolution (768x768 to 3072x3072 pixels)
    - Audio is processed at 16 Kbps, single channel
    - Documents support up to 3,600 pages

---

### Quiz Management

Noggin provides two distinct interfaces for quiz interaction.

- **Quiz View**:

    - Display all submissions for a specific quiz
    - Provide access to quiz questions
    - Enable detailed review of submissions
    - Allow users to start a quiz

- **Quiz Session**:

    - Provides a focused environment for quiz completion:
        - Uninterrupted quiz-taking experience
        - Progress saving and recovery
        - Option to exit and resume later
    - Question Management:
        - Supports both multiple-choice and written responses
        - Allows review and modification of previous answers
        - Tracks completion progress
        - Randomizes question order for each attempt
    - Navigation and Control:
        - Move freely between questions
        - Review all answers before final submission
        - Clear indication of answered/unanswered questions
    - Submission Handling:
        - Confirms submission intent
        - Processes all answers for grading
        - Transitions to grading interface upon completion

- **Viewing Capabilities**:
  Users can view a quiz and see the questions and list of submissions for that specific quiz.

---

### Submission Review

- **Detailed Feedback**:
  Users can view a quiz submission and see the questions, their answers, correct or expected responses, and AI-generated feedback.

- **Re-evaluation**:
  Users can request new AI-powered evaluations of their submissions at any time, receiving updated feedback and grades.

---

### Module Reference Information

The application provides easy access to module reference information to help users understand and manage their learning content:

- **Module Details**:
  Users can access comprehensive module details including:

    - Basic module metadata (id, creation date, update date)
    - Current mastery level with natural language labels (derived from Leitner box)
    - Review schedule information (`nextReviewDate`)
    - Complete list of source files with direct access
    - Quiz and submission counts

    This reference information is accessible alongside the main module content, allowing users to quickly check key details while working with quizzes and other module elements.

---

### Module Explorer

The Module Explorer provides a hierarchical view of all learning content across configured libraries:

- **Content Management**:
  Provides a tree view of libraries, paths, and modules, enabling users to access modules, sources, quizzes, and submissions.

- **Direct Navigation**:
  Facilitates access to quizzes and past submissions from the main interface.

---

### Settings Panel

The Settings Panel offers straightforward customization options:

- **Library Management**: Add/remove library paths as described in the Library Management section.
- **Customization Options**: Allows users to configure application settings, including theme and layout preferences.
- **AI Providers**: Manage API keys and integrations with external AI services for content extraction and quiz generation.

---

## AI-Powered Features

### Module Creation Workflow

The module creation process follows these specific steps:

1. **Source Selection**

    - User selects one or more input files (PDFs, text files, URLs, etc.)

2. **Library Selection**

    - User selects a destination library from configured libraries.

3. **Module Generation**

    - File contents are extracted and provided to the AI model.
    - AI generates:
        - A suggested module `title` based on content analysis.
        - A brief `overview` summarizing the module contents.
        - The initial lesson content.

4. **Module Storage**
    - User reviews the AI-generated `title` and `overview`.
    - User confirms or edits the `title`. This final title is validated to ensure it is a safe and unique directory name within the chosen library. This validated name is used as the folder name.
    - System creates a module directory named with the validated title within the chosen library path.
    - Source files are copied into the new module directory (making the module immutable).
    - Module metadata (internal ID, title, overview, createdAt) is saved to `.mod/meta.json`.
    - The generated initial lesson is saved to `.mod/lesson.json`.

### Quiz Generation

Leverages AI to create comprehensive quizzes from immutable module content:

- **Content Analysis**: Process source materials to identify key concepts.
- **Question Creation**: Generate both multiple-choice and written response questions.
- **Local Storage**: Save generated quizzes as static files in `.mod/quizzes/`.
    - Each generation action creates **one** new quiz file (`quiz_N+1.json`), adding it additively to the existing quizzes for the module.

### Lesson Generation

Leverages AI to create interactive, guided learning experiences from immutable module content:

- **Content Analysis**: Process source materials to identify key concepts and create explanatory content.
- **Question Creation**: Generate comprehension questions for each Learning Unit.
- **Focus Customization**: Allow users to specify areas of emphasis for tailored lessons.
- **Local Storage**: Save generated lesson as `lesson.json` in the module directory, replacing any existing version.

### Quiz Grading

Automated assessment of quiz submissions using AI:

- **Feedback Generation**: Provide detailed explanations for incorrect answers.
- **Submission Storage**: Save graded attempts to `.mod/submissions/`.
    - Submissions are stored as `submission_N.json`, where N is the module-wide attempt number. Each submission file contains a unique internal ID (UUID v6).

---

## User Workflows

1. **Creating and Setting Up a Module**:

    - Initiate a new module creation process.
    - Add source materials (PDFs, text files, URLs).
    - Select destination library.
    - Review AI-generated title/overview, confirm/edit title (which becomes folder name after validation).
    - Module is created with sources, metadata (internal ID), and the initial lesson is generated. The module becomes immutable.

2. **Generating Learning Content**:

    - Generate or _regenerate_ an interactive lesson (replaces `lesson.json`).
    - Generate additional quizzes from module content using AI (adds `quiz_N+1.json`).

3. **Daily Study Practice**:

    - Open the Practice Feed to see suggested modules based on Leitner schedule.
    - Choose a module based on review recommendations.
    - Optionally, work through the lesson if unfamiliar with content.
    - Select and attempt **any** quiz from the module. The result of this attempt updates the module's Leitner state (`.mod/stats.json`).
    - Review feedback after submission.
    - Track progress through submission history.

4. **Managing Modules**:

    - Access module details to view reference information (ID, stats, sources).
    - Review past quiz submissions.
    - Access source materials and quizzes directly.

5. **System Configuration**:
    - Configure AI provider settings and API keys.
    - Manage Library paths.
    - Customize interface preferences and theme.

---

## Technical Details

- **Gemini 2.0 Flash**:
  Used for content extraction and quiz generation. Large context window and multi-modal capabilities allow for complex content analysis and question generation.

- **Electron**:
  Cross-platform desktop framework for building native applications.

- **React 18 & Mantine v7**:
  Modern UI components ensuring a responsive and intuitive user experience.

- **electron-vite**:
  Fast and reliable bundling for quick startup times and easy development.

- **@tabler/icons-react**:
  Comprehensive icon library providing consistent and customizable UI elements.

---

## Conclusion

The Noggin desktop application provides a robust, local-first platform for self-directed learning. By combining modular content organization, AI-powered generation tools, and a simple spaced repetition system, it empowers users to take control of their learning journey. The focus on transparency, immutability, and user autonomy ensures a reliable and flexible learning experience.
