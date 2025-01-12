# fir-cli

> Personal CLI tools collection written in TypeScript

[English](./README.md) | [简体中文](./README.zh-CN.md)

## Installation

```bash
npm install -g fir-cli
```

## Features

- **AI-Powered Git Commits**: Automatically generate conventional commit messages
- **Smart Editor Integration**: Open projects in VS Code or WebStorm
- **Browser Commands**: Quick Chrome launcher with URL support
- **NPM Tools**: Run global packages and check for updates
- **Time Display**: Show current time with auto-update option

## Usage

```bash
fir [command] [options]
```

### Git Commands

```bash
# Commit changes with AI-generated message
fir commit

# Commit with specific message
fir commit "feat: add new feature"

# Commit and push with AI message
fir push

# Push with specific commit message
fir push "feat: new feature"

# Open repository in browser
fir open
```

### Editor Commands

```bash
# Open current directory in editor (VS Code or WebStorm)
fir code
fir c    # shorthand
fir o    # another shorthand
```

### Browser Commands

```bash
# Open Chrome
fir chrome

# Open Chrome with specific URL
fir chrome https://github.com
```

### NPM Commands

```bash
# Install and run global package
fir nrm
fir nrm ls

# Check for package updates
fir ncu
```

### Time Commands

```bash
# Show current time
fir time
fir t

# Show auto-updating time
fir time --watch
fir t -w
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













