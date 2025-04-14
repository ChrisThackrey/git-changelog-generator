# Changelog Generator Local Setup Guide

This guide will help you set up and use the Changelog Generator that's been installed locally at `~/.local/share/changelog-gen`.

## Installation Steps

1. Navigate to the directory:

```bash
cd ~/.local/share/changelog-gen
```

2. Install dependencies:

```bash
pnpm install
```

3. Make the bin script executable:

```bash
chmod +x bin/changelog-generator.js
```

4. Build the project:

```bash
pnpm run build
```

5. Update your API keys:

Edit the `.env` file to add your OpenAI and Anthropic API keys.

## Usage

You can use the Changelog Generator in two ways:

### Option 1: Run directly from the installation directory

```bash
cd ~/.local/share/changelog-gen
pnpm exec changelog-generator
```

### Option 2: Create a global symlink

Create a global symlink to use it from anywhere:

```bash
cd ~/.local/share/changelog-gen
pnpm link --global
```

After creating the symlink, you can run it from any directory:

```bash
changelog-generator
```

## Common Commands

- Initialize changelog directory:
  ```bash
  changelog-generator --init
  ```

- List existing changelogs:
  ```bash
  changelog-generator --list
  ```

- Install Git hooks:
  ```bash
  changelog-generator --install-hooks
  ```

- Generate a changelog (for staged changes):
  ```bash
  changelog-generator
  ```

## Troubleshooting

If you encounter any issues:

1. Make sure you've added your API keys to the `.env` file
2. Check that the `bin/changelog-generator.js` file has executable permissions
3. Ensure you've built the project with `pnpm run build`

For more detailed information, see the `README.md` and `INSTALLATION.md` files.
