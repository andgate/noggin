# Noggin

### Overview

**Noggin** is a desktop application designed as a streamlined, AI-powered tool for students to create, manage, and take quizzes. Built with **Electron**, **React**, and **TypeScript**, Noggin enables users to manually create quizzes or leverage **OpenAI's GPT-4o** model for generating and evaluating questions based on user-provided study material. With a minimalist and user-friendly interface, Noggin emphasizes efficient study, interactive learning, and progress tracking.

### Key Features

1. **Quiz Creation and Management**

    - Users can create quizzes by manually adding questions or using AI to generate them from study material.
    - Supports two question types:
        - **Multiple-Choice Questions**: Limited to four answer options.
        - **Written Response Questions**: Open-ended for free-form answers.
    - Users can manage their quizzes, including adding, editing, and deleting entries.
    - Quizzes can be personalized by defining the number of questions, question types, and optional time limits.

2. **AI-Powered Quiz Generation**

    - Integrates **OpenAI's GPT-4o** model to generate multiple-choice and written questions from:
        - **Pasted Text**: Transform any text into a quiz.
        - **Uploaded Files**: Supports PDFs, EPUBs, HTML, .docx, and plain text files.
        - **Web URLs**: Fetches content directly from webpages for quiz generation.
    - Questions are generated in batches, providing real-time updates in the UI.

3. **Practice Mode**

    - Users can take quizzes in practice mode to familiarize themselves with the material.
    - Practice mode provides a focused environment, presenting all questions on a single page for easy navigation.
    - Tracks user responses and allows submission upon completion.

4. **AI-Driven Submission Evaluation**

    - Quizzes are graded using **OpenAI's GPT-4o**, providing:
        - **Detailed Feedback**: Insightful feedback for written responses.
        - **Scoring**: Calculated scores for multiple-choice and written questions.

5. **Submission History and Analysis**

    - Stores all completed quizzes, user responses, and feedback in a local database.
    - Enables users to track progress and review past performance.

6. **User-Friendly Interface**
    - Built with **Mantine components**, offering a clean and responsive design.
    - A minimal layout reduces distractions, focusing on effective study.

### Technical Details

1. **Application Architecture**

    - **Electron**: Provides a cross-platform desktop environment.
    - **React**: Frontend framework for building a modular and dynamic UI.
    - **TypeScript**: Ensures robust type safety across the codebase.

2. **Database and Data Management**

    - **SQLite**: Local database for storing quizzes, questions, submissions, and user settings.
    - **Drizzle ORM**: Handles database interactions with a clean and concise API.
    - **Drizzle Kit**: Manages migrations for database schema updates.

3. **Inter-Process Communication (IPC)**

    - Electron's IPC mechanism facilitates communication between the main process (database and backend logic) and the renderer process (frontend/UI).

4. **Local Storage**

    - User settings, such as the OpenAI API key, are securely stored using Electron's `app.getPath('userData')`.

5. **OpenAI Integration**

    - **OpenAI API**: Powers question generation and grading, requiring users to provide their own API key.

6. **Code Structure**
    - Follows a modular architecture:
        - `main`: Electron main process logic.
        - `preload`: Bridge for secure communication between the main and renderer processes.
        - `renderer`: React-based UI components and application logic.

### MVP Scope

1. **Core Functionalities**

    - **Quiz Creation**: Users can manually create quizzes or generate them using AI.
    - **AI-Powered Generation**: Supports multiple data sources for input.
    - **Quiz Taking**: Allows users to navigate freely and submit quizzes for evaluation.
    - **Submission Evaluation**: Provides feedback and scoring for completed quizzes.
    - **Basic Management**: Enables users to view, edit, and delete quizzes.

2. **UI Features**
    - **Homepage/Dashboard**:
        - Displays a list of created quizzes with details such as title, number of questions, and creation date.
        - Provides quick actions for starting, editing, or deleting quizzes.
    - **Create Quiz Page**:
        - Input fields for study content, file uploads, or URLs.
        - Options for specifying question types and quiz length.
        - Real-time preview of AI-generated questions.
    - **Practice Page**:
        - All questions displayed on a single page.
        - Intuitive navigation with scrolling and smooth transitions.
        - Submission button for grading and feedback.
    - **Grading Page**:
        - Displays overall scores and detailed feedback for each question.
        - Options to retake the quiz, create a new quiz, or return to the dashboard.

### Features in Development

-   **Partial Form Saving**: Prevent data loss during quiz creation.
-   **Quiz Timer**: Time quizzes for practice mode.
-   **Detailed Analytics**: Visualization of submission statistics and performance trends.
-   **Theme Switching**: Customizable themes for light and dark mode.
-   **Advanced Feedback**: More granular insights into responses.

### Future Directions

Noggin's MVP lays the foundation for a robust and engaging study tool. Future iterations will incorporate advanced analytics, enhanced quiz customization options, and additional study aids to create a comprehensive learning platform. By focusing on user feedback and iterating on the MVP, Noggin aims to become an indispensable tool for personalized and interactive learning.
