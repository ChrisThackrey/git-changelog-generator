# Git Changelog Generator

AI-powered changelog generator for Git repositories that automatically creates structured markdown changelogs whenever files are committed.

## Features

- Generates a changelog file each time staged files are committed
- Uses Git commands to extract file diffs and repository information
- Applies AI reasoning to identify relationships between changes
- Organizes changes by implementation details
- Stores changelogs in a consistent markdown format
- Integrates with MCP Servers for enhanced functionality
- Provides a simple CLI interface

## Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Build the project:
   ```bash
   pnpm run build
   ```
4. Create a `.env` file with your API keys (see `.env.example`)
5. Install Git hooks (optional):
   ```bash
   pnpm run install-hooks
   ```

## Usage

### Generate a changelog

To generate a changelog for staged changes:

```bash
pnpm exec changelog-generator
```

### Initialize changelog directory

To create the `docs/changelogs` directory structure:

```bash
pnpm exec changelog-generator --init
```

### List previous changelogs

To list all previously generated changelogs:

```bash
pnpm exec changelog-generator --list
```

### Install Git hooks

To install Git hooks that automatically generate changelogs on commit:

```bash
pnpm exec changelog-generator --install-hooks
```

### Verbose logging

To enable more detailed logging:

```bash
pnpm exec changelog-generator --verbose
```

## Changelog Structure

Each generated changelog follows this structure:

```markdown
# Changelog Entry: {id}
**Timestamp:** {timestamp}

## Changes
### {Category1}
- **{file1}** ({type}): {description}
```diff
{diff}
```

### {Category2}
- **{file2}** ({type}): {description}

## Related Changelogs
- [{related_id}]({related_id}.md) ({timestamp}): {relationshipType} (Strength: {strength})

## AI Reasoning
{reasoning}
```

## Requirements

- Node.js 16+
- Git
- OpenAI API key (for o3-mini model)
- Anthropic API key (for Claude 3.7 Sonnet)

## License

MIT
