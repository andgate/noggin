# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Create CHANGELOG.md to document project changes following the Keep a Changelog format and Semantic Versioning
- Safe-guarded quiz deletion through edit mode, requiring users to explicitly enter edit mode before deletion is possible
- Replace 'Generate Quiz' button with menu icon and dropdown menu featuring 'Create Quiz' and 'Edit Quizzes' options
- Enhanced module submissions display with attempt numbers, table format, and clickable navigation to submission details
- Extracted ModuleSubmissionsTable component for better separation of concerns

### Changed
- Improved UI consistency with expandable options for quiz management
- Improved QuizCard button layout with right-aligned, appropriately sized buttons

### Fixed
- Improved long text handling with truncation and ellipsis for file paths and quiz titles
- Added tooltips with delay to show full text on hover for truncated content
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
