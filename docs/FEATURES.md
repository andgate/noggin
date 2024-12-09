# Noggin Desktop Application

Noggin is a modular, self-directed learning desktop app built with Electron, React, and Mantine. It is designed to provide a streamlined and intuitive experience for learners, encouraging them to study topics through locally stored modules and quizzes.

## Core Principles

-   **Local-First**: All modules, quizzes, and submissions are stored locally on the user’s machine for complete transparency and control.
-   **Modular Design**: Each module stands alone, containing sources, quizzes, and submissions. Users choose what to learn without being constrained by any hierarchy.
-   **User-Driven Practice**: A feed-driven interface helps surface modules due for review. Users decide when and what to study based on their own goals and comfort.

---

## Core Features

### Practice Feed

The Practice Feed is the heart of the Noggin interface, guiding users through their study sessions.

-   **Module Cards**:
    Each loaded module appears as a card in the feed, showing its name and overall status.
-   **Simple Prioritization**:
    Modules are highlighted based on factors like time since last review, encouraging natural spaced repetition. There are no forced schedules—users remain in control.

-   **Focus and Flexibility**:
    With a single click, users can open a quiz from a chosen module or review their past submissions.

---

### Module Management

Modules represent individual subjects or topics. Each module’s data is stored locally for easy review and editing.

-   **Sources**:
    Users add source materials (e.g., PDFs or text files) directly to the module folder.

-   **Quizzes**:
    Quizzes derived from these sources reside in `.mod/quizzes/`. They serve as stable assessments for the module’s content. Questions are multiple-choice or written response, ensuring clarity and consistency.

-   **Submissions**:
    Each quiz attempt is recorded as a submission in `.mod/submissions/`. This allows users to track their progress over time.

---

### Quiz Mode

Quiz Mode provides a focused environment for practicing and testing knowledge:

-   **Full-Screen View**:
    The quiz interface is minimal and distraction-free, helping users concentrate on the questions.

-   **Question Types**:
    Supports multiple-choice (A-D) and open-ended written responses.

-   **Progress Tracking Through Submissions**:
    Each completed quiz attempt is saved, giving learners a clear record of their performance and areas that may need further study.

---

### Module Explorer

The Module Explorer is accessible from a collapsible side panel, helping users organize and navigate their modules:

-   **Clear Module List**:
    All modules are displayed as an easy-to-scan list. Users can open a module’s folder, inspect sources, and view quizzes and submissions.

-   **Quick Access**:
    Jump directly into a quiz or review past submissions without leaving the main application interface.

---

### Settings Panel

The Settings Panel offers straightforward customization options:

-   **Appearance & Preferences**:
    Users can adjust the app’s theme, interface layout, and other basic preferences.
-   **AI Providers**:
    Manage API keys and integrations with external AI services for content extraction and quiz generation.

-   **Backup & Import**:
    Export and import modules and their data, ensuring that users can maintain their learning records over time.

---

### Module Creation

The Module Creation workflow enables users to build new modules tailored to their learning needs:

1. **Add Source Materials**:
   Drag and drop PDFs, text, or other content files into the new module’s directory.
2. **Generate Quizzes**:
   Use integrated AI providers to create quizzes from the provided sources. The quizzes are stored locally and can be practiced immediately.

3. **Practice & Track**:
   Start using the new module right away. Over time, submissions accumulate, painting a detailed picture of the user’s progress.

---

## User Workflows

1. **Studying a Module**:
   Open the Practice Feed, choose a module card, and start a quiz. View submissions anytime to understand growth and areas for improvement.

2. **Managing Modules**:
   Use the Module Explorer to adjust sources, review quizzes, or look at past submissions. Everything is in one place, locally stored, and visible.

3. **Creating a Module**:
   Add source materials, create quizzes, and begin practicing. Tailor content to your interests or learning goals without external constraints.

4. **Adjusting Settings**:
   Open the Settings Panel to tweak appearance, manage AI keys, or import/export modules as needed.

---

## Technical Details

-   **Electron**:
    Cross-platform desktop framework for building native applications.

-   **React 18 & Mantine v7**:
    Modern UI components ensuring a responsive and intuitive user experience.

-   **TanStack Query**:
    Efficient state management and data fetching for smooth navigation and instant updates.

-   **electron-vite**:
    Fast and reliable bundling for quick startup times and easy development.

---

## Conclusion

This updated features set places the user at the center, providing a local-first, modular, and transparent learning environment. By simplifying the structure, removing unnecessary complexities, and focusing on straightforward workflows, Noggin empowers learners to guide their own educational journey confidently and effectively.
