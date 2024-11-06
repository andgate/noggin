# Issues

There are a few major issues you should be aware of when developing for Noggin.

## Electron Version Restriction (v31)

Currently, our application is restricted to Electron v31 due to compatibility issues with newer versions. This limitation stems from:

1. Pending support for Electron 32+ in electron-vite ([Issue #655](https://github.com/alex8088/electron-vite/issues/655))
2. Native module compatibility challenges, particularly with better-sqlite3 ([Issue #1171](https://github.com/WiseLibs/better-sqlite3/issues/1171))

The main challenges involve:

-   Electron-vite needs to be updated to support newer Electron versions
-   Native Node modules require recompilation for each Electron version due to ABI differences
-   Better-sqlite3 requires specific handling for Electron environments

We will monitor these dependencies and upgrade when full compatibility is confirmed.
