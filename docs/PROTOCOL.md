### Noggin: A Lightweight Protocol for Modular Learning

#### **Introduction**

Noggin is a self-directed learning tool built around modularity, adaptability, and simplicity. Each module is a self-contained learning unit that dynamically adapts to user progress while preserving prior states for exploration or rollback. By combining spaced repetition, AI-driven question generation, and user-defined structures, Noggin provides a system for effective, engaging, and lifelong learning.

This document outlines the Noggin protocol, focusing on the hierarchical module design, adaptive question generation, progress tracking, and versioning system.

---

### **Objectives of the Protocol**

1. **Simple and Scalable**: Ensure a streamlined, lightweight approach to modular learning.
2. **Modular Hierarchies**: Support hierarchical nesting of modules and submodules.
3. **Human-Readable Design**: Store all data in accessible formats like JSON for transparency and compatibility with version control systems.
4. **User-Driven Scheduling**: Allow users to manage learning schedules through clear, non-intrusive interfaces.
5. **Adaptive Learning**: Dynamically generate questions tailored to user weaknesses and knowledge gaps.
6. **Spaced Repetition**: Enable long-term mastery through well-timed topic revisits.
7. **Preservation and Flexibility**: Maintain progress through a robust versioning system while allowing clean slates when needed.

---

### **Module Structure and Organization**

#### **Directory Structure**

Modules are stored in directories named with AI-generated slugs (snake_case: lowercase letters, numbers, and underscores). These slugs are also used to identify questions and extracted content.

Example:

```
intro_to_physics/         # Module directory
├── .mod/                 # Metadata and state for the module
│   ├── outline.json      # Topic map for learning and question generation
│   ├── questions/        # Bank of AI-generated questions
│   │   ├── bicycle_problem.json
│   │   ├── rod_cutting_1.json
│   │   ├── rod_cutting_2.json
│   ├── submissions.json  # User submissions to questions
│   ├── progress.json     # Tracks user progress
│   ├── extracts/         # Extracted content from sources
│   │   ├── laws_of_physics.txt
│   ├── versions/         # Archived snapshots of previous states
│   │   ├── 1/
│   │   ├── 2/
├── lecture_notes.pdf     # User-provided source material
├── examples/             # User-organized content (not treated as a submodule)
│   ├── example_problem1.pdf
└── advanced_concepts/    # Submodule with its own `.mod/`
    ├── .mod/
```

#### **Rules for Submodules**

-   Any directory containing a `.mod/` folder is treated as a **submodule** and managed independently.
-   Submodules are isolated from their parent modules, with separate outlines, questions, progress, and versions.
-   Nested directories without a `.mod/` folder (e.g., `examples/`) are not treated as submodules and do not affect module progress.

#### **Source Material**

-   Users can organize source material freely alongside the `.mod/` folder. For example, source files can be stored directly or grouped into subdirectories like `examples/`.
-   Extracted content from sources is saved in `.mod/extracts/` and named with AI-generated slugs based on their contents.

---

### **Key Features**

#### **1. Adaptive Question Generation**

-   The **outline.json** file defines the topic structure of the module. It acts as a map guiding AI-driven question generation.
-   Questions are dynamically created and saved in `.mod/questions/` as individual JSON files, each named with an AI-generated slug.
-   Question generation evolves based on:
    -   Gaps in the outline (topics with low coverage).
    -   Weak areas identified through user performance in `progress.json`.

#### **2. Progress Tracking**

-   **submissions.json** records user answers, which are used to update `progress.json`.
-   Progress is measured in tiers (e.g., Novice → Intermediate → Advanced → Master) at the topic level.
-   Mastery of a topic requires answering a defined number of questions correctly.

#### **3. Spaced Repetition**

-   The system uses spaced repetition to schedule topic reviews at increasing intervals.
-   Users can view their personalized schedule to plan learning sessions, with example entries like:
    ```
    Newton's Laws: Review in 3 days
    Linear Algebra: Review in 7 days
    ```
-   Tasks are locked until their review dates to ensure adherence to the repetition schedule.

#### **4. Versioning System**

-   Updates to a module’s source material or outline create a new version.
-   The current state of `.mod/` is archived in `versions/` as a numbered folder (e.g., `1/`, `2/`).
-   Each version stores:
    -   A snapshot of `outline.json`, `questions/`, `progress.json`, and `extracts/`.
-   Users can:
    -   View all prior versions in `versions/`.
    -   Switch between versions to reclaim progress.
    -   Create a **fresh version** (a clean slate based on an older version).

#### **5. Fresh Versions**

-   A "fresh version" resets questions and progress while retaining the outline and extracted content from a selected version.
-   The current `.mod` is archived as a new version, and the fresh version becomes the active state.

---

### **Naming Conventions**

-   **Slugs**: All identifiers for modules, questions, and extracts are AI-generated using snake_case format.
    -   Examples: `intro_to_physics`, `bicycle_problem`, `laws_of_physics`.
-   **Modules**: Directories are named using AI-generated slugs based on their primary topic.
-   **Questions and Extracts**: Files are named using slugs generated from their contents.

---

### **Learning Flow**

1. **Create a Module**:

    - Users organize source material in a directory. Extracted content is saved in `.mod/extracts/`, and the topic outline is generated in `.mod/outline.json`.

2. **Progress Through Questions**:

    - The app dynamically generates questions based on the outline.
    - Users answer questions, and progress is tracked in `.mod/progress.json`.

3. **View Schedules**:

    - Users view their spaced repetition schedule and follow review prompts to ensure long-term retention.

4. **Update Modules**:

    - Users can modify source material or the outline. The app detects changes and prompts users to create a new version.

5. **Explore Versions**:
    - Users browse previous versions via the `versions/` folder, reclaiming progress or starting fresh if needed.

---

### **Conclusion**

Noggin's protocol emphasizes modularity, adaptability, and simplicity. Its lightweight design supports dynamic learning without overwhelming users, ensuring both flexibility and longevity. By combining structured versioning, adaptive questions, and spaced repetition, Noggin creates an effective system for lifelong learning.
