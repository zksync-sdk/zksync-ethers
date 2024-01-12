# Release Process

This document provides a comprehensive guide on the steps to execute a release for this project.

## Prerequisites

Before initiating the release process, ensure the following prerequisites are met:

- Commit messages must adhere to the [conventional commit specification](https://www.conventionalcommits.org/).
- Proper permissions are in place to create and manage releases.

## Steps

### 1. Create Release

1. **Merge Pull Request to appropriate branch:**
    - Ensure that the changes intended for release are encapsulated in a Pull Request.
    - Merge the approved Pull Request into the `main` or `ethers-v5` branch. Currently,
      only the `main`, `beta`, `ethers-v5`, and `ethers-v5-beta` branches are allowed for releasing.

2. **Manual execution of [Release](workflows/release.yml) Action:**
    - The `Release` GitHub Action automates versioning based on conventional commit messages. Pipeline creates tag, release,
      and pushes new commit in which updates `CHANGELOG.md` and version in `package.json`.
    - Click on the `Run workflow` button and select the desired branch or run the following command:
      `gh workflow run --ref <branch|tag> release.yml`.

### 2. Publish Release to NPM

1. **Manual Execution of [Publish to NPM](workflows/publish.yml) Action:**
    - The `Publish to NPM` publish package to NPM registry.
    - Click on the `Run workflow` button and select the desired branch (or tag) and tag for publishing.
      Currently, only the `main`, `beta`, `ethers-v5`, and `ethers-v5-beta` branches are allowed for releasing.
      Pipeline can also be triggers by the following command:
      `gh workflow run -f ref=<branch|tag> -f tag=<latest|beta|legacy-ethers-v5-latest|legacy-ethers-v5-beta> publish.yml`

2. **Completion Confirmation:**
    - Verify the successful completion of the workflow execution.
    - The package is now published to npm, and users can access the updated version.