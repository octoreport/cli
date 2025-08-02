# @octoreport/cli

<h1 align="center">
	<br>
	<br>
	<img width="320" src="media/logo.png" alt="octoreport">
	<br>
	<br>
	<br>
</h1>

> A modern, secure, and timezone-aware GitHub PR/issue analytics CLI tool.It provides a clean, interactive command-line interface for retrieving, filtering, and analyzing pull request activity with flexible filtering and accurate participation tracking.

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

## Installation

```bash
npm install -g @octoreport/cli
```

### Prerequisites

- Node.js >= 18
- npm or yarn
- GitHub account

## Quick Start

```bash
# Login to GitHub (first time only)
octoreport login

# Get comprehensive PR activity report
octoreport all

# Get report in JSON format
octoreport all --format json
```

## Authentication

The CLI uses GitHub's OAuth device flow for secure authentication:

```bash
octoreport login
```

This will:

1. Open a browser window for GitHub authentication
2. Securely store your token in the system keychain
3. Automatically handle token refresh and management

### Required Scopes

For full functionality, the OAuth app requests these scopes:

- `repo` - Access private repositories
- `read:user` - Read user profile information

## Commands

### `octoreport all`

Get comprehensive PR activity report with both created and participated PRs.

```bash
# Basic usage
octoreport all

# alias
octoreport a

# With custom format
octoreport all --format json
octoreport all --format table
```

**Options:**

- `--format <format>` - Output format (table, json, general) [default: table]

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

````
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
````

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

### Token Storage

- Tokens are securely stored using the system keychain (keytar)
- No tokens are stored in plain text or configuration files
- Automatic token refresh and validation

### OAuth Flow

- Uses GitHub's OAuth device flow for secure authentication
- No need to manually create or manage personal access tokens
- Automatic scope management and validation

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

1. Fork this repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m "feat: your feature"`)
4. Push to your fork and open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write comprehensive tests for new features
- Use conventional commit messages
- Ensure all tests pass before submitting PRs

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
