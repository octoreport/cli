# @octoreport/cli

<h1 align="center">
	<img width="500px" src="media/logo.png" alt="octoreport">
</h1>

> A modern, secure, and timezone-aware GitHub PR/issue analytics CLI tool. It provides a clean, interactive command-line interface for retrieving, filtering, and analyzing pull request activity with flexible filtering and accurate participation tracking.

## Features

🔒 **Secure Authentication**: OAuth device flow for secure GitHub login without storing plaintext tokens

📊 **Interactive CLI**: User-friendly interface with prompts and rich output formatting

⏰ **Participation Tracking**: Accurately tracks user PR participation (reviews, comments, authored PRs)

🌏 **Timezone-Aware**: Built with Luxon for reliable date handling across timezones

⚡ **Fast & Modern**: TypeScript-based, modular, and designed for performance

🧪 **Test Coverage**: Comprehensive test suites with Vitest

🛠️ **Modular Design**: Structured commands and features for maintainability and extensibility

🔐 **Token Management**: Secure token storage via system keychain (keytar)

📋 **Multiple Output Formats**: Supports table, JSON, and plain text formats

🔓 **Private Repository Support**: Optional access to private repositories with `--repo-scope private` option

📖 **Read-Only Operations**: Only reads repository data, never modifies or creates content

🔄 **Scope Consistency**: Login and command execution must use matching repository scopes

## Installation

```bash
npm install -g @octoreport/cli
```

### Prerequisites

- Node.js >= 18
- npm or yarn
- GitHub account
- detect-secrets installed (required for contributors)

## Quick Start

```bash
# Login to GitHub for public repositories (first time only)
octoreport login

# Or login with private repository access
octoreport login --repo-scope private

# Get comprehensive PR activity report (public repositories)
octoreport all

# Get report in JSON format
octoreport all --format json

# Access private repositories (must login with --repo-scope private first)
octoreport all --repo-scope private
```

⚠️ **Important**: The `--repo-scope` option used in commands must match the scope used during login. If you get a "Repository scope mismatch" error, log out and log in again with the desired scope.

## Authentication

The CLI uses GitHub's OAuth device flow for secure authentication:

```bash
# Login for public repositories (default)
octoreport login

# Login for private repositories
octoreport login --repo-scope private
```

This will:

1. Open a browser window for GitHub authentication
2. Securely store your token in the system keychain
3. Automatically handle token refresh and management

### Repository Scope Management

**⚠️ Critical**: The repository scope used during login determines which repositories you can access. You must use the **same scope** when running commands.

```bash
# Example: Login with private scope
octoreport login --repo-scope private

# Then use the same scope in commands
octoreport all --repo-scope private

# If scopes don't match, you'll get an error:
# "Repository scope mismatch. Please log in again."
```

**To switch scopes:**

```bash
# 1. Logout
octoreport logout

# 2. Login with desired scope
octoreport login --repo-scope public  # or private
```

### Required Scopes

The OAuth app requests different scopes based on your needs:

**Default (`--repo-scope public`):**

- `public_repo` - Full access to public repositories (read/write)
- `read:user` - Read user profile information

**With `--repo-scope private`:**

- `repo` - Full repository access (public and private)
- `read:user` - Read user profile information

**⚠ Security Note:** Both scopes grant read/write access to repositories, not just read-only access.

## Commands

### `octoreport all`

Get comprehensive PR activity report with both created and participated PRs.

```bash
# Basic usage (public repositories only)
octoreport all

# alias
octoreport a

# With custom format
octoreport all --format json
octoreport all --format table

# Access private repositories (requires login with --repo-scope private)
octoreport all --repo-scope private

# Combine options
octoreport all --repo-scope private --format json
```

**Options:**

- `--format <format>` - Output format (table, json, general) [default: table]
- `--repo-scope <scope>` - Repository access scope (public, private) [default: public]
  - Must match the scope used during login
  - Use `public` for public repositories only
  - Use `private` for both public and private repositories

**Interactive Prompts:**

- Username (optional - uses authenticated user if skipped)
- Repository (e.g., octoreport/cli)
- Start date (YYYY-MM-DD)
- End date (YYYY-MM-DD)
- Target branch (optional - all branches if skipped)

**Output:**

- User created PRs with detailed information
- User participated PRs (reviews, comments)
- Search criteria summary
- Formatted tables or JSON data

## Output Formats

### Table Format (Default)

Displays data in beautifully formatted ASCII tables:

```
┌────────┬────────────────────┬────────────┬────────────┬─────────────────────────────────────────────┬────────┬──────────────┬──────────────┐
│ Number │ Title              │ Author     │ Branch     │ URL                                         │ State  │ Created At   │ Merged At   │
├────────┼────────────────────┼────────────┼────────────┼─────────────────────────────────────────────┼────────┼──────────────┼──────────────┤
│ 123    │ Add new feature    │ octocat    │ main       │ https://github.com/.../pull/123             │ MERGED │ 2025-01-15   │ 2025-01-16   │
└────────┴────────────────────┴────────────┴────────────┴─────────────────────────────────────────────┴────────┴──────────────┴──────────────┘
```

### JSON Format

Returns structured JSON data for programmatic use:

```json
{
  "created": [
    {
      "number": 123,
      "title": "Add new feature",
      "url": "https://github.com/octoreport/core/pull/123",
      "author": "octocat",
      "targetBranch": "main",
      "state": "MERGED",
      "createdAt": "2025-01-15T10:30:00Z",
      "mergedAt": "2025-01-16T14:20:00Z"
    }
  ],
  "participated": [
    {
      "number": 125,
      "title": "Update documentation",
      "url": "https://github.com/octoreport/core/pull/125",
      "author": "other-user",
      "targetBranch": "main",
      "state": "OPEN",
      "reviewers": ["octocat"],
      "commenters": ["octocat"]
    }
  ]
}
```

### General Format

Simple text output for quick viewing:

```
🐙📊 User Created PRs:
[
  {
    number: 123,
    title: "Add new feature",
    url: "https://github.com/octoreport/core/pull/123",
    ...
  }
]

🐙📊 User Participated PRs:
[
  {
    number: 125,
    title: "Update documentation",
    url: "https://github.com/octoreport/core/pull/125",
    ...
  }
]
```

## Data Structure

The CLI returns the same data structure as the core library:

```typescript
// @octoreport/core

interface PR {
  // Basic PR information (always available)
  number: number;
  title: string;
  url: string;
  createdAt: string;
  user: string | null;

  // Detailed information (may be null if API access is limited)
  targetBranch?: string;
  assignees?: string[];
  state?: 'OPEN' | 'CLOSED' | 'MERGED';
  merged?: boolean;
  isDraft?: boolean;
  mergeable?: 'MERGEABLE' | 'CONFLICTING' | 'UNKNOWN';
  labels?: string[] | null;
  author?: string | null;
  reviewers?: string[] | null;
  commenters?: string[] | null;
  reviewDecision?: 'CHANGES_REQUESTED' | 'APPROVED' | 'REVIEW_REQUIRED' | null;
  mergedAt?: string | null;
  requestedReviewers?: string[] | null;

  // Participation data
  reviews?: (ReviewsRaw | null)[] | null;
  comments?: CommentsRaw[] | null;
}
```

## Architecture

The CLI is organized into modular components for better maintainability:

```
src/
├── commands/           # Command definitions and handlers
│   ├── all/           # All command implementation
│   ├── index.ts       # Command registration
│   └── withCommandContext.ts # Command context wrapper
├── config/            # Configuration and setup
│   ├── commander.ts   # Commander.js setup
│   └── packageInfo.ts # Package information
├── features/          # Feature modules
│   ├── auth/          # Authentication and token management
│   ├── prompts/       # Interactive prompts
│   └── ui/            # UI components and formatting
└── index.ts           # Main entry point
```

## Security

### Repository Access Control

The CLI implements a security-first approach to repository access:

**Default Behavior (Recommended):**

- Requests `public_repo` scope by default
- Provides read/write access to public repositories only
- Includes access to public repository settings and webhooks
- Minimizes security exposure for most use cases

**Private Repository Access:**

- Use `--repo-scope private` to enable private repository access
- Requests `repo` scope which provides full repository access
- Includes access to organization resources and team memberships
- Requires re-authentication when switching between public/private access
- Clearly indicates access level in the output

**Scope Consistency Requirement:**

- ⚠️ The `--repo-scope` used in commands **must match** the scope used during login
- Different scopes are stored separately in the system keychain
- Switching scopes requires logout and re-login
- Attempting to use mismatched scopes will result in: `Repository scope mismatch. Please log in again.`

**Security Notice:** Both scopes grant read/write access, not just read-only access.

**What this tool actually does:**

- Reads PR activity data from repositories
- Generates reports and analytics
- Does NOT create, modify, or delete any repository content
- Does NOT make any changes to your repositories
- Token is securely stored in your OS keychain

### Token Storage

- Tokens are securely stored using the system keychain (keytar)
- No tokens are stored in plain text or configuration files
- Automatic token refresh and validation
- Different tokens for different access levels

### OAuth Flow

- Uses GitHub's OAuth device flow for secure authentication
- No need to manually create or manage personal access tokens
- Automatic scope management and validation
- Clear indication of requested permissions during authentication

## Development

### Setup

```bash
# Clone the repository
git clone https://github.com/octoreport/cli.git
cd cli

# Install dependencies
npm install

# Run tests
npm test

# Build the CLI
npm run build

# Link for local development
npm link
```

### Available Scripts

```bash
npm run build         # Build the CLI
npm test              # Run tests
npm run dev:test      # Run tests in watch mode
npm run lint          # Run ESLint
npm run lint:fix      # Fix ESLint issues
npm run format        # Format code with Prettier
npm run format:check  # Check code formatting
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run dev:test

# Run specific test file
npm test -- tests/index.test.ts
```

## Contributing

We welcome contributions! 👍🏻

Please read our [Contributing Guidelines](CONTRIBUTING.md) before submitting any changes. The guidelines include:

- **Security Setup**: Required detect-secrets configuration to prevent token leaks
- **Development Workflow**: Branching, testing, and PR process
- **Code Style**: TypeScript guidelines and quality standards

### Quick Start for Contributors

```bash
# Clone the repository
git clone https://github.com/octoreport/cli.git
cd cli

# Install dependencies
npm install

# Install detect-secrets (via pipx recommended)
brew install pipx
pipx install detect-secrets

# Ensure baseline file exists
ls .secrets.baseline

# Run an initial scan (if baseline needs update)
detect-secrets scan \
  --exclude-files 'node_modules/.*' \
  --exclude-files '.*package-lock\.json' \
  --exclude-files '.*yarn\.lock' \
  > .secrets.baseline
git add .secrets.baseline
git commit -m "chore(security): update detect-secrets baseline"
```

**⚠️ Important**: This project handles GitHub API tokens, so detect-secrets setup is mandatory. The pre-commit hook will block commits containing new secrets. The CI pipeline will re-scan on every PR and push to main.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgements

- [@octoreport/core](https://github.com/octoreport/core) for the analytics engine
- [commander.js](https://github.com/tj/commander.js) for CLI framework
- [inquirer](https://github.com/SBoudrias/Inquirer.js) for interactive prompts
- [chalk](https://github.com/chalk/chalk) for terminal styling
- [boxen](https://github.com/sindresorhus/boxen) for beautiful boxes
- [cli-table3](https://github.com/cli-table/cli-table3) for table formatting
- [keytar](https://github.com/atom/node-keytar) for secure token storage
