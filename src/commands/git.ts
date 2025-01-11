import { execSync } from 'child_process';
import chalk from 'chalk';
import open from 'open';
import { generateCommitMessage } from '../services/ai.js';
import inquirer from 'inquirer';

export async function handleGitCommit(message?: string): Promise<void> {
  try {
    let commitMessage = message;

    if (!commitMessage) {
      try {
        // 生成 AI commit 信息
        const generatedMessage = await generateCommitMessage();
        
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
    execSync(`git add .`, { stdio: 'inherit' });
    execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
    console.log(chalk.green('✓ Changes committed successfully'));
  } catch (error: any) {
    if (error.message.includes('nothing to commit')) {
      console.error(chalk.yellow('No changes to commit. Stage your changes first using git add'));
    } else {
      console.error(chalk.red('Git commit failed:'), error.message);
    }
  }
}

export async function handleGitPush(message?: string): Promise<void> {
  try {
    if (message) {
      await handleGitCommit(message);
    }
    const currentBranch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
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
    
    // 转换 SSH 地址为 HTTPS
    const httpsUrl = remoteUrl
      .replace(/^git@/, 'https://')
      .replace(/\.git$/, '')
      .replace(/:/g, '/');

    await open(httpsUrl);
    console.log(chalk.green(`✓ Opened ${httpsUrl} in browser`));
  } catch (error: any) {
    console.error(chalk.red('Failed to open repository:'), error.message);
  }
}
