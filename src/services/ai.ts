import { config } from '../config/config.js';
import { execSync } from 'child_process';
import chalk from 'chalk';
import axios from 'axios';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: config.ai.apiKey,
  baseURL: config.ai.baseURL,
});

export async function generateCommitMessage(verbose: boolean = false, language: string = 'en'): Promise<string> {
  try {
    // 获取 git diff 信息
    let diffInfo = '';
    if (verbose) {
      diffInfo = execSync('git diff --cached').toString();
      console.log(chalk.cyan('Changes to be committed:'));
      console.log(chalk.gray(diffInfo));
    }

    // 获取文件变更信息
    const files = execSync('git diff --cached --name-only').toString().trim();
    
    // 准备提示信息
    const prompt = language === 'zh'
      ? `请根据以下 Git 变更生成一个符合 Conventional Commits 规范的提交信息：\n${files}${verbose ? `\n变更详情：\n${diffInfo}` : ''}`
      : `Generate a Conventional Commits compliant message for these Git changes:\n${files}${verbose ? `\nChanges:\n${diffInfo}` : ''}`;

    // 调用 AI API
    const response = await axios.post(config.ai.baseURL, {
      model: config.ai.model,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const commitMessage = response.data.choices[0].message.content.trim();
    
    if (!commitMessage) {
      throw new Error('API returned empty response');
    }

    // 验证 commit message 格式
    if (!isValidCommitMessage(commitMessage)) {
      if (verbose) {
        console.log(chalk.yellow('Generated message:'), commitMessage);
      }
      throw new Error('Generated commit message does not follow conventional commits format');
    }

    return commitMessage;
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
