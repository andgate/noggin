# v0.9.x release

- Implement libraries (almost done)
- Bring test coverage to 70% or higher
    - playwright is broken with electron-vite setup
- Can't manage libraries in settings?
- Deleting modules doesn't work properly
- Module objects contain an id (which is the slug) and a metadata object (which also has the slug). We should only have one slug.
    - Maybe should just remove the id from the module object?
- App Main Header should be shared and consistent across all pages
    - Hidden for certain pages, such as quiz session pages
    - AppLayout should be a shared component
    - AppLayout should have a hook (useAppLayout) that allows page components to configure the layout
- Ensure all pages have a consistent layout and styling
- Refine the style, add a theme picker in settings
- Quizzes are currently not timed
- Does the practice feed actually work? Needs more testing and probably more control over suggestions (like delay, ignore, etc.)
- Ensure modules detect changes to their source files and update accordingly (e.g the ui should notify the user and the module should be marked for review and show up in the practice feed)
- Update the README

- clicking on a filepath should open it. Right clicking on the file path should allow us to copy
- On the module page, plus botton next to quizzes title
    - plus button opens a dropdown menu with options like "create new quiz", "open last quiz", "edit quizzes"
    - Delete should be more difficult to access, so it should be accessible in an "edit mode" for the list of quizzes
    - How do you exit the edit mode?
- Should be able to change quiz or module titles
- Different view modes for quizzes (cards or list)

    - Is card grid actually good UX for the human brain?

- Bug when deleting a quiz
    - When clicking delete, after deletion, the list of quiz doesn't update.
    - After deleting a quiz, it's submissions are still accessible.
        - But the quiz tied to them no longer exists! This breaks the "back to quiz" backlink on the submission page.

# v1.0.x release

- Implement learning paths
- Implement generative lessons
