import { execSync } from 'child_process';
import chalk from 'chalk';
import { generateCommitMessage } from '../services/ai.js';
import ora from 'ora';
import inquirer from 'inquirer';
import open from 'open';

// Git 状态接口
interface GitStatus {
  hasChanges: boolean;
  hasUnpushedCommits: boolean;
  currentBranch: string;
  unpushedCommits: string;
  stagedChanges: string;
  unstagedChanges: string;
}

// 获取 Git 状态
function getGitStatus(): GitStatus {
  try {
    const status = execSync('git status --porcelain').toString();
    const currentBranch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
    const stagedChanges = execSync('git diff --cached --stat').toString();
    const unstagedChanges = execSync('git diff --stat').toString();
    
    // 检查是否有未推送的提交
    let hasUnpushedCommits = false;
    let unpushedCommits = '';
    try {
      // 获取未推送的提交信息
      unpushedCommits = execSync('git log @{u}..', { encoding: 'utf-8' }).trim();
      hasUnpushedCommits = unpushedCommits.length > 0;
    } catch (error) {
      // 如果出错（比如没有上游分支），也认为有未推送的提交
      hasUnpushedCommits = true;
    }

    return {
      hasChanges: status.length > 0,
      hasUnpushedCommits,
      currentBranch,
      unpushedCommits,
      stagedChanges,
      unstagedChanges
    };
  } catch (error) {
    console.error(chalk.red('Error getting git status:'), error);
    throw error;
  }
}

// 显示 Git 状态
function showGitStatus(): GitStatus {
  const status = getGitStatus();
  
  // 如果既没有更改也没有未推送的提交，直接返回
  if (!status.hasChanges && !status.hasUnpushedCommits) {
    console.log(chalk.yellow('No changes or unpushed commits detected'));
    return status;
  }

  console.log(chalk.cyan('\nGit Status:'));
  console.log(chalk.gray('----------------------------------------'));
  
  // 显示未暂存和已暂存的更改
  if (status.hasChanges) {
    if (status.unstagedChanges) {
      console.log('Unstaged changes:');
      console.log(status.unstagedChanges);
    }
    
    if (status.stagedChanges) {
      console.log('Staged changes:');
      console.log(status.stagedChanges);
    }
  }
  
  // 显示未推送的提交
  if (status.hasUnpushedCommits) {
    console.log(chalk.yellow('\nUnpushed commits:'));
    console.log(status.unpushedCommits || '(new branch)');
  }
  
  console.log(chalk.gray('----------------------------------------'));
  return status;
}

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

// 处理 commit 命令
export async function handleGitCommit(verbose?: boolean): Promise<boolean> {
  try {
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
    const status = showGitStatus();
    if (!status.hasChanges) {
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
    // 显示当前状态并检查是否有更改或未推送的提交
    const status = showGitStatus();
    
    // 如果有未提交的更改，先提交
    if (status.hasChanges) {
      const commitSuccess = await handleGitCommit(verbose);
      if (!commitSuccess) {
        return;
      }
    }

    // 如果没有任何需要推送的内容，退出
    if (!status.hasChanges && !status.hasUnpushedCommits) {
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
    
    // 检查是否有远程分支
    const hasRemote = execSync(`git ls-remote --heads origin ${status.currentBranch}`).toString().trim();
    
    // 如果没有远程分支，创建并设置上游
    if (!hasRemote) {
      console.log(chalk.yellow(`Remote branch '${status.currentBranch}' not found. Creating it...`));
      execSync(`git push -u origin ${status.currentBranch}`, { stdio: 'inherit' });
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
    
    console.log(`✓ Opening ${httpsUrl} in browser`);
    await open(httpsUrl);
  } catch (error: any) {
    console.error('Error:', error.message);
  }
}

// 处理 clean 命令
interface GitCleanStatus {
  modified: string[];
  added: string[];
  untracked: string[];
}

function getGitCleanStatus(): GitCleanStatus {
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

async function confirmClean(status: GitCleanStatus) {
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
    const status = getGitCleanStatus();
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
