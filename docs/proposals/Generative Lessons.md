# Proposal: Generative Lessons for Noggin

## Overview

**Generative Lessons** introduce a structured, interactive, and guided way for users to learn module content in Noggin. Lessons act as a temporary, one-time walkthrough designed to help users familiarize themselves with challenging topics or prepare for quizzes. Lessons are built from "Learning Units," which consist of bite-sized content followed by comprehension questions.

Lessons are persistent until a new lesson is generated or the user chooses to reset or delete them, emphasizing introduction and understanding, with minimal long-term data storage or tracking.

---

## Core Principles

1. **Purpose-Driven**: Lessons are designed to help users transition into quizzes. They provide a foundation of understanding, ensuring users can engage effectively with the spaced repetition system.
2. **Single Active Lesson**: Only one lesson is stored per module at a time. Generating a new lesson overwrites the current lesson with a clear warning to the user, but the lesson itself remains until explicitly changed or removed.
3. **Interactive**: Lessons are split into multiple pages (Learning Units) to keep the user engaged and focused.
4. **Customization**: Users can provide specific focus instructions during lesson generation to tailor the content to their needs.
5. **Lightweight**: Lessons are not graded, and user responses are discarded after the session.

---

## Key Features

### Structure

- A **lesson** is composed of a sequence of **Learning Units**:
    - **Learning Unit**: A text-based explanation or excerpt from the module followed by comprehension questions.
    - Progression is **linear**, with users moving through units one at a time.
- Lessons include:
    - A **progress tracker** (e.g., dots or percentages).
    - Visual separation of content and questions to maintain focus.

### Lesson Generation

- **Automated Creation**: Lessons are AI-generated based on module source content.
- **User Input**:
    - Users can provide specific focus instructions (e.g., "Focus on Newtonian physics - work").
- **Single File Storage**: The state of the lesson, including submissions and progress, is stored in a single `lesson.json` file, simplifying data management and retrieval.

### User Interaction

- Users interact with lessons in a card-based format, emphasizing simplicity and readability.
- Each Learning Unit:
    - Displays text content (limited to one unit at a time).
    - Presents questions to evaluate comprehension.
- Feedback is provided after users complete the questions for each unit:
    - Correctness of answers.
    - Brief explanations to clarify misconceptions.

### Completion

- Upon finishing a lesson, the user is prompted to proceed with quizzes. Lessons do not track long-term statistics or progress, reinforcing their role as a preparatory tool.

---

## Technical Implementation

### Lesson Data Schema

A lesson is represented as a simple JSON object, which now includes the state of the lesson:

```json
{
    "title": "Introduction to Newtonian Physics - Work",
    "units": [
        {
            "text": "Work is defined as the transfer of energy...",
            "questions": [
                {
                    "type": "multiple_choice",
                    "question": "Which of the following defines work?",
                    "options": [
                        "Force x Distance",
                        "Mass x Acceleration",
                        "Energy x Time",
                        "Distance / Time"
                    ],
                    "correct_answer": "Force x Distance"
                }
            ],
            "progress": {
                "completed": false,
                "user_answers": []
            }
        }
    ],
    "progress": {
        "current_unit": 0,
        "completed_units": []
    }
}
```

### Generation Process

1. **Source Input**: The AI receives the module's source content and any user-provided focus instructions.
2. **Output**: The AI generates a JSON lesson structure, dividing content into logical units with corresponding questions.
3. **Saving**: The lesson, along with its state, is saved in `.mod/lesson.json`.

### Transience

- Only one lesson is stored per module.
- Generating a new lesson overwrites the existing lesson:
    - Users are notified with a confirmation prompt.
- The lesson's state, including progress and submissions, is maintained in `lesson.json`, ensuring all relevant data is easily accessible and manageable until a new lesson is created or the user decides to reset or delete it.

---

## UX/UI Design

### Visual Design

1. **Card-Based Layout**:
    - Each Learning Unit is presented as a card.
    - Users interact with one unit at a time to reduce cognitive load.
2. **Progress Indicator**:
    - Dots, bars, or a percentage tracker show lesson completion status.
3. **Interactive Feedback**:
    - Immediate correctness feedback for questions.
    - Clear explanations to reinforce learning.

### Differentiation from Quizzes

- Lessons:
    - Multi-page, card-based progression.
    - Focus on understanding rather than testing.
    - No grading or long-term tracking.
- Quizzes:
    - Single-page layout.
    - Emphasis on assessment and spaced repetition.
    - Graded and tracked in stats.

---

## Benefits

1. **Enhanced Accessibility**: Lessons provide an entry point for users struggling with quizzes or seeking guided introductions to module content.
2. **User Autonomy**: Customization options allow users to tailor lessons to their needs, focusing on specific areas of difficulty.
3. **Streamlined Workflow**: The single-file storage of lesson state ensures lessons do not clutter the user's learning experience or stats.
4. **Low Development Overhead**: A simple JSON schema and existing AI workflows make lessons easy to implement alongside quizzes.

---

## Next Steps

1. **Define Lesson Generation Parameters**:
    - Number of Learning Units.
    - Question difficulty and types.
2. **Implement Transient Storage**:
    - Add `.mod/lesson.json` for temporary lesson storage.
3. **Update UX/UI**:
    - Design and integrate card-based lessons with a progress tracker.
4. **AI Integration**:
    - Adapt current quiz generation prompts to support lessons.
    - Test AI outputs for lesson structure and coherence.

---

Generative Lessons align with Noggin's philosophy of empowering users through modular, user-driven learning tools. By offering a lightweight, guided alternative to quizzes, lessons enhance accessibility and ensure every user can confidently engage with their studies.
