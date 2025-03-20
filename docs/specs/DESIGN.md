# Noggin Desktop Application: UI/UX Design Document

**Author**: Gabriel Anderson
**Date**: December 27, 2024

---

## Introduction

This document outlines the User Interface (UI) and User Experience (UX) design specifications for the Noggin desktop application. It details the visual and interactive elements that implement the functional requirements defined in FEATURES.md. Noggin is a modular, self-directed learning platform that empowers users to manage their learning journey through locally stored modules and quizzes. The design prioritizes simplicity, transparency, and user control, adhering to a local-first and modular approach.

---

## Application Structure

### AppLayout

The AppLayout serves as the foundational container for the entire application, providing consistent structure across all pages.

**Wireframe Description:**

- **Layout:** Full-screen container with a split-pane design
- **Structure:**
    - Left pane: Left Sidepane containing Module Explorer (fixed on all pages)
    - Main pane: Main Content Area (dynamic based on current route)
    - Top: AppHeader (persistent across all routes)
- **Behavior:**
    - Present on all pages and routes
    - Manages global state for sidebar visibility
    - Provides context for page-specific layouts
    - Fully hidden during Quiz Session pages to create a distraction-free environment

### AppHeader

The AppHeader provides consistent navigation and context across all pages in the application.

**Wireframe Description:**

- **Layout:** Full-width bar at the top of the application
- **Left Section:**
    - BackLink (when applicable, based on current page context)
    - Page title
- **Right Section:**
    - Toggle left sidebar button (collapses/expands the Left Sidepane)
    - Settings button (opens Settings Panel)
    - Help button (opens Help documentation)
- **BackLink System:**
    - Contextual "Back to..." links that change based on the current page
    - Shows different destinations depending on navigation history and current page
    - May include confirmation dialogs for potentially disruptive actions (e.g., leaving a form with unsaved changes)
    - Examples:
        - "Back to Dashboard" when viewing a module
        - "Back to Module" when viewing a quiz or submission
        - "Back to Library" when viewing a learning path
    - Some BackLinks include dynamic parameters to maintain context when navigating

---

## Main Components

### Dashboard

The Dashboard is the primary interface users interact with upon launching Noggin. It consists of three main sections: the Main Content Area, the Practice Feed, and the Module Explorer sidebar.

#### 1.0 Main Content Area

The Main Content Area is the primary content container that displays the current active view.

**Wireframe Description:**

- **Layout:** Full-width container with flexible content area, positioned adjacent to the Left Sidepane
- **Content:** Displays one of:
    - Practice Feed (default view)
    - Module View
    - Create Module Page
    - Quiz Session
    - Other full-page views

#### 1.1 Left Sidepane

The Left Sidepane is a container component that houses the Module Explorer, providing a unified navigation interface.

**Wireframe Description:**

- **Layout:** A narrow, vertically oriented pane on the left side of the Main Content Area
- **Collapsible:** A toggle button in the main header allows users to expand or collapse the entire sidepane
    - When collapsed, the sidepane is completely hidden
- **Visibility Rules:**
    - Present on all pages except during an active Quiz Session
    - Completely hidden during Quiz Sessions to provide a distraction-free testing environment
- **Visual Style:**
    - Compact, minimal design

#### 1.2 Practice Feed

The Practice Feed displays Module Cards that represent available learning modules.

**Wireframe Description:**

- **Layout:** A vertically scrolling list of Module Cards.
- **Header:** "Practice Feed" title at the top.
    - `+` Button on the right side of the header to open the Create Module Page
- **Module Cards:** Each card displays:
    - Module Name (prominently at the top of the card)
    - Status Indicators:
        - Last reviewed date
        - Next review date
        - Each status is rendered as a chip
    - "Start Quiz" button to launch the Quiz Session for the most recently generated quiz
    - "Generate Quiz" button to open the Quiz Generation Modal
    - "Review Submissions" button to review previous quiz submissions
- **Visual Hierarchy:**
    - Module Cards are visually distinct and easily scannable
    - Modules due for review are subtly highlighted using color or slight elevation
    - Past-due modules receive additional visual emphasis

#### 1.3 Module Explorer

The Module Explorer provides quick access to all modules, their contents, and settings.

**Wireframe Description:**

- **Layout:** Fills the Left Sidepane
- **Visibility:** Available on all pages except during Quiz Sessions
- **Header:** "MODULE EXPLORER" title
    - Menu button with options:
        - "Create Library"
        - "Create Module"
- **Library Organization:**
    - Libraries are listed as top-level items
    - Each library is collapsible
    - Library items show:
        - Library name
        - Expand/collapse indicator
        - Module count badge
    - Right-clicking a library opens a context menu with:
        - "View Library" (navigate to library page)
        - "Copy Library Id" (copy slug to clipboard)
        - "Open Folder" (opens library directory)
        - "Delete Library" (prompts user to delete)
- **Learning Paths:**
    - Displayed under their parent library
    - Each path shows:
        - Path name
        - Progress indicator
        - Expand/collapse indicator
    - Right-clicking a path opens a context menu with:
        - "View Path" (navigate to path page)
        - "Copy Path Id" (copy slug to clipboard)
        - "View Progress" (opens progress modal)
        - "Delete Path" (prompts user to delete)
- **Module List:** A vertically scrolling list of all modules.
    - Each module is represented by its name.
    - Standalone modules are directly under libraries
    - Path modules are indented under their learning path
    - Clicking a module name navigates to that module's page
    - When right-clicking a module name, a context menu appears with the following options:
        - "View Module" (navigate to the module's page).
        - "Copy Module Id" (copy the module's ID to the clipboard).
        - "Copy Module Path" (copy the module's path to the clipboard).
        - "Open Folder" (opens the module's directory in the file explorer).
        - "Delete Module" (prompts user to delete the module).

### Module Page

The Module Page provides a dedicated interface for viewing and managing a single module's content and quizzes.

**Wireframe Description:**

- **Layout:** Full-page view that replaces the Dashboard, with the Left Sidepane containing Module Explorer on the left side.
- **Header:**
    - Module title
    - "Back to Dashboard" button
    - "Generate Quiz" button (opens Quiz Generation Modal)
    - "Generate Lesson" button (opens Lesson Generation Modal)
- **Module Controls:**
    - Menu with options:
        - "Create Quiz"
        - "Edit Quizzes"
        - "View Details" (opens Module Details Modal)
- **Content Sections:**
    - **Module Overview:**
        - Descriptive text summarizing the module content
        - Displayed prominently above the quiz content
    - **Learning Progress Indicator:**
        - Compact visual indicator showing current mastery level
        - Next review date
        - Provides immediate context without requiring users to look at the sidebar
    - **Active Lesson Card** (if exists):
        - Lesson progress indicator
        - "Continue Lesson" button
        - "Delete Lesson" button
    - **Quizzes Grid:**
        - Grid layout of quiz cards showing:
            - Quiz name/number
            - Question count
            - Date created
            - "Start Quiz" button
    - **Recent Submissions:**
        - Table showing recent quiz attempts
        - Columns for quiz name, attempt number, date, and score
        - "View All" link to access full submission history

#### Module Details Modal

The Module Details Modal provides a detailed view of module information and statistics.

**Wireframe Description:**

- **Layout:** Modal dialog that overlays the current view
- **Visibility:** Appears when "View Details" option is selected from the module menu
- **Header:** "MODULE DETAILS" title
- **Content Sections:**
    - **Mastery Information:**
        - Natural language mastery level (e.g., "Beginner" instead of "Box 1/5")
        - Small visual indicator of current mastery level
        - Last reviewed date
        - Next review due date
    - **Module Information:**
        - Created date
        - Last updated date
        - Quiz count
        - Submission count
    - **Source Files:**
        - Simple list of source files with appropriate icons
        - Each file is clickable to open with the system default application
        - File names are truncated if too long with full path shown on hover
- **Visual Style:**
    - Compact, information-dense layout
    - Clear visual hierarchy with section headings
    - Subtle dividers between content sections

### Lesson Interface

The Lesson Interface provides a focused environment for working through generated lessons.

**Wireframe Description:**

- **Layout:** Component occupies main content area
- **Header:**
    - Module name
    - "Exit Lesson" button (returns to Module Page)
    - Progress indicator showing current unit / total units
- **Learning Unit Display:**
    - **Content Section:**
        - Text content with clear typography
        - Support for code blocks and basic formatting
    - **Questions Section:**
        - Multiple choice or written response questions
        - Submit button for answers
        - Immediate feedback display
- **Navigation:**
    - "Previous Unit" button (disabled on first unit)
    - "Next Unit" button (enabled after answering questions)
    - Unit progress dots for quick navigation

### Lesson Generation Modal

The Lesson Generation Modal provides options for creating customized lessons.

**Wireframe Description:**

- **Layout:** Modal dialog overlaying current view
- **Header:** "Generate New Lesson"
- **Content:**
    - Warning about replacing existing lesson (if one exists)
    - Focus instructions text area
    - Token usage indicator
- **Footer:**
    - "Generate" button (with loading state)
    - "Cancel" button

### Library View

The Library View provides access to learning paths and standalone modules within a specific library.

**Wireframe Description:**

- **Layout:** Full-page view that replaces the Dashboard
- **Header:**
    - Library name
    - "Back to Dashboard" button
    - Search/filter input
- **Content:**
    - **Learning Paths Section:**
        - Grid of learning path cards showing:
            - Path title
            - Progress indicator
            - Module count
            - "View Path" button
    - **Standalone Modules Section:**
        - Grid of module cards showing:
            - Module title
            - Last accessed date
            - "View Module" button

### Learning Path Page

The Learning Path Page provides a dedicated interface for viewing and managing learning paths.

**Wireframe Description:**

- **Layout:** Full-page view that replaces the Dashboard
- **Header:**
    - Path title
    - Associated library name
    - "Back to Library" button
- **Content:**
    - **Progress Overview:**
        - Visual progress bar
        - Completed modules count
        - Unlocked modules count
    - **Module Sequence:**
        - Ordered list of module cards showing:
            - Module title
            - Lock/unlock status
            - Completion status
            - Prerequisites
            - "View Module" button (if unlocked)

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
    - Library selection:
        - Dropdown of existing libraries
        - "Create New Library" button (opens Create Library Modal)
        - Preview of selected library path
    - List of source files:
        - Each source with size/length
        - Visualization of total token usage

- **Footer:**
    - "Create Module" button (enabled when library is selected)
    - "Back" button
    - "Cancel" button

#### Create Library Modal

A simple modal dialog for creating new libraries.

- **Header:** "Create New Library"

- **Content:**

    - Library name input field
    - "Select Location" button (opens system file picker)
    - Display of selected path

- **Footer:**

    - "Create Library" button (enabled when name and path are set)
    - "Cancel" button

- **Behavior:**
    - Upon creation, library is automatically:
        - Created at the specified path
        - Added to app's internal library registry
        - Selected in the parent Module Creation Review view

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
    - The Left Sidepane is completely hidden during quiz sessions
    - No navigation elements except exit button
    - Focuses entirely on quiz content
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
- **Side Pane:**
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
    - "Grade Submission" button (with loading state)
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
        - Visual feedback during grading
            - Loading indicator on grade button

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

### Learning Path Creation Wizard

The Learning Path Creation Wizard provides a dedicated full-screen interface for creating new learning paths.

**Wireframe Description:**

- **Layout:** Full-screen interface that replaces the Dashboard
- **Header:**
    - "Create New Learning Path" title
    - "Back to Dashboard" button (top-left corner)

#### Path Configuration View

- **Header:**

    - "Configure Learning Path" title
    - Action buttons in top-right:
        - "Save Path" button
        - "Cancel" button

- **Main Content Area:**

    - **Path Details Section:**
        - Path title input field
        - Path description text area
        - Library selection dropdown
    - **Module Sequence Section:**
        - Ordered list of module slots
        - Each slot shows:
            - Module selection dropdown
            - Prerequisites configuration
            - Remove button (×)
        - "Add Module" button at bottom of list
    - **Preview Panel:**
        - Visual representation of module sequence
        - Shows dependencies between modules
        - Highlights any configuration issues

- **Footer:**
    - "Create Path" button (enabled when configuration is valid)
    - "Cancel" button

### Lesson Summary View

The Lesson Summary View provides a completion overview when a user finishes all units in a lesson.

**Wireframe Description:**

- **Layout:** Full-screen interface that replaces the Lesson Interface
- **Header:**

    - "Lesson Complete!" title
    - Module name
    - "Exit to Module" button (top-right)

- **Content Sections:**

    - **Performance Overview:**
        - Total units completed
        - Correct answers percentage
        - Time spent on lesson
    - **Unit Breakdown:**
        - Scrollable list of completed units showing:
            - Unit number/title
            - Questions attempted
            - Correct/incorrect indicators
            - Option to review specific units
    - **Key Takeaways:**
        - AI-generated summary of main concepts covered
        - Areas for improvement based on question responses
    - **Next Steps:**
        - "Take a Quiz" button
        - "Return to Module" button
        - "Start New Lesson" button (generates new lesson)

- **Visual Elements:**
    - Celebratory animation on load
    - Progress visualization (e.g., circular completion indicator)
    - Color-coded performance indicators

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

4. **Reviewing Module Details:**

    - User navigates to a module from the Module Explorer.
    - Module Details section appears in the Left Sidepanel below the Module Explorer.
    - User can view:
        - Current mastery level and review schedule
        - Module metadata (creation date, etc.)
        - List of source files
        - Quiz and submission counts
    - User can click on source files to open them with the system's default application.

5. **Reviewing Submissions:**

    - User navigates to the Module Page.
    - User views recent submissions in the Recent Submissions section.
    - User can click "View All" to see all submissions for the module.
    - User can click "View Details" on any submission to see:
        - Individual questions and answers
        - Feedback and scoring
        - Overall performance

6. **Adjusting Settings:**
    - User clicks the "Settings" button in the Module Explorer.
    - Settings Panel opens.
    - User navigates through tabs to adjust preferences or configure AI providers.
    - Settings are saved automatically, no option to save changes.

---

## Conclusion

This design document provides a comprehensive overview of the Noggin desktop application's UI/UX. By focusing on a clean, intuitive interface and straightforward user flows, Noggin aims to provide a seamless and effective learning experience. The local-first, modular design ensures that users remain in control of their learning journey, fostering a transparent and personalized educational environment.
