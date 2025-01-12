import axios from 'axios';
import { execSync } from 'child_process';
import chalk from 'chalk';
import { config } from '../config/config.js';

export async function generateCommitMessage(verbose: boolean = false, language: string = 'en'): Promise<string> {
  try {
    // 获取 git diff 信息
    let diffInfo = '';
    if (verbose) {
      diffInfo = execSync('git diff --cached').toString();
      console.log('Changes to be committed:');
      console.log(diffInfo);
    }

    // 获取文件变更信息
    const files = execSync('git diff --cached --name-only').toString().trim();
    
    // 准备提示信息
    const systemPrompt = language === 'zh'
      ? `你是一个 Git 提交信息生成器。生成极其简短的提交信息：
         1. 格式：<type>: <description>
         2. type: feat, fix, docs, style, refactor, test, chore
         3. description 必须极其简短，使用最少的字描述变更
         4. 不要加句号，不要有多余的空格
         5. 最大长度：50个字符
         
         好的示例：
         - docs: 更新README
         - feat: 添加登录
         - fix: 修复崩溃
         - style: 优化格式
         
         不好的示例：
         - docs: 更新了 README.md 的文档内容 (太长)
         - feat: 添加了用户登录功能 (太长)
         - fix: 修复了应用崩溃的问题 (太长)`
      : `You are a Git commit message generator. Generate extremely concise messages:
         1. Format: <type>: <description>
         2. type: feat, fix, docs, style, refactor, test, chore
         3. description must be extremely short, use minimal words
         4. no period, no extra spaces
         5. maximum length: 50 characters
         
         Good examples:
         - docs: update README
         - feat: add login
         - fix: resolve crash
         - style: improve format
         
         Bad examples:
         - docs: update the README.md documentation content (too long)
         - feat: add user login functionality (too long)
         - fix: resolve application crash issue (too long)`;

    const userPrompt = language === 'zh'
      ? `请根据以下 Git 变更生成提交信息：\n${files}${verbose ? `\n变更详情：\n${diffInfo}` : ''}`
      : `Generate a commit message for these changes:\n${files}${verbose ? `\nChanges:\n${diffInfo}` : ''}`;

    // 调用 AI API
    const response = await axios.post(config.ai.baseURL, {
      model: config.ai.model,
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: userPrompt
        }
      ]
    }, {
      headers: {
        'Authorization': `Bearer ${config.ai.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    const commitMessage = response.data.choices[0].message.content.trim();
    
    if (!commitMessage) {
      throw new Error('API returned empty response');
    }

    // 验证 commit message 格式
    if (!isValidCommitMessage(commitMessage)) {
      console.log(chalk.yellow('\nWarning: Generated commit message does not follow conventional commits format'));
      console.log(chalk.gray('Format should be: type: description'));
      console.log(chalk.gray('Example: feat: add new command'));
    }

    return commitMessage;
  } catch (error: any) {
    console.error(chalk.red('Error generating commit message:'), error.message);
    throw error;
  }
}

// 验证 commit message 格式
function isValidCommitMessage(message: string): boolean {
  // 更宽松的正则表达式，允许中文字符，但限制更短的长度
  const pattern = /^(feat|fix|docs|style|refactor|test|chore): [\u4e00-\u9fa5a-zA-Z0-9\s_\-\.]+$/;
  return pattern.test(message) && message.length <= 50;
}
