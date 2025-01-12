# fir-cli

> Personal CLI tools collection written in TypeScript

[English](./README.md) | [简体中文](./README.zh-CN.md)

## Installation

```bash
npm install -g fir-cli
```

## Features

### Git Commands
- `fir commit` or `fir c`: Commit changes with AI-generated commit messages
  - Auto-detects and stages unstaged changes
  - Generates meaningful commit messages using AI
  - Supports manual commit messages
  - Shows detailed status information

- `fir push` or `fir p`: Push changes to remote
  - Shows current changes and unpushed commits
  - Auto-stages and commits changes
  - Creates remote branch if needed
  - Handles upstream branch setup

- `fir open`: Open repository in browser
  - Supports both HTTPS and SSH remote URLs
  - Opens in default browser

- `fir clean`: Clean working directory
  - Shows detailed status before cleaning
  - Resets staged changes
  - Removes untracked files

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

### AI Commands
- `fir translate`: Translate code between languages
  - Supports multiple programming languages
  - Preserves code structure and logic
  - Adds helpful comments

- `fir debug`: Debug code with AI assistance
  - Analyzes code and error messages
  - Provides detailed explanations
  - Suggests fixes

## Configuration

Create a `.firrc` file in your home directory with the following content:

```json
{
  "openai": {
    "apiKey": "your-api-key",
    "apiBaseUrl": "your-api-base-url",
    "apiModel": "your-api-model"
  }
}
```

### Environment Variables

You can also configure the CLI using environment variables:

- `OPENAI_API_KEY`: Your OpenAI API key
- `OPENAI_API_BASE_URL`: Custom API base URL (optional)
- `OPENAI_API_MODEL`: Custom API model (optional)
- `ARK_API_KEY`: API key for AI commit message generation (optional)

## Usage

1. Initialize Git repository:
   ```bash
   git init
   ```

2. Make some changes to your code

3. Commit changes with AI:
   ```bash
   fir commit
   ```

4. Push changes to remote:
   ```bash
   fir push
   ```

5. Open repository in browser:
   ```bash
   fir open
   ```

6. Clean working directory:
   ```bash
   fir clean
   ```

7. Translate code:
   ```bash
   fir translate
   ```

8. Debug code:
   ```bash
   fir debug
   ```

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
