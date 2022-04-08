# codesync

Synchronize your changes across any number of devices. No need to commit, stash, copy-paste your changes when switching between devices (laptop, PC, tablet, etc.)

Goal: Auto synchronize all of my code changes to speed up switching between my laptop and PC.

Requirement for the extension to work:

- Same branch
- Same commit

(both because of how Git internally works, e.g. `git apply` will fail if indexes are different)

TODO:

- [ ] Synchronization should be separate for each project
- [ ] Each user can have multiple projects
- [ ] Synchronization can be done automatically every N seconds (auto) or manually (pressing buttons)
- [ ] Each user must have an account (auto-generated or linked via GitHub)
- [ ] User can confirm before applying new changes (confirm -> applied, cancel -> delete the changes)
- [ ] User can pause synchronization
- [ ] Synchronize staged, unstaged, tracked, untracked files

## Features

## Requirements

## Extension Settings

## Known Issues

## Release Notes

### 0.0.0
