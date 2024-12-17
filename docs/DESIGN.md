# Noggin Desktop Application: UI/UX Design Document

**Author**: Gabriel Anderson
**Date**: December 12, 2024

---

## Introduction

This document outlines the User Interface (UI) and User Experience (UX) design for the Noggin desktop application. Noggin is a modular, self-directed learning platform that empowers users to manage their learning journey through locally stored modules and quizzes. The design prioritizes simplicity, transparency, and user control, adhering to a local-first and modular approach.

---

## Main Components

### 1. Dashboard

The Dashboard is the primary interface users interact with upon launching Noggin. It consists of two main sections: the Practice Feed and the Module Explorer sidebar.

#### 1.1 Practice Feed

The Practice Feed is the central area of the Dashboard, displaying Module Cards that represent available learning modules.

**Wireframe Description:**

-   **Layout:** A vertically scrolling list of Module Cards.
-   **Header:** "Practice Feed" title at the top.
    -   `+` Button on the right side of the header to initiate the Module Creation Wizard
-   **Module Cards:** Each card displays:
    -   Module Name (prominently at the top of the card)
    -   Status Indicators (e.g., last reviewed date, number of quizzes available). Each status is rendered as a chip.
    -   "Start Quiz" button to launch the Quiz Mode for a random quiz from the selected module.
    -   "Review Submissions" button to review previous quiz submissions in the selected module.
-   **Visual Hierarchy:** Module Cards are visually distinct and easily scannable. Prioritized modules (e.g., due for review) are subtly highlighted using color or slight elevation.

#### 1.2 Module Explorer (Sidebar)

The Module Explorer is a collapsible sidebar that provides quick access to all modules, their contents, and settings.

**Wireframe Description:**

-   **Layout:** A narrow, vertically oriented panel on the left side of the Dashboard.
-   **Collapsible:** A toggle button (e.g., hamburger icon or chevron) allows users to expand or collapse the sidebar.
    -   When the sidebar is closed, only the toggle button is visible
-   **Header:** "Module Explorer" title when expanded.
-   **Module List:** A vertically scrolling list of all modules.
    -   Each module is represented by its name.
    -   Clicking a module name expands it to show:
        -   "Open Folder" button (opens the module's directory in the file explorer).
        -   "View Quizzes" button (lists available quizzes for the module, allowing direct launch).
        -   "View Submissions" button (lists past submissions for the module, allowing review).
-   **Settings:** A "Settings" button at the bottom of the sidebar opens the Settings Panel.

### 2. Quiz Mode

Quiz Mode provides a focused, full-screen environment for taking quizzes.

**Wireframe Description:**

-   **Layout:** Full-screen, minimal, and distraction-free.
-   **Header:**
    -   Module Name displayed at the top.
    -   Quiz Name (or number) displayed below the module name.
    -   "Exit" button (e.g., "X" icon) to return to the Dashboard.
-   **Question Area:**
    -   Current question number and total number of questions (e.g., "Question 3/10").
    -   Question text displayed prominently.
    -   Answer options:
        -   For multiple-choice: Radio buttons labeled A, B, C, D.
        -   For written response: A text input field.
-   **Navigation:**
    -   "Previous" button (disabled on the first question).
    -   "Next" button.
    -   "Submit" button (becomes active when all questions are answered).

### 3. Settings Panel

The Settings Panel allows users to customize the app and manage AI provider integrations.

**Wireframe Description:**

-   **Layout:** A modal dialog that overlays the Dashboard, centered on screen.
-   **Tabs:**
    -   **General:**
        -   Theme selection (light/dark/system).
        -   Font size adjustment.
        -   Option to change modules root directory
    -   **AI Providers:**
        -   Input fields for API keys.
        -   Dropdown to select active AI provider for text extraction.
        -   Dropdown to select active AI provider for quiz generation.
        -   Dropdown to select active AI provider for quiz grading.
        -   "Test Connection" button for each provider.
-   **Navigation:**
    -   "Save" button to apply changes.
    -   "Cancel" button to discard changes and close the panel.

### 4. Module Creation Wizard

The Module Creation Wizard guides users through creating and saving a new module.

**Wireframe Description:**

-   **Layout:** A modal dialog that overlays the Dashboard.
-   **Step 1: Source Selection**
    -   **Title:** "Select Source Materials"
    -   **Instructions:** "Choose files to create your module"
    -   **Button:** "Choose Files" (opens file selection dialog)
    -   **List:** Shows selected source files
    -   **Generate** button becomes active when files are selected
-   **Step 2: Generation**
    -   **Title:** "Analyzing Content..."
    -   **Progress Bar:** Shows analysis progress
    -   **Status Messages:** Updates on current task:
        -   "Analyzing source materials..."
        -   "Generating module title..."
        -   "Creating content overview..."
-   **Step 3: Review & Save**
    -   **Title:** "Review Module Details"
    -   **Display:**
        -   Generated module title
        -   Generated overview
        -   Preview of folder slug
        -   List of included source files
    -   **Save Button:** Creates module directory and saves files
    -   **Edit Button:** Allows manual adjustment of title/overview
    -   **Cancel Button:** Aborts creation process

### 5. Quiz Generation Wizard

The Quiz Generation Wizard helps users create quizzes from the source materials in a module.

**Wireframe Description:**

-   **Layout:** A dedicated full-page view that replaces the Dashboard.
-   **Step 1: Configure Quiz**
    -   **Title:** "Generate Quiz"
    -   **Dropdown:** "Select Module" (lists all available modules).
    -   **Input:** "Number of Questions" (default: 10).
    -   **Checkboxes:**
        -   "Include Multiple Choice Questions"
        -   "Include Written Response Questions"
    -   "Next" button
-   **Step 2: Generation**
    -   **Title:** "Generating Quiz..."
    -   **Progress Bar:** Shows the progress of quiz generation.
    -   **Status Message:** Shows current generation stage.
-   **Step 3: Completion**
    -   **Title:** "Quiz Generated"
    -   **Message:** "Your quiz has been saved to the module."
    -   **Button:** "Done" (returns to the Dashboard).

### 6. Quiz Grading Interface

The Quiz Grading Interface provides a dedicated full-screen view for reviewing quiz results and feedback.

**Wireframe Description:**

-   **Layout:** Full-screen interface that replaces Quiz Mode after submission
-   **Header Bar:**
    -   Module name and quiz identifier
    -   Submission timestamp
    -   Overall score display
    -   "Back to Dashboard" button
    -   "Export Results" button
-   **Question Review Area:**
    -   Scrollable main content area
    -   Each question card shows:
        -   Question text and type
        -   User's answer (highlighted)
        -   Correct answer (for multiple choice)
        -   AI-generated feedback explaining the evaluation
        -   Score/points awarded
    -   Clear visual separation between questions
-   **Side Panel:**
    -   Quick-jump navigation to specific questions
    -   Question status indicators (correct/incorrect)
    -   Progress summary

## User Flows

1. **Creating a Module:**

    - User clicks the `+` button on the main practice feed Dashboard.
    - Module Creation Wizard launches.
    - User enters a module name.
    - User adds source materials via file selection.
    - User chooses whether to generate quizzes immediately or later.
    - Module is created and appears in the Module Explorer and Practice Feed.

2. **Generating Quizzes:**

    - User right-clicks a module in the Module Explorer.
    - User selects "Generate Quizzes".
    - Quiz Generation Wizard launches.
    - User selects configuration options.
    - Quizzes are generated using the AI provider.
    - Generated quizzes are saved to the module and are immediately available.

3. **Taking a Quiz:**

    - User selects a Module Card in the Practice Feed.
    - User clicks "Start Quiz".
    - Quiz Mode launches in full-screen.
    - User answers questions.
    - User clicks "Submit".
    - The submission is saved, and the user is returned to the Dashboard.

4. **Reviewing Submissions:**

    - User selects a Module Card in the Practice Feed.
    - User clicks "Review Submissions"
    - The Dashboard transitions to the Submissions Review view, listing all previous submissions for the module.
    - User selects a submission to view details (questions, answers, feedback).

5. **Adjusting Settings:**
    - User clicks the "Settings" button in the Module Explorer.
    - Settings Panel opens.
    - User navigates through tabs to adjust preferences or configure AI providers.
    - User clicks "Save" to apply changes.

---

## Conclusion

This design document provides a comprehensive overview of the Noggin desktop application's UI/UX. By focusing on a clean, intuitive interface and straightforward user flows, Noggin aims to provide a seamless and effective learning experience. The local-first, modular design ensures that users remain in control of their learning journey, fostering a transparent and personalized educational environment.
