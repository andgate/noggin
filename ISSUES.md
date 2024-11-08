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

### NODE_MODULE_VERSION Errors

If you see an error like this:

```
Error: The module '\\?\C:\Users\andgate\Projects\noggin\node_modules\.pnpm\better-sqlite3@11.5.0\node_modules\better-sqlite3\build\Release\better_sqlite3.node'
was compiled against a different Node.js version using
NODE_MODULE_VERSION 125. This version of Node.js requires
NODE_MODULE_VERSION 127. Please try re-compiling or re-installing
the module (for instance, using `npm rebuild` or `npm install`).
```

This is due to a mismatch between the Node.js version used to compile the native module and the version of Node.js that Electron is using.

To fix this, delete the `node_modules` directory and the `pnpm-lock.json` file, then run `pnpm install` again. This will should leave you with a clean build environment and a fresh install of the dependencies.

If that doesn't work, you can try to recompile the native module with the `pnpm rebuild` command.
