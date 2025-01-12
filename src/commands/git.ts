import { execSync } from 'child_process';
import chalk from 'chalk';
import { generateCommitMessage } from '../services/ai.js';
import ora from 'ora';
import inquirer from 'inquirer';

// 处理 commit 命令
export async function handleGitCommit(verbose?: boolean): Promise<boolean> {
  try {
    // 获取未暂存的更改
    function getUnstagedChanges(): string[] {
      try {
        return execSync('git ls-files --modified --others --exclude-standard', { encoding: 'utf-8' })
          .trim()
          .split('\n')
          .filter(Boolean);
      } catch (error) {
        return [];
      }
    }

    // 显示 Git 状态
    function showGitStatus() {
      try {
        // 获取状态信息
        const status = execSync('git status --porcelain').toString();
        const diff = execSync('git diff --cached --stat').toString();
        
        if (!status && !diff) {
          console.log(chalk.yellow('No changes detected'));
          return false;
        }

        console.log(chalk.cyan('\nCurrent changes:'));
        console.log(chalk.gray('----------------------------------------'));
        
        if (status) {
          console.log(status);
        }
        
        if (diff) {
          console.log('\nStaged changes:');
          console.log(diff);
        }
        
        console.log(chalk.gray('----------------------------------------'));
        return true;
      } catch (error) {
        console.error(chalk.red('Error getting git status:'), error);
        return false;
      }
    }

    // 检查是否有未暂存的更改
    const unstagedChanges = getUnstagedChanges();
    if (unstagedChanges.length > 0) {
      console.log(chalk.yellow('\nUnstaged changes found:'));
      unstagedChanges.forEach(file => console.log(chalk.gray(`  ${file}`)));
      
      const { autoAdd } = await inquirer.prompt([{
        type: 'confirm',
        name: 'autoAdd',
        message: 'Would you like to stage these changes?',
        default: true
      }]);

      if (autoAdd) {
        execSync('git add .', { stdio: 'inherit' });
        console.log(chalk.green('✓ Changes staged'));
      } else {
        console.log(chalk.yellow('Please stage your changes manually before committing'));
        return false;
      }
    }

    // 显示当前状态
    if (!showGitStatus()) {
      return false;
    }

    // 询问是否使用 AI 生成提交消息
    const { useAI } = await inquirer.prompt([{
      type: 'confirm',
      name: 'useAI',
      message: 'Would you like to use AI to generate commit message?',
      default: true
    }]);

    let message: string;
    if (useAI) {
      const spinner = ora('Generating commit message...').start();
      try {
        message = await generateCommitMessage(verbose);
        spinner.stop();
      } catch (error: any) {
        spinner.fail('Failed to generate commit message');
        console.error(chalk.red('Error:'), error.message);
        return false;
      }
    } else {
      const { manualMessage } = await inquirer.prompt([{
        type: 'input',
        name: 'manualMessage',
        message: 'Enter commit message:',
        validate: (input: string) => {
          if (!input.trim()) {
            return 'Commit message cannot be empty';
          }
          return true;
        }
      }]);
      message = manualMessage;
    }

    // 执行 git commit
    execSync(`git commit -m "${message}"`, { stdio: 'inherit' });
    console.log(chalk.green('✓ Changes committed successfully'));
    return true;

  } catch (error: any) {
    console.error(chalk.red('Error:'), error.message);
    return false;
  }
}

// 处理 push 命令
export async function handleGitPush(verbose?: boolean) {
  try {
    // 显示当前状态
    function showGitStatus() {
      try {
        // 获取状态信息
        const status = execSync('git status --porcelain').toString();
        const diff = execSync('git diff --cached --stat').toString();
        
        if (!status && !diff) {
          console.log(chalk.yellow('No changes detected'));
          return false;
        }

        console.log(chalk.cyan('\nCurrent changes:'));
        console.log(chalk.gray('----------------------------------------'));
        
        if (status) {
          console.log(status);
        }
        
        if (diff) {
          console.log('\nStaged changes:');
          console.log(diff);
        }
        
        console.log(chalk.gray('----------------------------------------'));
        return true;
      } catch (error) {
        console.error(chalk.red('Error getting git status:'), error);
        return false;
      }
    }

    // 显示当前状态
    showGitStatus();

    // 执行 git commit
    const commitSuccess = await handleGitCommit(verbose);
    if (!commitSuccess) {
      return;
    }

    // 询问是否推送
    const { autoPush } = await inquirer.prompt([{
      type: 'confirm',
      name: 'autoPush',
      message: 'Would you like to push these changes?',
      default: true
    }]);

    if (!autoPush) {
      console.log(chalk.yellow('Push cancelled'));
      return;
    }
    
    // 获取当前分支
    const currentBranch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
    
    // 检查是否有远程分支
    const hasRemote = execSync(`git ls-remote --heads origin ${currentBranch}`).toString().trim();
    
    // 如果没有远程分支，创建并设置上游
    if (!hasRemote) {
      console.log(chalk.yellow(`Remote branch '${currentBranch}' not found. Creating it...`));
      execSync(`git push -u origin ${currentBranch}`, { stdio: 'inherit' });
    } else {
      // 如果有远程分支，直接推送
      execSync('git push', { stdio: 'inherit' });
    }
    
    console.log(chalk.green('✓ Changes pushed successfully'));
  } catch (error: any) {
    console.error(chalk.red('Git push failed:'), error.message);
  }
}

// 处理 open 命令
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

  return true;
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
