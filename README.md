# Codesync

Synchronize your changes across devices. No need to commit, stash, copy-paste your changes when switching between devices (laptop, PC, tablet, etc.).

Currently, I work both on my laptop and PC and regularly switch between them (switch to laptop at University, then switch back to PC at home, switch to PC when I want to do some heavy testing/development). I couldn't find any quick and easy way to switch between devices without losing any progress (transferring edited/created/deleted files to other device) and it's pretty annoying to:
`stash the changes using a git command => save to file as a patch => send to other device using some service (notion) => download, move to project folder => apply the patch by running a git command`.

So I deciced to make this extension which will, hopefully, solve this problem of mine.

[TODO](./TODO.md)

## Local developement

-   Create `.env` file in `api/` folder. Example: [.env.example](./api/.env.example)
-   `pnpm install` (or run `./clean-install.sh` for clean install)
-   `pnpm dev` to run everything in dev mode
-   Press `F5` to start working with the extension

## Features

-   [x] Github OAuth for authorization/authentication
-   [x] Synchronize staged, unstaged, tracked and untracked file changes
-   [ ] Manage multiple projects
-   [ ] Manual two-way synchronization
-   [ ] Auto synchronization

## Requirements

-   Following should be same (otherwise, `git apply` will fail since indexes will be different) (Working on removing this requirement, see [#8](https://github.com/frixaco/codesync/issues/8)):
    -   git repo
    -   git branch
    -   git commit
-   VS Code: 1.69.0 or above (TODO: Lower the version)

## Extension Settings

## Known Issues

## Release Notes

### 0.0.0
