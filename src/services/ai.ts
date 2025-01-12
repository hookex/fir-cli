import axios from 'axios';
import { config } from '../config/config.js';
import { getConfig } from '../config/ai.js';
import chalk from 'chalk';
import { execSync } from 'child_process';

const conventionalCommitPattern = /^(feat|fix|docs|style|refactor|perf|test|chore|ci|build|revert)(\([a-z-]+\))?: .+/;

function getGitChanges(verbose: boolean): string {
  try {
    let changes = '';
    
    // 获取暂存区文件列表
    const stagedFiles = execSync('git diff --cached --name-only', { encoding: 'utf-8' }).trim();
    if (stagedFiles) {
      changes += '暂存的文件:\n' + stagedFiles + '\n\n';
    }

    if (verbose) {
      // 获取详细的差异
      const diff = execSync('git diff --cached', { encoding: 'utf-8' }).trim();
      if (diff) {
        changes += '详细更改:\n' + diff;
      }
    }

    return changes || '没有暂存的更改';
  } catch (error) {
    console.error('Error getting git changes:', error);
    return '无法获取 git 更改';
  }
}

export async function generateCommitMessage(verbose?: boolean): Promise<string> {
  try {
    const { language } = getConfig();
    
    // 构建更详细的系统提示
    const systemPrompt = language === 'zh' ?
      `你是一个专业的代码审查者，负责生成高质量的 Git 提交消息。请遵循以下规则：

1. 使用 Conventional Commits 规范：
   - 格式：<type>[(scope)]: <description>
   - 类型：feat(新功能), fix(修复), docs(文档), style(格式), refactor(重构), perf(性能), test(测试), chore(杂项)
   - 范围是可选的，用小写字母，例如：cli, api, core
   - 描述使用中文，简洁明了，不超过50个字符
   
2. 消息风格：
   - 以动词开头：添加、修复、改进、更新、删除等
   - 清晰描述改动的内容和目的
   - 如果修复了问题，说明修复了什么
   - 如果添加了功能，说明添加了什么

3. 示例：
   - feat(cli): 添加自动补全功能
   - fix(api): 修复请求超时问题
   - refactor: 重构命令处理逻辑
   - style(ui): 改进错误提示样式

请根据以下 Git 更改生成提交消息：` :
      `You are a professional code reviewer responsible for generating high-quality Git commit messages. Please follow these rules:

1. Follow Conventional Commits specification:
   - Format: <type>[(scope)]: <description>
   - Types: feat(new feature), fix(bug fix), docs(documentation), style(formatting), refactor(refactoring), perf(performance), test(testing), chore(maintenance)
   - Scope is optional, use lowercase, e.g.: cli, api, core
   - Description should be clear and concise, not exceeding 50 characters
   
2. Message style:
   - Start with a verb: add, fix, improve, update, remove, etc.
   - Clearly describe what and why was changed
   - If fixing an issue, state what was fixed
   - If adding a feature, state what was added

3. Examples:
   - feat(cli): add auto-completion support
   - fix(api): resolve request timeout issue
   - refactor: restructure command handling logic
   - style(ui): improve error message display

Please generate a commit message based on the following Git changes:`;

    const changes = getGitChanges(verbose || false);
    
    const response = await axios.post(config.ai.baseURL, {
      model: config.ai.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: changes }
      ],
      temperature: 0.7,
      max_tokens: 100,
      stream: false
    }, {
      headers: {
        'Authorization': `Bearer ${config.ai.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    const message = response.data.choices[0].message.content.trim();
    
    // 检查生成的消息是否符合规范
    if (!conventionalCommitPattern.test(message)) {
      console.log(chalk.yellow('\nWarning: Generated commit message does not follow conventional commits format'));
      console.log(chalk.gray('Format should be: type(scope?): description'));
      console.log(chalk.gray('Example: feat(cli): add new command'));
    }
    
    return message;
  } catch (error: any) {
    console.error(chalk.red('Error generating commit message:'), error.message);
    throw error;
  }
}
