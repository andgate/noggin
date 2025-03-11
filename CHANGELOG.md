# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- [SPECS ONLY] Added documentation for LeftSidepanel component in design specifications
- [SPECS ONLY] Added natural language mastery level descriptions to design documentation
- Create CHANGELOG.md to document project changes following the Keep a Changelog format and Semantic Versioning
- Safe-guarded quiz deletion through edit mode, requiring users to explicitly enter edit mode before deletion is possible
- Replace 'Generate Quiz' button with menu icon and dropdown menu featuring 'Create Quiz' and 'Edit Quizzes' options
- Enhanced module submissions display with attempt numbers, table format, and clickable navigation to submission details
- Extracted ModuleSubmissionsTable component for better separation of concerns
- Enhanced ModuleInfoPanel with additional module information (title, overview text, quiz count, and spaced repetition statistics)
- Created ModuleDetails component for displaying module metadata in the left sidebar
- Implemented accordion-based sidebar with collapsible sections for MODULE EXPLORER and MODULE DETAILS
- Added module selection tracking in UI store to maintain context between page views

### Changed

- [SPECS ONLY] Updated DESIGN.md to relocate module information from right panel to left sidebar
- [SPECS ONLY] Modified DESIGN.md to reserve right panel space for future AI agent integration
- [SPECS ONLY] Revised Module Explorer documentation in DESIGN.md as a section within LeftSidepanel
- [SPECS ONLY] Renamed ModuleInfoPanel to ModuleDetails in design specifications only
- [SPECS ONLY] Updated Module Page layout documentation in DESIGN.md
- [SPECS ONLY] Added AppLayout and AppHeader component descriptions to DESIGN.md
- Improved UI consistency with expandable options for quiz management
- Improved QuizCard button layout with right-aligned, appropriately sized buttons
- Refactored application information architecture to match design specifications
- Relocated module information from right sidebar to left sidebar
- Renamed and moved ModuleInfoPanel functionality to ModuleDetails in left sidebar
- Moved create actions (new library, new module) into dropdown menu in MODULE EXPLORER header
- Modified ModuleViewRoot to set selected module in UI store when viewing
- Removed right sidebar from module page to allow content to use full width
- Updated ModulePage title to show "Module" in header and module title in content area

### Fixed

- Improved long text handling with truncation and ellipsis for file paths and quiz titles
- Added tooltips with delay to show full text on hover for truncated content
- Fixed module explorer tree nodes to keep icons and text on the same line with proper text truncation and hover tooltips
- Improved module page layout with proper vertical space distribution using custom flex containers
- Fixed LibraryPage tests by mocking AppHeader to simplify test setup

### Deprecated

- Features that will be removed in upcoming releases

### Removed

- Features that have been removed

### Fixed

- Bug fixes

### Security

- Security fixes
