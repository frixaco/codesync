# codesync

Synchronize your changes across devices. No need to commit, stash, copy-paste your changes when switching between devices (laptop, PC, tablet, etc.).

Currently, I work both on my laptop and PC and regularly switch between them (switch to laptop at University or just want to work from my couch, switch to PC when doing some heavy testing/development. I couldn't find any quick and easy way to switch between devices without losing any progress (transferring edited/created/deleted files to other device) and it's pretty annoying to:
`stash the changes using a git command => save to file as a patch => send to other device using some service (notion) => download, move to project folder => apply the patch by running a git command`.

So I deciced to make this extension which hopefully solve this problem of mine.

Requirement for the synchronization to work:



(both because of how Git internally works, e.g. `git apply` will fail if indexes are different)

TODO:
- [x] (diff) Generate diff from staged, unstaged, tracked and untracked files
- [ ] (auth) Add user authorization and authentication
- [ ] (ext-ui) Implement extension UI for user login/registration
- [ ] (ext-ui) Implement extension UI to allow manual two-way synchronization
- [ ] (server) Allow users to create and manage projects in backend
- [ ] (server) Implement synchronization for each projects in backend
- [ ] (ext-ui) Implement extension UI for multiple projects
- [ ] (market) Publish
- [ ] ...

## Features
- [x] Diff for staged, unstaged, tracked and untracked files
- [ ] Accounts
- [ ] Multiple projects
- [ ] Manual two-way synchronization
- [ ] Auto synchronization

## Requirements
- Following should be same (Git won't allow otherwise):
  - project
  - branch
  - commit
- VS Code: 1.63.0 or above (TODO: Lower)

## Extension Settings

## Known Issues

## Release Notes

### 0.0.0
