# Noggin Desktop Application: UI/UX Design Document

**Author**: Gabriel Anderson
**Date**: December 12, 2024

---

## Introduction

This document outlines the User Interface (UI) and User Experience (UX) design for the Noggin desktop application. Noggin is a modular, self-directed learning platform that empowers users to manage their learning journey through locally stored modules and quizzes. The design prioritizes simplicity, transparency, and user control, adhering to a local-first and modular approach.

---

## Main Components

### Dashboard

The Dashboard is the primary interface users interact with upon launching Noggin. It consists of three main sections: the Main Content Area, the Practice Feed, and the Module Explorer sidebar.

#### 1.0 Main Content Area

The Main Content Area is the primary content container that displays the current active view.

**Wireframe Description:**

- **Layout:** Full-width container with flexible content area, positioned adjacent to the Module Explorer sidebar
- **Header:** Application-wide header containing:
    - Noggin logo/name on the left
    - Toggle sidebar button
    - Global actions (settings, help, etc.) on the right
- **Content:** Displays one of:
    - Practice Feed (default view)
    - Module View
    - Create Module Page
    - Quiz Session
    - Other full-page views

#### 1.1 Practice Feed

The Practice Feed displays Module Cards that represent available learning modules.

**Wireframe Description:**

- **Layout:** A vertically scrolling list of Module Cards.
- **Header:** "Practice Feed" title at the top.
    - `+` Button on the right side of the header to open the Create Module Page
- **Module Cards:** Each card displays:
    - Module Name (prominently at the top of the card)
    - Status Indicators (e.g., last reviewed date, number of quizzes available). Each status is rendered as a chip.
    - "Start Quiz" button to launch the Quiz Session for the most recently generated quiz
    - "Generate Quiz" button to open the Quiz Generation Modal
    - "Review Submissions" button to review previous quiz submissions
- **Visual Hierarchy:** Module Cards are visually distinct and easily scannable. Prioritized modules (e.g., due for review) are subtly highlighted using color or slight elevation.

#### 1.2 Module Explorer (Sidebar)

The Module Explorer is a collapsible sidebar that provides quick access to all modules, their contents, and settings.

**Wireframe Description:**

- **Layout:** A narrow, vertically oriented panel on the left side of the Main Content Area
- **Collapsible:** A toggle button in the main header allows users to expand or collapse the sidebar
    - When collapsed, the sidebar is completely hidden
- **Header:** "Module Explorer" title when expanded.
    - `+` Button on the right side of the header to create new modules
- **Module List:** A vertically scrolling list of all modules.
    - Each module is represented by its name.
    - Clicking a module name expands it to show:
        - "Open Folder" button (opens the module's directory in the file explorer).
        - "View Quizzes" button (lists available quizzes for the module, allowing direct launch).
        - "View Submissions" button (lists past submissions for the module, allowing review).
- **Settings:** A "Settings" button at the bottom of the sidebar opens the Settings Panel.

### Module Page

The Module Page provides a dedicated interface for viewing and managing a single module's content and quizzes.

**Wireframe Description:**

- **Layout:** Full-page view that replaces the Dashboard, with the Module Info Panel on the right side.
- **Header:**
    - Module title
    - "Back to Dashboard" button
    - "Generate Quiz" button (opens Quiz Generation Modal)
- **Content Sections:**
    - **Quizzes Grid:**
        - Grid layout of quiz cards showing:
            - Quiz name/number
            - Question count
            - Date created
            - "Start Quiz" button

### Module Info Panel

The Module Info Panel consolidates the overview and submissions information into a single, comprehensive view.

**Wireframe Description:**

- **Layout:** Integrated panel within the Module Page
- **Header:**
    - Module title
    - "Back to Dashboard" button
    - "Generate Quiz" button (opens Quiz Generation Modal)
- **Content Sections:**
    - **Module Overview:**
        - Module description
        - Last reviewed date
        - Total quizzes available
        - Source files list with links to open in system
    - **Submissions Timeline:**
        - Timeline of quiz submissions showing:
            - Date/time taken
            - Score
            - Quiz name/number
            - "View Details" button
    - **Visual Integration:**
        - Clear visual separation between overview and submissions
        - Use of tabs or collapsible sections to toggle between overview and submissions if space is limited

### Create Module Page

The Create Module page provides a dedicated full-screen interface for creating new modules through multiple input methods.

**Wireframe Description:**

- **Layout:** Full-screen interface that replaces the Dashboard
- **Header:**
    - "Create New Module" title
    - "Back to Dashboard" button (top-left corner)

#### Source Selection View

- **Header:**

    - "Create New Module" title
    - Action buttons in top-right:
        - "Paste Text" button (opens modal)
        - "Enter URL" button (opens modal)

- **Main Content Area:**

    - Full-width Mantine dropzone list container:
        - Empty state shows:
            - Icon and "Drag files here or click to select" text
            - Small info icon that shows supported file types in popover
        - When populated, shows:
            - Scrollable list of added sources, each showing:
                - Filename/URL/Text preview
                - File size or content length
                - Remove button (×)
            - Token usage visualization at bottom:
                - D3.js horizontal bar showing token allocation
                - Each source as different colored segment
                - Mouse-over segments show source details
                - Total token count displayed

- **Footer:**
    - "Generate Module" button (right-aligned)
    - "Cancel" button (left-aligned)

#### Text Input Modal

- **Header:** "Add Text Content"
- **Content:**
    - Large text area for content
    - Character/token count
- **Footer:**
    - "Add" button
    - "Cancel" button

#### URL Input Modal

- **Header:** "Add Web Content"
- **Content:**
    - URL input field
    - Note about website access limitations
- **Footer:**
    - "Add" button
    - "Cancel" button

#### Module Creation Review View

This view is the final step in the module creation process, allowing users to review and finalize their module details before creation.

- **Header:** "Finalize Module Details"

- **Main Content:**

    - Editable module title
    - Editable overview
    - Directory selection:
        - "Select Location" button (opens system file picker)
        - Display of selected path
    - List of source files:
        - Each source with size/length
        - Visualization of total token usage

- **Footer:**
    - "Create Module" button (enabled when location is selected)
    - "Back" button
    - "Cancel" button

### Quiz Page

The Quiz Page provides an overview of a specific quiz and its submissions.

**Wireframe Description:**

- **Layout:** Full-page view that replaces the Dashboard
- **Header:**
    - Module name and quiz identifier
    - "Back to Module" button
    - "Take Quiz" button (launches Quiz Session)
- **Content:**
    - **Main Area (Left):**
        - Grid of submission cards, each showing:
            - Submission date/time
            - Score
            - "View Details" button (opens Submission View)
    - **Sidebar (Right):**
        - List of quiz questions (text only)
        - No answers shown to maintain quiz integrity
        - Question type indicators (multiple choice/written)

### Quiz Session

Quiz Session provides a focused, full-screen environment for taking quizzes.

**Wireframe Description:**

- **Layout:** Full-screen, minimal, and distraction-free.
- **Header:**
    - Module Name displayed at the top.
    - Quiz Name (or number) displayed below the module name.
    - "Exit" button (e.g., "X" icon) to return to the Dashboard.
- **Question Area:**
    - Current question number and total number of questions (e.g., "Question 3/10").
    - Question text displayed prominently.
    - Answer options:
        - For multiple-choice: Radio buttons labeled A, B, C, D.
        - For written response: A text input field.
- **Navigation:**
    - "Previous" button (disabled on the first question).
    - "Next" button.
    - "Submit" button (becomes active when all questions are answered).

### Quiz Generation Wizard

The Quiz Generation Wizard provides a simple interface for creating quizzes from module content.

**Wireframe Description:**

- **Layout:** Modal dialog that overlays the current view
- **Header:** "Generate Quiz"
- **Content Stages:**
    1. **Configuration Stage:**
        - **Input:** "Number of Questions" (default: 10)
        - **Checkboxes:**
            - "Include Multiple Choice Questions"
            - "Include Written Response Questions"
        - **Generate Button:**
            - Rainbow gradient outline appears on hover (slow animation)
            - During generation:
                - Button text changes to "Generating..."
                - Rainbow animation speeds up
                - Loading indicator appears
    2. **Preview Stage:** (shown after generation)
        - Quiz overview showing:
            - Total questions generated
            - Breakdown of question types
            - Preview of first 2-3 questions (truncated)
        - Option to regenerate with same settings
- **Footer:**
    - Stage 1:
        - "Generate" button (with rainbow animation)
        - "Cancel" button
    - Stage 2:
        - "Take Quiz Now" button
        - "Save Quiz" button
        - "Back" button (returns to configuration)

### Quiz Grading Interface

The Quiz Grading Interface provides a dedicated full-screen view for reviewing quiz results and feedback.

**Wireframe Description:**

- **Layout:** Full-screen interface that replaces Quiz Session after submission
- **Header Bar:**
    - Module name and quiz identifier
    - Submission timestamp
    - Overall score display
    - "Back to Dashboard" button
    - "Export Results" button
- **Question Review Area:**
    - Scrollable main content area
    - Each question card shows:
        - Question text and type
        - User's answer (highlighted)
        - Correct answer (for multiple choice)
        - AI-generated feedback explaining the evaluation
        - Score/points awarded
    - Clear visual separation between questions
- **Side Panel:**
    - Quick-jump navigation to specific questions
    - Question status indicators (correct/incorrect)
    - Progress summary

### Submission View Page

The Submission View Page provides a dedicated interface for reviewing individual quiz submissions in detail.

**Wireframe Description:**

- **Layout:** Full-page view that replaces the Dashboard
- **Header:**
    - Module name and quiz identifier
    - Attempt number
    - Submission date/time
    - "Back to Module" button
    - "Export Results" button
- **Content:**
    - **Question Review List:**
        - Each question card shows:
            - Question type
            - Original question text
            - Question options (for multiple choice)
            - User's answer
                - Text for written response
                - Green/red highlight on choice to indicate user's response.
            - Correct answer (for multiple choice)
            - Any AI-generated feedback
        - Clear visual indicators for correct/incorrect answers

### Settings Panel

The Settings Panel allows users to customize the app and manage AI provider integrations.

**Wireframe Description:**

- **Layout:** A modal dialog that overlays the Dashboard, centered on screen.
- **Tabs:**
    - **General:**
        - Theme selection (light/dark/system).
        - Font size adjustment.
        - Option to change modules root directory
    - **AI Providers:**
        - Input fields for API keys.
        - Dropdown to select active AI provider for text extraction.
        - Dropdown to select active AI provider for quiz generation.
        - Dropdown to select active AI provider for quiz grading.
        - "Test Connection" button for each provider.
- **Navigation:**
    - "Save" button to apply changes.
    - "Cancel" button to discard changes and close the panel.

## User Flows

1. **Creating a Module:**

    - User clicks the `+` button on the main practice feed Dashboard.
    - Create Module Page is displayed.
    - User enters a module name.
    - User adds source materials via file selection.
    - User chooses whether to generate quizzes immediately or later.
    - Module is created and appears in the Module Explorer and Practice Feed.

2. **Generating and Taking Quizzes:**

    - User can generate a quiz from either:
        - Clicking "Generate Quiz" on a Module Card in the Practice Feed
        - Clicking "Generate Quiz" button on the Module Page
    - Quiz Generation Wizard opens.
    - User configures quiz options (number of questions, question types).
    - User clicks "Generate".
    - Progress bar shows generation status.
    - When complete, user can either:
        - Click "Take Quiz Now" to immediately start the quiz
        - Click "Done" to close the modal
    - Generated quiz becomes the "most recent quiz" for that module

3. **Taking a Quiz:**

    - User can start a quiz from:
        - Clicking "Start Quiz" on a Module Card (starts most recent quiz)
        - Selecting a specific quiz from the Module Page's Quizzes Panel
        - Clicking "Take Quiz Now" after generating a new quiz
    - Quiz Session launches in full-screen.
    - User answers questions.
    - User clicks "Submit".
    - The submission is saved, and the user is returned to the previous view.

4. **Reviewing Submissions:**

    - User navigates to the Module Page.
    - User views submissions in the Submissions Panel.
    - User can click "View Details" on any submission to see:
        - Individual questions and answers
        - Feedback and scoring
        - Overall performance

5. **Adjusting Settings:**
    - User clicks the "Settings" button in the Module Explorer.
    - Settings Panel opens.
    - User navigates through tabs to adjust preferences or configure AI providers.
    - Settings are saved automatically, no option to save changes.

---

## Conclusion

This design document provides a comprehensive overview of the Noggin desktop application's UI/UX. By focusing on a clean, intuitive interface and straightforward user flows, Noggin aims to provide a seamless and effective learning experience. The local-first, modular design ensures that users remain in control of their learning journey, fostering a transparent and personalized educational environment.
