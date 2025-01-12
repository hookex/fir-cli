import { execSync } from 'child_process';
import chalk from 'chalk';
import open from 'open';
import { generateCommitMessage } from '../services/ai.js';
import inquirer from 'inquirer';
import { getConfig } from '../config/ai.js';
import ora from 'ora';

export async function handleGitCommit(message?: string, verbose?: boolean): Promise<void> {
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
      console.log('Generating commit message...');
      
      const config = getConfig();
      const language = config.useChinese ? 'zh' : 'en';
      
      console.log('API Configuration:');
      console.log(`- Base URL: ${process.env.API_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3'}`);
      console.log(`- Model: ${process.env.API_MODEL || 'ep-20241217193710-knrhh'}`);
      console.log(`- Language: ${language}`);

      try {
        // 生成 AI commit 信息
        const generatedMessage = await generateCommitMessage(verbose, language);
        
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

export async function handleGitPush(message?: string, verbose?: boolean): Promise<void> {
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

interface GitStatus {
  modified: string[];
  added: string[];
  untracked: string[];
}

function getGitStatus(): GitStatus {
  const status = {
    modified: [] as string[],
    added: [] as string[],
    untracked: [] as string[]
  };

  try {
    // 获取 git status 输出
    const output = execSync('git status --porcelain', { encoding: 'utf-8' });
    
    // 解析每一行
    output.split('\n').forEach(line => {
      if (!line) return;
      
      const [state, file] = [line.slice(0, 2).trim(), line.slice(3)];
      
      if (state === 'M') {
        status.modified.push(file);
      } else if (state === 'A') {
        status.added.push(file);
      } else if (state === '??') {
        status.untracked.push(file);
      }
    });
  } catch (error) {
    console.error(chalk.red('Error getting git status:'), error);
  }

  return status;
}

async function confirmClean(status: GitStatus) {
  const { modified, added, untracked } = status;
  const hasChanges = modified.length > 0 || added.length > 0 || untracked.length > 0;

  if (!hasChanges) {
    console.log(chalk.green('✓ Working directory is clean'));
    return false;
  }

  console.log(chalk.yellow('\nFound changes:'));
  
  if (modified.length > 0) {
    console.log(chalk.cyan('\nModified files:'));
    modified.forEach(file => console.log(chalk.gray(`  ${file}`)));
  }
  
  if (added.length > 0) {
    console.log(chalk.cyan('\nAdded files:'));
    added.forEach(file => console.log(chalk.gray(`  ${file}`)));
  }
  
  if (untracked.length > 0) {
    console.log(chalk.cyan('\nUntracked files:'));
    untracked.forEach(file => console.log(chalk.gray(`  ${file}`)));
  }

  const { confirm } = await inquirer.prompt([{
    type: 'confirm',
    name: 'confirm',
    message: chalk.yellow('Are you sure you want to clean these changes?'),
    default: false
  }]);

  return confirm;
}

export async function handleClean() {
  const spinner = ora('Checking git status...').start();
  
  try {
    const status = getGitStatus();
    spinner.stop();

    if (await confirmClean(status)) {
      spinner.start('Cleaning changes...');
      
      // 重置已暂存的更改
      if (status.modified.length > 0 || status.added.length > 0) {
        execSync('git reset --hard HEAD');
      }
      
      // 删除未跟踪的文件和目录
      if (status.untracked.length > 0) {
        execSync('git clean -fd');
      }
      
      spinner.succeed('Changes cleaned successfully');
    }
  } catch (error: any) {
    spinner.fail('Failed to clean changes');
    console.error(chalk.red('Error:'), error.message);
  }
}
