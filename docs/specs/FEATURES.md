# Noggin Desktop Application

**Author**: Gabriel Anderson
**Date**: December 27, 2024

## Document Purpose and Scope

This document outlines the functional requirements and capabilities of the Noggin desktop application. It focuses on high-level functional specifications, not on UI/UX implementation details, which are covered in DESIGN.md.

---

Noggin is a modular, self-directed learning desktop app built with Electron, React, and Mantine. It is designed to provide a streamlined and intuitive experience for learners, encouraging them to study topics through locally stored modules and quizzes. This document outlines the functional requirements and capabilities of the application.

## Core Principles

- **Local-First**: All modules, quizzes, and submissions are stored locally on the user's machine for complete transparency and control.
- **Modular Design**: Each module stands alone, containing sources, quizzes, and submissions. Users choose what to learn without being constrained by any hierarchy.
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

    This systematic approach ensures regular review intervals that expand as users demonstrate mastery, while quickly identifying and reinforcing challenging content.

    Each module maintains its review state in a stats object:

    ```json
    {
        "moduleId": "example-module-20241212103000",
        "currentBox": 2,
        "nextReviewDate": "2024-03-17T10:30:00Z"
    }
    ```

    The algorithm processes these stats to:

    - Calculate review schedules based on the current box
    - Determine module priority in the practice feed based on nextReviewDate
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
  With a single click, users can open a quiz from a chosen module or review their past submissions.

---

### Module Management

Modules represent individual subjects or topics. Each module's data is stored locally for easy review and editing.

- **Sources**:
  Users add source materials (e.g., PDFs or text files) directly to the module folder.

- **Module Information Display**:
  Each module shows:

    - Title and overview
    - Associated library
    - Learning path membership (if part of a path)
    - Creation date
    - Current review status and mastery level
    - Last accessed date
    - Source files list
    - Quiz count
    - Submission count

- **Module Source Inputs**:
  Noggin accepts learning content through three simple input methods:

    - **Local Files**: Import supported file formats as listed in Supported Source Files below.
    - **Plain Text**: Paste or type raw text content directly into a simple input field.
    - **Web URLs**: Basic HTML content extraction from publicly accessible web pages.
      Note: Some websites may block content extraction.
      All sources are stored locally within the module directory for consistent access.

- **Token Usage Visualization**:
  Users can see a visual representation of token usage for each source, helping manage content size effectively.

- **Quizzes**:
  Quizzes derived from these sources reside in `.mod/quizzes/`. They serve as stable assessments for the module's content. Questions are multiple-choice or written response, ensuring clarity and consistency.

- **Submissions**:
  Each quiz attempt is recorded as a submission in `.mod/submissions/`. This allows users to track their progress over time.

- **Viewing Capabilities**:
  Users can view modules and see:

    - The current active lesson (if any)
    - List of quizzes and submissions
    - Source materials

- **Module Context**:
  Modules can exist either as standalone units or within learning paths, maintaining their independence while supporting structured progression.

### Library Management

Libraries serve as simple path-based containers for organizing learning content:

- **Library Configuration**:
  Configure library paths through the Settings Panel, allowing users to:

    - Add new library paths
    - Remove existing paths
    - Name/rename libraries
    - Each library has a unique slug derived from its name
    - Slugs are used for routing and identification
    - Apps should prevent duplicate library slugs

- **Library View**:

    - Browse learning paths and standalone modules within each library
    - Filter and search content within a library
    - Create, access, and manage modules and learning paths directly from the library view
    - Libraries are identified by slugs in routes (e.g., /library/view/my-library)

- **Content Access**:
    - All modules from configured libraries appear in the practice feed
    - Module and path information displays their associated library
    - Library view provides structured navigation of learning content

### Learning Paths

Learning paths create structured sequences for systematic learning:

- **Path Creation**:
  Users can create learning paths to organize related modules into a coherent progression.

- **Path Viewing**:

    - View complete path structure and module sequence
    - See progress through the learning path
    - Access unlocked modules directly
    - View prerequisites for locked modules
    - Track completion status for each module

- **Progress Tracking**:

    - Track completion status of modules within paths
    - Manage module unlock requirements
    - View overall path progress

- **Module Sequencing**:
    - Define prerequisites between modules
    - Control module visibility based on progress
    - Maintain flexible progression through content

### Lessons

Lessons provide structured, interactive guidance through module content:

- **Lesson Structure**:

    - Each module maintains a single active lesson
    - Lessons consist of Learning Units combining content and comprehension questions
    - Progress is tracked within the lesson until completion

- **Learning Units**:
  Each unit contains:

    - Text-based explanation or content excerpt
    - One or more comprehension questions
    - Progress tracking for the unit
    - User response storage

- **Question Types**:

    - Multiple Choice: Questions with predefined options and a single correct answer

- **Lesson Generation**:

    - AI-generated based on module source content
    - Users may provide focus instructions to tailor lesson content
    - Generating a new lesson replaces any existing lesson
    - Users receive a warning before lesson replacement

- **Progress Tracking**:

    - Progress is maintained within the lesson.json file
    - Tracks completion status of individual units
    - Stores user responses for immediate feedback
    - Does not contribute to long-term module statistics

- **Lesson Interaction**:

    - Users can navigate between units freely
    - Each unit requires answering questions before proceeding
    - Immediate feedback provided for answers
    - Progress automatically saved after each unit

- **Lesson Completion**:

    - Summary view shows overall performance
    - Displays breakdown of completed units
    - Shows key takeaways from the lesson
    - Provides options to:
        - Take a quiz
        - Return to module
        - Generate new lesson

- **Lesson Persistence**:

    - Lessons are transient and focus on immediate comprehension
    - Only one lesson exists per module at any time
    - All state is maintained in the single `lesson.json` file
    - Lessons persist until explicitly replaced or deleted

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

Noggin provides two distinct interfaces for quiz interaction:

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
  Users can view a quiz submission and see the questions, their answers, correct or expected responses, and instructor feedback.

- **Re-evaluation**:
  Users can request new AI-powered evaluations of their submissions at any time, receiving updated feedback and grades.

---

### Module Reference Information

The application provides easy access to module reference information to help users understand and manage their learning content:

- **Module Details**:
  Users can access comprehensive module details including:

    - Basic module metadata (creation date, update date)
    - Current mastery level with natural language labels
    - Review schedule information (`nextReviewDate`)
    - Complete list of source files with direct access
    - Quiz and submission counts

    This reference information is accessible alongside the main module content, allowing users to quickly check key details while working with quizzes and other module elements.

---

### Module Explorer

The Module Explorer provides a hierarchical view of all learning content:

- **Module Management**:
  Provides a list of all modules, enabling users to access modules, sources, quizzes, and submissions.

- **Direct Navigation**:
  Facilitates access to quizzes and past submissions from the main interface.

---

### Settings Panel

The Settings Panel offers straightforward customization options:

- **Customization Options**:
  Allows users to configure application settings, including theme and layout preferences.
- **AI Providers**:
  Manage API keys and integrations with external AI services for content extraction and quiz generation.

---

## AI-Powered Features

### Module Creation Workflow

The module creation process follows these specific steps:

1. **Source Selection**

    - User selects one or more input files (PDFs, text files, etc.)

2. **Library Selection**

    - User selects a destination library from configured libraries
    - Option to create a new library if desired
    - Libraries provide organized containers for modules
    - New libraries require:
        - Library name
        - Description (optional)

3. **Module Generation**

    - File contents are extracted and provided to the AI model
    - AI generates a descriptive module title based on content analysis
    - AI writes a brief overview summarizing the module contents
    - A URL-friendly slug is created from the module title
    - Module is saved within the selected library directory

4. **Module Storage**
    - System creates module directory within the chosen library
    - Source files are copied into the new module directory
    - Module metadata (title, overview) is saved

### Quiz Generation

Leverages AI to create comprehensive quizzes from module content:

- **Content Analysis**: Process source materials to identify key concepts
- **Question Creation**: Generate both multiple-choice and written response questions
- **Local Storage**: Save generated quizzes as static files in `.mod/quizzes/`

### Lesson Generation

Leverages AI to create interactive, guided learning experiences:

- **Content Analysis**: Process source materials to identify key concepts and create explanatory content
- **Question Creation**: Generate comprehension questions for each Learning Unit
- **Focus Customization**: Allow users to specify areas of emphasis for tailored lessons
- **Local Storage**: Save generated lesson as `lesson.json` in the module directory

### Quiz Grading

Automated assessment of quiz submissions using AI:

- **Feedback Generation**: Provide detailed explanations for incorrect answers
- **Submission Storage**: Save graded attempts to `.mod/submissions/`

---

## User Workflows

1. **Creating and Setting Up a Module**:

    - Initialize a new module with a descriptive name
    - Add source materials (PDFs, text files) to the module folder
    - Review and organize sources as needed

2. **Generating Learning Content**:

    - Generate an interactive lesson for guided learning
    - Generate quizzes from module content using AI
    - Save generated content to the module's appropriate folders

3. **Daily Study Practice**:

    - Open the Practice Feed to see suggested modules
    - Choose a module based on review recommendations
    - Work through the lesson if unfamiliar with content
    - Select and attempt a quiz from the module
    - Review feedback after submission
    - Track progress through submission history

4. **Managing Modules**:

    - Access module details to view reference information
    - Review past quiz submissions
    - Access source materials and quizzes directly

5. **System Configuration**:
    - Configure AI provider settings and API keys
    - Customize interface preferences and theme

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

This updated features set places the user at the center, providing a local-first, modular, and transparent learning environment. By simplifying the structure, removing unnecessary complexities, and focusing on straightforward workflows, Noggin empowers learners to guide their own educational journey confidently and effectively.
