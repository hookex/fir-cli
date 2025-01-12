# fir-cli

A modern CLI tool that enhances your development workflow with AI-powered features.

[English](./README.md) | [简体中文](./README.zh-CN.md)

## Features

- 🌐 **Multi-language Support**: Switch between English and Chinese interfaces
- 🤖 **AI Integration**: Built-in AI assistant for various tasks
- ⌚ **Time Display**: Show current time in Beijing and UTC
- 🌍 **IP Information**: Display both local and public IP addresses
- 🔄 **Git Operations**: Streamlined git workflow with AI-powered commit messages
- 🌐 **Translation**: Quick English-Chinese text translation
- ⚙️ **Configuration**: Easy-to-use settings management
- 🎯 **Smart Aliases**: Intuitive command aliases for faster operation

## Installation

```bash
npm install -g fir-cli
```

## Configuration (Optional)

The CLI works out of the box for basic Git operations. For AI-powered features, you'll need to configure OpenAI API access.

Create a `.firrc` file in your home directory:

```json
{
  "openai": {
    "apiKey": "your-api-key",
    "apiBaseUrl": "your-api-base-url",  // Optional
    "apiModel": "your-api-model"        // Optional
  }
}
```

Or use environment variables:

- `OPENAI_API_KEY`: Your OpenAI API key (required for AI features)
- `OPENAI_API_BASE_URL`: Custom API base URL (optional)
- `OPENAI_API_MODEL`: Custom API model (optional)

## Quick Start

1. Initialize Git repository:
   ```bash
   git init
   ```

2. Make some changes to your code

3. Commit with AI-generated message:
   ```bash
   f commit
   ```

4. Push to remote:
   ```bash
   f push
   ```

## Command Reference

| Command | Alias | Description | Example |
|---------|-------|-------------|---------|
| Git Commands |
| `f commit` | `f c`, `f co`, `f com` | Commit changes with AI message | `f commit` |
| `f commit -v` | `f c -v`, `f co -v`, `f com -v` | Commit with verbose mode | `f c -v` |
| `f push` | `f p`, `f pu` | Push changes to remote | `f push` |
| `f push -v` | `f p -v`, `f pu -v` | Push with verbose mode | `f p -v` |
| `f open` | - | Open repository in browser | `f open` |
| `f clean` | `f c`, `f cl` | Clean working directory | `f clean` |
| `f git` | `f g`, `f gi` | Git operations | `f git open` |
| Editor Commands |
| `f code` | `f c`, `f co` | Open in VS Code | `f code` |
| `f webstorm` | - | Open in WebStorm | `f webstorm` |
| Browser Commands |
| `f chrome` | `f c`, `f ch` | Open Chrome | `f chrome` |
| `f chrome <url>` | `f c <url>`, `f ch <url>` | Open Chrome with URL | `f chrome https://github.com` |
| Network Commands |
| `f ip` | `f i`, `f ip` | Show local IP addresses | `f ip` |
| `f ping` | `f p`, `f pi` | Ping domain(s) | `f ping github.com` |
| NPM Commands |
| `f nrm` | - | Run NRM package | `f nrm ls` |
| `f ncu` | - | Check package updates | `f ncu` |
| `f install` | `f i`, `f in` | Run or install and run a global npm package | `f install nrm` |
| Time Commands |
| `f time` | `f t`, `f ti` | Show current time | `f time` |
| `f time --watch` | `f t --watch`, `f ti -w` | Show auto-updating time | `f time --watch` |
| AI Commands |
| `f translate` | `f t`, `f tr` | Translate text between languages | `f translate "Hello"` |
| `f debug` | `f d`, `f de` | Debug code with AI assistance | `f debug` |
| `f ai` | `f a`, `f ai` | Chat with AI assistant | `f ai "How to use git?"` |
| Other Commands |
| `f config` | `f c`, `f co` | Configure CLI settings | `f config set openai.apiKey "your-key"` |
| `f help` | - | Show help information | `f help commit` |
| `f statistics` | `f s`, `f st`, `f stats` | Show code statistics | `f statistics` |
| `f statistics -d` | - | Show last 24h changes | `f statistics -d` |
| `f statistics -w` | - | Show last week changes | `f statistics -w` |
| `f statistics -m` | - | Show last month changes | `f statistics -m` |
| `f statistics -y` | - | Show last year changes | `f statistics -y` |

## Features

### Git Commands

#### Commit Changes (`f commit` or `f c`)
Commit changes with AI-generated commit messages.

Features:
- Auto-detects and stages unstaged changes
- Generates meaningful commit messages using AI
- Supports manual commit messages
- Shows detailed status information

Example:
```bash
# Basic commit with AI message
f commit

# Commit with verbose mode
f c -v

# Example AI-generated message:
feat(auth): add OAuth2 authentication with Google provider
- Implement OAuth2 flow for Google authentication
- Add user profile synchronization
- Update configuration for OAuth credentials
```

#### Push Changes (`f push` or `f p`)
Push changes to remote repository.

Features:
- Shows current changes and unpushed commits
- Auto-stages and commits changes
- Creates remote branch if needed
- Handles upstream branch setup

Example:
```bash
# Push with AI commit message
f push

# Push with verbose mode
f p -v

# Status output example:
Git Status:
----------------------------------------
Branch: feature/auth
Last Commit: a1b2c3d - feat: add login page

Changed Files:
  Modified: src/auth/login.ts
  Added: src/components/LoginForm.tsx
  
Unpushed commits:
a1b2c3d feat: add login page
b2c3d4e fix: handle auth errors
----------------------------------------
```

#### Open Repository (`f open`)
Open repository in browser.

Features:
- Supports both HTTPS and SSH remote URLs
- Opens in default browser
- Handles GitHub, GitLab, and Bitbucket URLs

Example:
```bash
# Open current repository
f open

# Output example:
✓ Opening https://github.com/username/repo in browser
```

#### Clean Working Directory (`f clean`)
Clean working directory and remove untracked files.

Features:
- Shows detailed status before cleaning
- Resets staged changes
- Removes untracked files
- Interactive confirmation

Example:
```bash
# Clean working directory
f clean

# Output example:
Found changes:

Modified files:
  src/components/Button.tsx
  src/styles/main.css

Untracked files:
  .env.local
  temp/
```

### AI Commands

#### Translate Code (`f translate` or `f t`)
Translate code between programming languages.

Features:
- Supports multiple programming languages
- Preserves code structure and logic
- Adds helpful comments
- Handles language-specific idioms

Example:
```bash
# Translate current file
f translate python typescript

# Example output:
# Python input:
def calculate_total(items):
    return sum(item.price for item in items)

# TypeScript output:
function calculateTotal(items: Item[]): number {
    return items.reduce((sum, item) => sum + item.price, 0);
}
```

#### Debug Code (`f debug` or `f d`)
Debug code with AI assistance.

Features:
- Analyzes code and error messages
- Provides detailed explanations
- Suggests fixes
- Shows examples

Example:
```bash
# Debug last error
f debug

# Example output:
Error Analysis:
- TypeError: Cannot read property 'data' of undefined
- Location: src/api/users.ts:45
- Root cause: API response is undefined before access

Solution:
1. Add null check before accessing data:
   ```typescript
   const response = await api.get('/users');
   const data = response?.data ?? [];
   ```

Prevention:
- Always handle undefined/null cases
- Use optional chaining and nullish coalescing
- Add type checking
```

## New in v1.0.13

### Multi-language Support
- 🌐 Full interface localization in English and Chinese
- 🔄 Easy language switching through config menu
- 📝 Localized command outputs and messages
- 🎯 Consistent formatting across languages
- 💡 AI responses in your preferred language

### Enhanced Output Formatting
- ⚡ Aligned and structured command outputs
- 🎨 Better visual organization of information
- 📊 Consistent spacing and indentation
- 🔍 Clear separation of different data types
- ✨ Improved readability for all commands

### Other Improvements
- 🛠️ Enhanced error handling
- ⚡ Optimized performance
- 🔄 Smoother language switching
- 📱 Better terminal UI experience

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
4. Link for local development:
   ```bash
   npm link
   ```

## License

MIT
