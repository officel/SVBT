# CONTRIBUTING

I appreciate your consideration to contribute to this project! This document is a guide to help make your contribution easier and more effective.

## Getting Started

### Prerequisites

- VS Code
- Node.js
- pre-commit
- (Optional) [Task](https://taskfile.dev/)

### Installation

1. Clone the repository

    ```bash
    git clone https://github.com/officel/SVBT.git
    ```

2. Move to the directory and install dependencies

    ```bash
    cd SVBT
    npm install
    ```

### Development

The main scripts used during development are:

- `npm run lint`: Runs lint on your code. or `task`
- `npm run test`: Runs unit tests.

## How to Contribute

### Reporting Issues

If you find a bug or have a feature request, please open an issue on GitHub.

1. Check [the Issue Tracker](https://github.com/officel/SVBT/issues) for existing issues.
2. When requesting a new issue or feature, Please create a new issue. Be as thorough as possible in including all necessary information.

### Development

1. Check [the Issue Tracker](https://github.com/officel/SVBT/issues), make sure if there is anything relevant to the problem you are trying to solve.
2. Keep the repository you did folk up to date.

   ```bash
    git fetch upstream
    git rebase upstream/main
   ```

3. Create a new branch.

   ```bash
   git switch -c feature/your-feature-name
   ```

4. Make changes to the code and run tests to make sure everything is working properly.
5. Write a clear commit message.

### Commit Messages

- Commit messages should concisely describe the changes you made.
- Commits should be split into appropriate chunks, and we recommend using [the Conventional Commits](https://www.conventionalcommits.org/) style. Below are the available Conventional Commits types:
  - `feat`: a commit that adds new functionality.
  - `fix`: a commit that fixes a bug.
  - `docs`: a commit that adds or improves a documentation.
  - `style`: changes that do not affect the meaning of the code.
  - `refactor`: a code change that neither fixes a bug nor adds a feature.
  - `perf`: a commit that improves performance, without functional changes.
  - `test`: adding missing tests or correcting existing tests.
  - `build`: changes that affect the build system or external dependencies.
  - `ci`: changes to our CI configuration files and scripts.
  - `chore`: other changes that don't modify src or test files.
  - `revert`: reverts a previous commit.

> [!NOTE]
> If there is a single commit in the pull request, the commit message must be the same as a pull request title. Because the merge strategy in this repository is "Squash and merge". When you "Squash and merge" a pull request on a branch that has only one commit, the default commit message will be the commit message in that branch.
>
> cf. [About pull request merges - GitHub Docs](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/incorporating-changes-from-a-pull-request/about-pull-request-merges#merge-message-for-a-squash-merge)

### Code Style

- Code according to [ESlint](/eslint.config.js) and [Prettier](/prettier.config.js) rules.
- Keep your code in a consistent style.
- Running pre-commit on CI. Please address any lint or other errors.

### Testing

- If you make changes, add unit tests or make sure that the existing tests pass.
- Tests are powered by [Vitest](https://vitest.dev/). When adding tests, try to increase test coverage.

> [!ATTENTION]
> We haven't prepared vitest yet; only npm run test is available.

### Pull Requests

1. Write the title of pull request in the [the Conventional Commits](https://www.conventionalcommits.org/) style. Below are the available Conventional Commits types:
   - `feat`: a commit that adds new functionality.
   - `fix`: a commit that fixes a bug.
   - `docs`: a commit that adds or improves a documentation.
   - `style`: changes that do not affect the meaning of the code.
   - `refactor`: a code change that neither fixes a bug nor adds a feature.
   - `perf`: a commit that improves performance, without functional changes.
   - `test`: adding missing tests or correcting existing tests.
   - `build`: changes that affect the build system or external dependencies.
   - `ci`: changes to our CI configuration files and scripts.
   - `chore`: other changes that don't modify src or test files.
   - `revert`: reverts a previous commit.
2. Create a pull request and include the following information:
   - Description of the change
   - Purpose of the change
   - Relevant issue number (if any)

## License

This project is based on [MIT License](/LICENSE).
