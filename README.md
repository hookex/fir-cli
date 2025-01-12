# one-cli

> Personal CLI tools collection written in TypeScript

[English](./README.md) | [简体中文](./README.zh-CN.md)

## Installation

```bash
npm install -g @hooke/one
```

## Features

- **AI-Powered Git Commits**: Automatically generate conventional commit messages
- **Smart Editor Integration**: Open projects in VS Code or WebStorm
- **Browser Commands**: Quick Chrome launcher with URL support
- **NPM Tools**: Run global packages and check for updates
- **Time Display**: Show current time with auto-update option

## Usage

```bash
one [command] [options]
```

### Git Commands

```bash
# Commit changes with AI-generated message
one commit

# Commit with specific message
one commit "feat: add new feature"

# Commit and push with AI message
one push

# Push with specific commit message
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

## Configuration

### Environment Variables

- `ARK_API_KEY`: API key for AI commit message generation (optional)

## Development

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
