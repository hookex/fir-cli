import { config } from '../config/config.js';
import { execSync } from 'child_process';
import chalk from 'chalk';
import fetch from 'node-fetch';

interface AIResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

export async function generateCommitMessage(): Promise<string> {
  try {
    // 获取 git diff 信息
    const diffOutput = execSync('git diff --cached').toString();
    if (!diffOutput) {
      throw new Error('No staged changes found. Please stage your changes first using git add');
    }

    // 构建提示信息
    const prompt = `
      作为一个 Git commit message 生成助手，请根据以下 git diff 内容生成一个符合 conventional commits 规范的提交信息。
      要求：
      1. 使用英文
      2. 简洁明了
      3. 遵循格式：<type>(<scope>): <description>
      4. type 必须是以下之一：feat, fix, docs, style, refactor, test, chore
      5. scope 是可选的
      6. description 使用现在时态，不要以大写字母开头，不要以句号结尾
      
      Git diff 内容：
      ${diffOutput}
    `;

    // 检查 API 密钥
    if (!config.doubanAI.apiKey) {
      throw new Error('DOUBAN_API_KEY not found. Please set it in your environment variables.');
    }

    // 调用豆包 API
    const response = await fetch(config.doubanAI.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.doubanAI.apiKey}`,
      },
      body: JSON.stringify({
        model: 'doubao-text', // 替换为实际的模型名称
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json() as AIResponse;
    const commitMessage = data.choices[0].message.content.trim();

    // 验证 commit message 格式
    if (!isValidCommitMessage(commitMessage)) {
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
  return conventionalCommitRegex.test(message);
}
