# Noggin Desktop Application

**Author**: Gabriel Anderson
**Date**: December 12, 2024

Noggin is a modular, self-directed learning desktop app built with Electron, React, and Mantine. It is designed to provide a streamlined and intuitive experience for learners, encouraging them to study topics through locally stored modules and quizzes.

## Core Principles

- **Local-First**: All modules, quizzes, and submissions are stored locally on the user’s machine for complete transparency and control.
- **Modular Design**: Each module stands alone, containing sources, quizzes, and submissions. Users choose what to learn without being constrained by any hierarchy.
- **User-Driven Practice**: A feed-driven interface helps surface modules due for review. Users decide when and what to study based on their own goals and comfort.

---

## Core Features

### Practice Feed

The Practice Feed guides users through their study sessions by surfacing modules ready for review.

- **Module Overview**:
  Displays each loaded module with its name and overall status.

- **Prioritization Logic**:
  Highlights modules based on review timing to encourage spaced repetition, allowing users to manage their own schedules.

- **Focus and Flexibility**:
  With a single click, users can open a quiz from a chosen module or review their past submissions.

---

### Module Management

Modules represent individual subjects or topics. Each module’s data is stored locally for easy review and editing.

- **Sources**:
  Users add source materials (e.g., PDFs or text files) directly to the module folder.

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
  Quizzes derived from these sources reside in `.mod/quizzes/`. They serve as stable assessments for the module’s content. Questions are multiple-choice or written response, ensuring clarity and consistency.

- **Submissions**:
  Each quiz attempt is recorded as a submission in `.mod/submissions/`. This allows users to track their progress over time.

- **Viewing Capabilities**:
  Users can view modules and see the list of quizzes and submissions for all quizzes.

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
  Users can view a quiz submission and see the questions, their answers, correct or expected responses, and instructor feedback. This allows users to review their quiz submission graded by the AI.

---

### Module Explorer

The Module Explorer is accessible from a collapsible side panel, helping users organize and navigate their modules:

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

### Module Creation

A simple workflow for creating new learning modules:

- **Initialize Module**: Create a new module directory with the required structure
- **Add Sources**: Import learning materials (PDFs, text files, etc.)
- **Analyze Content**: Analyze the content of the sources to generate a module overview
- **Save Module**: Store the module in location given by user

### Quiz Generation

Leverages AI to create comprehensive quizzes from module content:

- **Content Analysis**: Process source materials to identify key concepts
- **Question Creation**: Generate both multiple-choice and written response questions
- **Local Storage**: Save generated quizzes as static files in `.mod/quizzes/`

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

    - Generate quizzes from module content using AI
    - Save generated quizzes to the module's quiz folder

3. **Daily Study Practice**:

    - Open the Practice Feed to see suggested modules
    - Choose a module based on review recommendations
    - Select and attempt a quiz from the module
    - Review feedback after submission
    - Track progress through submission history

4. **Managing Modules**:

    - Use the Module Explorer to view all materials
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
