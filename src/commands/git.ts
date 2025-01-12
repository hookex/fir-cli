import { execSync } from 'child_process';
import chalk from 'chalk';
import { generateCommitMessage } from '../services/ai.js';
import ora from 'ora';

// 处理 commit 命令
export async function handleGitCommit(verbose?: boolean) {
  try {
    // 检查是否有暂存的更改
    const status = execSync('git status --porcelain').toString();
    if (!status) {
      console.log(chalk.yellow('No changes to commit'));
      return;
    }

    // 显示暂存的更改
    if (verbose) {
      console.log(chalk.cyan('\nChanges to be committed:'));
      console.log(chalk.gray('----------------------------------------'));
      console.log(status);
      console.log(chalk.gray('----------------------------------------\n'));
    }

    const spinner = ora('Generating commit message...').start();

    try {
      // 生成提交信息
      const message = await generateCommitMessage(verbose);
      spinner.stop();

      // 执行 git commit
      execSync(`git commit -m "${message}"`, { stdio: 'inherit' });

    } catch (error: any) {
      spinner.fail('Failed to generate commit message');
      console.error(chalk.red('Error:'), error.message);
    }

  } catch (error: any) {
    console.error(chalk.red('Error:'), error.message);
  }
}

// 处理 push 命令
export async function handleGitPush(verbose?: boolean) {
  try {
    // 执行 git commit
    await handleGitCommit(verbose);
    
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
