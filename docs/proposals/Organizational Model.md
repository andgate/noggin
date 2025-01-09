**Noggin – Proposal for New Organizational Model**
_Prepared for: Noggin Development Team_
_Date: October 11, 2024_

---

### **Introduction**

This document proposes a new organizational model for Noggin to enhance scalability, user experience, and structured content management. The goal is to create a flexible yet intuitive hierarchy that allows users to organize their learning materials effectively, from standalone modules to complex multi-part courses.

By introducing **Libraries and Learning Paths,** this model preserves the simplicity of Noggin’s current module structure while offering deeper organizational tools when needed. This evolution aligns with Noggin’s philosophy of **open, file-driven content management** and expands its capacity for handling larger learning projects.

---

### **Overview of the New Organizational Model**

The new model introduces **two primary layers of scale** for organizing learning content:

1. **Libraries** – The top-level container for all user learning content.
2. **Learning Paths** – A structured, goal-driven way to organize multiple modules.

Modules remain the core building block, but they can exist independently or within learning paths. Learning Paths add **progression tracking and unlock mechanics,** while modules that exist outside learning paths are immediately accessible.

---

### **Key Components and Hierarchy**

1. **Modules** _(Atomic Learning Blocks – Lowest Level)_

    - Modules are the smallest unit of content—quizzes, PDFs, lessons, or practice tasks.
    - Modules can exist independently in the library or be grouped within learning paths.
    - Standalone modules are accessible immediately, while learning path modules respect progression and unlock states.
    - **Example Structure:**
        ```
        <library path>/
        ├── .lib/
        │   └── meta.json
        ├── Debugging101/
        └── SoftwareTestingBasics/
        ```

2. **Libraries** _(Global Scale – Top Level)_

    - The primary folder that holds all learning paths, standalone modules, and learning materials.
    - This folder contains a `.lib` subfolder for metadata, making it easy to import/export between devices or sync with cloud storage.
    - **Example Structure:**
        ```
        <library path>/
        ├── .lib/
        │   └── meta.json
        ├── Python for Beginners/ (Learning Path)
        ├── Algorithms and Data Structures/ (Learning Path)
        └── Random Tutorials/ (Standalone Modules)
        ```

3. **Learning Paths** _(Organized Learning Paths – Mid Level)_

    - Learning Paths contain collections of modules, creating a structured path for more comprehensive subjects.
    - They track progression, unlock modules sequentially, and manage how content feeds into the user’s daily practice queue.
    - Learning Paths exist as folders within the library, holding relevant modules and metadata.
    - **Example Structure:**
        ```
        <library path>/
        ├── .lib/
        │   └── meta.json
        ├── Python for Beginners/
        │   ├── .path/
        │   │   ├── meta.json
        │   │   └── progress.json
        │   ├── Module 1/
        │   └── Module 2/
        ```

---

### **User Experience Flow**

1. **Creating a New Learning Path:**

    - Users create a learning path folder in the Library through Noggin’s interface.
    - Modules must be created directly inside the learning path to associate them with the path.

2. **Managing the Practice Feed:**

    - **Modules from all libraries contribute to the practice feed.**
    - Users can manage their daily queue by selecting which libraries to include.
    - Modules appear in the practice feed based on mastery levels or spaced repetition algorithms.
    - Modules that are part of a learning path will only appear if they are unlocked, ensuring a structured learning path.

3. **Syncing and Portability:**
    - Users can back up or sync their entire Library folder, allowing easy import/export across devices.
    - New devices can load the entire learning collection by selecting the root Library folder.

---

### **Library Storage and Management**

- **Library List**: The application will maintain a list of library folders. Each library folder serves as a top-level container for all user learning content, including learning paths and standalone modules.

- **Content Access**: All modules and content are pulled from these library folders, ensuring a centralized and organized approach to content management.

- **Metadata Handling**: Each library folder contains a `.lib` subfolder with metadata files (e.g., `meta.json`) that describe the structure and state of the library's contents.

- **Portability and Syncing**: Libraries are designed to be easily portable, allowing users to back up, sync, and transfer their learning content across devices by managing the library folders.

- **User Interface**: The application will provide a user interface to manage the list of library folders, enabling users to add, remove, and organize their libraries as needed.

---

### **Benefits of the New Model**

- **Scalability:** Supports both small learning projects (standalone modules) and large structured learning paths.
- **Simplicity:** Users can work at the module level without interacting with learning paths unless needed.
- **Portability:** A single Library folder makes transferring content between devices simple.
- **Transparency:** Everything lives within an accessible file structure, empowering users to manage content directly.

---

### **Conclusion**

The introduction of Libraries and Learning Paths represents a natural evolution for Noggin, providing a scalable, flexible, and structured approach to content organization. This model enhances user experience by preserving simplicity at the module level while introducing deeper organizational capabilities when necessary.

By adopting this system, Noggin will remain true to its core values of **open, transparent file structures** while empowering users to tackle larger, more complex learning objectives.

---

### **Implementation Impact Analysis**

The introduction of Libraries and Learning Paths in Noggin's organizational model will have significant implications across the protocol, features, and design of the application. This section outlines the expected changes and enhancements required to integrate the new model effectively.

#### **Protocol Adjustments**

1. **Global Library Path Management:**

    - **Centralized Library Tracking:** Implement a global set of library directory paths that the application will manage. This replaces the previous system of tracking individual modules globally, simplifying the organization and retrieval of learning content.
    - **Automatic Content Loading:** Ensure that all modules and learning paths within these library directory paths are automatically detected and loaded by the system. This streamlines the user experience by eliminating the need for manual module management and ensures that all content is readily available for use.

2. **Metadata Considerations:**

    - **Re-evaluation of Metadata Files:** Assess the necessity of `meta.json` files at the library level. If metadata is not essential for the initial implementation, focus on leveraging the inherent structure of library paths to manage and categorize content effectively.

3. **User Experience Enhancements:**

    - **Simplified Content Access:** Provide users with an intuitive interface to manage library directory paths, allowing easy addition, removal, and organization of libraries. This enhances user autonomy and simplifies the process of accessing and organizing learning materials.

    - **Module Creation and Library Association:** When creating a new module, users must select an existing library or create a new one to house the module. This added level of structure ensures that all modules are organized within a library, enhancing content management and retrieval.

#### **Feature Enhancements**

1. **Practice Feed Integration:**

    - **Learning Path Visibility:** Update the practice feed to display learning paths, highlighting modules due for review within their respective contexts. This will involve changes to the feed's prioritization logic to account for learning path-based progression.
    - **Progress Indicators:** Introduce visual indicators for learning path completion status, providing users with a clear view of their learning journey and remaining tasks.

2. **Module Management:**

    - **Learning Path Management:** Extend module management capabilities to include learning path creation, modification, and deletion. This will require new interfaces and workflows for managing these higher-level structures.

3. **Quiz and Submission Handling:**
    - **Submission Aggregation:** Aggregate quiz submissions at the learning path level, providing users with a comprehensive view of their performance across all modules within a learning path.
    - **Learning Path State Update:** Implement logic to update the module's learning path state (if any) when a quiz is passed. This ensures that progression through the learning path is accurately tracked and that subsequent modules are unlocked as necessary.

#### **Design Modifications**

1. **User Interface Updates:**

    - **Library and Learning Path Navigation:** Redesign the module explorer to include library and learning path navigation, allowing users to easily switch between different organizational levels. This will require a new sidebar structure and navigation logic.
    - **Learning Path Page:** Introduce a new `LearningPathPage` component to provide a dedicated interface for viewing and managing learning paths. This page will display the modules within a learning path, track user progress, and offer navigation options to move between modules.

2. **Dashboard Enhancements:**

    - **Learning Path Overview:** Add a learning path overview section to the dashboard, summarizing user progress, upcoming tasks, and recently accessed modules within each learning path.

3. **Settings and Customization:**
    - **Organizational Preferences:** Introduce settings to customize the display and behavior of libraries and learning paths, allowing users to tailor the application to their preferred organizational style.
    - **Progression Customization:** Provide options for users to customize progression rules and unlock mechanics, supporting personalized learning paths and pacing.
