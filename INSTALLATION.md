# Changelog Generator Installation Guide

## Prerequisites

- Node.js 16 or higher
- pnpm (install with `npm install -g pnpm`)
- Git

## Installation Steps

1. Clone or create a new repository

```bash
# Either create a new repository
mkdir changelog-generator
cd changelog-generator
git init

# Or clone this repository
git clone <repository-url>
cd changelog-generator
```

2. Install dependencies

```bash
pnpm install
```

3. Create environment variables

Create a `.env` file in the root directory with your API keys:

```
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

4. Build the project

```bash
pnpm run build
```

5. Install Git hooks (optional)

```bash
pnpm run install-hooks
```

## Usage

To generate a changelog:

```bash
pnpm exec changelog-generator
```

For more options:

```bash
pnpm exec changelog-generator --help
```

## Troubleshooting

If you encounter any TypeScript errors during build:

1. Check that you've installed all dependencies
2. Make sure your Node.js version is 16 or higher
3. Try running `pnpm tsc --noEmit` to see detailed errors

If you have issues with Git hooks:

1. Make sure you're in a Git repository
2. Check that the hooks directory exists at `.git/hooks`
3. Ensure hook files have executable permissions
