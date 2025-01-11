import { config } from '../config/config.js';
import { execSync } from 'child_process';
import chalk from 'chalk';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: config.ai.apiKey,
  baseURL: config.ai.baseURL,
});

export async function generateCommitMessage(): Promise<string> {
  try {
    // 获取 git diff 信息
    const diffOutput = execSync('git diff --cached').toString();
    if (!diffOutput) {
      throw new Error('No staged changes found. Please stage your changes first using git add');
    }

    console.log(chalk.cyan('Generating commit message...'));
    console.log(chalk.gray('API Configuration:'));
    console.log(chalk.gray(`- Base URL: ${config.ai.baseURL}`));
    console.log(chalk.gray(`- Model: ${config.ai.model}`));

    // 构建提示信息
    const systemPrompt = `You are a Git commit message generator. Generate a commit message following the Conventional Commits specification (https://www.conventionalcommits.org/).
    Rules:
    1. Use format: <type>(<scope>): <description>
    2. Type must be one of: feat, fix, docs, style, refactor, test, chore
    3. Scope is optional
    4. Description should be concise and in present tense
    5. Don't capitalize first letter
    6. No period at the end
    7. Maximum length: 100 characters`;

    const userPrompt = `Based on the following git diff, generate a conventional commit message:
    
    ${diffOutput}`;

    try {
      // 调用 AI API
      const completion = await openai.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        model: config.ai.model,
      });

      console.log(chalk.gray('API Response:'), completion);

      const commitMessage = completion.choices[0]?.message?.content?.trim() || '';
      
      if (!commitMessage) {
        throw new Error('API returned empty response');
      }

      // 验证 commit message 格式
      if (!isValidCommitMessage(commitMessage)) {
        console.log(chalk.yellow('Generated message:'), commitMessage);
        throw new Error('Generated commit message does not follow conventional commits format');
      }

      return commitMessage;
    } catch (apiError: any) {
      console.error(chalk.red('API Error:'), apiError);
      if (apiError.response) {
        console.error(chalk.red('API Response:'), apiError.response.data);
      }
      throw new Error(`AI API error: ${apiError.message}`);
    }
  } catch (error: any) {
    console.error(chalk.red('Error generating commit message:'), error.message);
    throw error;
  }
}

function isValidCommitMessage(message: string): boolean {
  // conventional commits 格式的正则表达式
  const conventionalCommitRegex = /^(feat|fix|docs|style|refactor|test|chore)(\([a-z0-9-]+\))?: .+/;
  const isValid = conventionalCommitRegex.test(message);
  
  if (!isValid) {
    console.log(chalk.yellow('Invalid commit message format. Message:'), message);
    console.log(chalk.yellow('Expected format:'), 'type(scope): description');
    console.log(chalk.yellow('Valid types:'), 'feat, fix, docs, style, refactor, test, chore');
  }
  
  return isValid;
}
