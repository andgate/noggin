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

This is due to a mismatch between the Node.js version used to compile the native module and the version of Node.js that Electron is using. To handle the different Node.js environments between Electron and drizzle-kit, we use two separate rebuild scripts in our package.json:

```json
{
    "scripts": {
        "rebuild:drizzle": "pnpm rebuild better-sqlite3",
        "rebuild:electron": "electron-rebuild -f -w better-sqlite3-electron && electron-builder install-app-deps"
    }
}
```

Use these scripts accordingly:

-   Run `pnpm run rebuild:electron` when working with the Electron application
-   Run `pnpm run rebuild:drizzle` before running any drizzle-kit commands

This approach ensures the native module is properly compiled for each environment, though it requires us to manage rebuilding when switching between contexts.

See [this issue](https://github.com/WiseLibs/better-sqlite3/issues/1171) for more details.

## OpenAI API Key Security

Currently, the OpenAI API key is stored in plain text in the database. This is obviously not secure. The key is also leaked into the browser process, and openai calls are made directly from the renderer.

This is typically insecure in most setups. For now, this is not a major concern for us. The environment that our application targets is low security risk. The api key is secure unless some malicious process gains access to the browser page. Then it can read the key from browser. But this is still unlikely.

So while it is not an immediate concern, we should look into moving the openai api calls to the backend to secure the keys in the future. Then it can be stored more securely and calls can be managed by our backend, something which both OpenAI and Electron documentation both recommend as standard practice.
