# Public source snapshot

This repository contains the current local project source. Previous local Git history is not included.

Local secrets, environment files, databases, runtime logs, dependency directories and compiled application binaries are excluded. Hardcoded credentials in the enterprise and asset projects have been replaced with environment variables. Configure your own services before running.

The project is in `enterprise/`. A database backup and downloaded server binaries are excluded. Module SQL schemas are retained. Configuration variable names are shown in the source files.

Binary resources are stored with Git LFS. Install Git LFS before cloning, or run `git lfs install` and `git lfs pull` after cloning. The initial import uses multiple small commits for reliable transfer.
