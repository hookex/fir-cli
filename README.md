# fir-cli

A modern CLI tool that enhances your development workflow with AI-powered features.

## Installation

```bash
npm install -g fir-cli
```

## Configuration

Create a `.firrc` file in your home directory:

```json
{
  "openai": {
    "apiKey": "your-api-key",
    "apiBaseUrl": "your-api-base-url",
    "apiModel": "your-api-model"
  }
}
```

You can also configure using environment variables:

- `OPENAI_API_KEY`: Your OpenAI API key
- `OPENAI_API_BASE_URL`: Custom API base URL (optional)
- `OPENAI_API_MODEL`: Custom API model (optional)

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

## Usage

1. Initialize Git repository:
   ```bash
   git init
   ```

2. Make some changes to your code

3. Commit changes with AI:
   ```bash
   f commit
   ```

4. Push changes to remote:
   ```bash
   f push
   ```

5. Open repository in browser:
   ```bash
   f open
   ```

6. Clean working directory:
   ```bash
   f clean
   ```

7. Translate code:
   ```bash
   f translate
   ```

8. Debug code:
   ```bash
   f debug
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
4. Link for local development:
   ```bash
   npm link
   ```

## License

MIT
