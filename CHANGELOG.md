# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- [SPECS ONLY] Added documentation for LeftSidepane component in design specifications
- [SPECS ONLY] Added natural language mastery level descriptions to design documentation
- [SPECS ONLY] Added Module Details Modal component to design specifications
- Create CHANGELOG.md to document project changes following the Keep a Changelog format and Semantic Versioning
- Safe-guarded quiz deletion through edit mode, requiring users to explicitly enter edit mode before deletion is possible
- Replace 'Generate Quiz' button with menu icon and dropdown menu featuring 'Create Quiz', 'Edit Quizzes', and 'View Details' options
- Enhanced module submissions display with attempt numbers, table format, and clickable navigation to submission details
- Extracted ModuleSubmissionsTable component for better separation of concerns
- Enhanced ModuleDetails with module information (title, overview text, quiz count, and spaced repetition statistics)
- Added modal dialog for displaying module details
- Added View Details option to module page menu
- Created dedicated AttemptsHistory component to better encapsulate quiz attempt display logic
- Implemented modal for quiz attempts accessible via menu for cleaner interface

### Changed

- [SPECS ONLY] Modified DESIGN.md to reserve right panel space for future AI agent integration
- [SPECS ONLY] Updated Module Explorer documentation in DESIGN.md to reflect simplified structure
- [SPECS ONLY] Updated Module Page layout documentation in DESIGN.md
- [SPECS ONLY] Added AppLayout and AppHeader component descriptions to DESIGN.md
- Improved UI consistency with expandable options for quiz management
- Improved QuizCard button layout with right-aligned, appropriately sized buttons
- Simplified LeftSidepane by removing accordion structure
- Moved module creation controls to ModuleExplorer header
- Removed selectedModule state from UI store for reduced complexity
- Reduced header heights in ModuleExplorer and AppHeader components for a more compact UI layout
- Modernized quiz interface with Card components for better visual hierarchy and layering
- Implemented custom purple color palette as the primary theme color
- Enhanced shadow effects for better depth perception across the interface
- Updated theme to use Inter font for improved typography
- Consolidated use of Mantine's built-in theming system instead of manual styling

### Fixed

- Improved long text handling with truncation and ellipsis for file paths and quiz titles
- Added tooltips with delay to show full text on hover for truncated content
- Fixed module explorer tree nodes to keep icons and text on the same line with proper text truncation and hover tooltips
- Improved module page layout with proper vertical space distribution using custom flex containers
- Fixed LibraryPage tests by mocking AppHeader to simplify test setup
- Improved QuizPage layout with quiz questions on the left and attempts on the right side
- Enhanced QuizPage scrolling behavior with independently scrollable sections
- Removed horizontal scrollbar from attempts list for cleaner presentation
- Fixed visual inconsistency between card headers and card bodies
- Ensured consistent color theme across all UI elements (buttons, icons, headers)
- Implemented sharper corners for card components as requested

### Deprecated

- Features that will be removed in upcoming releases

### Removed

- Features that have been removed

### Fixed

- Bug fixes

### Security

- Security fixes
