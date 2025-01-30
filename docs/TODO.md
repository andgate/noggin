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

# v1.0.x release

- Implement learning paths
- Implement generative lessons
