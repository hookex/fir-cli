# one-cli

Personal CLI tools collection written in TypeScript and published to npm.

## Installation

```bash
npm install -g @hooke/one
```

## Usage

After installation, you can use the CLI with the `one` command:

```bash
one [command] [options]
```

## Available Commands

### Git Commands

```bash
# Commit changes with AI-generated message
one commit

# Commit with specific message
one commit "feat: add new feature"

# Push changes
one push

# Push with new commit message
one push "feat: new feature"

# Open repository in browser
one open
```

### Editor Commands

```bash
# Open current directory in editor (VS Code or WebStorm)
one code
one c    # shorthand
one o    # another shorthand
```

### Browser Commands

```bash
# Open Chrome
one chrome

# Open Chrome with specific URL
one chrome https://github.com
```

### NPM Commands

```bash
# Install and run global package
one nrm
one nrm ls

# Check for package updates
one ncu
```

### Time Commands

```bash
# Show current time
one time
one t

# Show auto-updating time
one time --watch
one t -w
```

## Environment Variables

- `ARK_API_KEY`: API key for AI commit message generation (optional)

## Development

This project is built with TypeScript. To develop:

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the project:
   ```bash
   npm run build
   ```
4. Install globally for testing:
   ```bash
   npm install -g --force
   ```

## License

MIT
