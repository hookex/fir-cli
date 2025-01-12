import { execSync } from 'child_process';
import chalk from 'chalk';
import open from 'open';
import { generateCommitMessage } from '../services/ai.js';
import inquirer from 'inquirer';

export async function handleGitCommit(message?: string, verbose: boolean = false): Promise<void> {
  try {
    // 检查是否有暂存的更改
    const stagedChanges = execSync('git diff --cached --name-only').toString().trim();
    if (!stagedChanges) {
      // 如果没有暂存的更改，自动添加所有更改
      console.log(chalk.yellow('No staged changes found. Adding all changes...'));
      execSync('git add .');
    }

    // 再次检查是否有可提交的更改
    const hasChanges = execSync('git status --porcelain').toString().trim();
    if (!hasChanges) {
      console.log(chalk.yellow('No changes to commit'));
      return;
    }

    let commitMessage = message;

    // 如果没有提供消息，使用 AI 生成
    if (!commitMessage) {
      try {
        // 生成 AI commit 信息
        const generatedMessage = await generateCommitMessage(verbose);
        
        // 让用户确认或编辑生成的信息
        const { action } = await inquirer.prompt([
          {
            type: 'list',
            name: 'action',
            message: chalk.cyan('AI generated commit message:') + '\n' + 
                    chalk.white(generatedMessage) + '\n' +
                    chalk.cyan('What would you like to do?'),
            choices: [
              { name: 'Use this message', value: 'use' },
              { name: 'Edit message', value: 'edit' },
              { name: 'Cancel', value: 'cancel' }
            ]
          }
        ]);

        if (action === 'cancel') {
          console.log(chalk.yellow('Commit cancelled'));
          return;
        }

        if (action === 'edit') {
          const { editedMessage } = await inquirer.prompt([
            {
              type: 'input',
              name: 'editedMessage',
              message: 'Edit commit message:',
              default: generatedMessage
            }
          ]);
          commitMessage = editedMessage;
        } else {
          commitMessage = generatedMessage;
        }
      } catch (error: any) {
        console.error(chalk.red('Failed to generate commit message:'), error.message);
        
        // 如果 AI 生成失败，让用户手动输入
        const { manualMessage } = await inquirer.prompt([
          {
            type: 'input',
            name: 'manualMessage',
            message: 'Enter commit message manually:',
            validate: (input: string) => input.length > 0 || 'Commit message cannot be empty'
          }
        ]);
        commitMessage = manualMessage;
      }
    }

    // 执行 git commit
    execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
    console.log(chalk.green('✓ Changes committed successfully'));
  } catch (error: any) {
    console.error(chalk.red('Git commit failed:'), error.message);
  }
}

export async function handleGitPush(message?: string, verbose: boolean = false): Promise<void> {
  try {
    // 如果没有提供消息，使用 AI 生成的 commit
    if (!message) {
      await handleGitCommit(undefined, verbose);
    } else {
      await handleGitCommit(message, verbose);
    }
    
    // 获取当前分支
    const currentBranch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
    
    console.log(chalk.cyan(`Pushing to ${currentBranch}...`));
    execSync(`git push origin ${currentBranch}`, { stdio: 'inherit' });
    console.log(chalk.green('✓ Changes pushed successfully'));
  } catch (error: any) {
    console.error(chalk.red('Git push failed:'), error.message);
  }
}

export async function handleGitOpen(): Promise<void> {
  try {
    // 获取远程仓库 URL
    const remoteUrl = execSync('git remote get-url origin').toString().trim();
    
    // 转换 SSH URL 为 HTTPS URL
    const httpsUrl = remoteUrl
      .replace(/^git@/, 'https://')
      .replace(/\.git$/, '')
      .replace(/:([\w-]+\/[\w-]+)$/, '/$1');
    
    console.log(`✓ Opened ${httpsUrl} in browser`);
    await open(httpsUrl);
  } catch (error: any) {
    console.error('Error:', error.message);
  }
}
