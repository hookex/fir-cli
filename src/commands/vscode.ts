import open from 'open';
import { execSync, exec } from 'child_process';
import chalk from 'chalk';

async function checkCodeCommand(): Promise<boolean> {
  try {
    execSync('which code', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

async function installCodeCommand(): Promise<boolean> {
  console.log(chalk.yellow('VS Code CLI command not found. Installing...'));
  
  try {
    // 检查是否已安装 VS Code
    const vscodePath = '/Applications/Visual Studio Code.app';
    if (!execSync(`ls "${vscodePath}"`, { stdio: 'ignore' })) {
      console.log(chalk.red('VS Code is not installed. Please install VS Code first.'));
      console.log(chalk.blue('You can download it from: https://code.visualstudio.com/'));
      return false;
    }

    // 安装 code 命令
    console.log(chalk.gray('Installing VS Code CLI command...'));
    execSync(`ln -s "${vscodePath}/Contents/Resources/app/bin/code" /usr/local/bin/code`);
    console.log(chalk.green('VS Code CLI command installed successfully!'));
    return true;
  } catch (error: any) {
    if (error.message.includes('Permission denied')) {
      console.log(chalk.red('Permission denied. Please run with sudo:'));
      console.log(chalk.yellow('sudo ln -s "/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code" /usr/local/bin/code'));
    } else {
      console.log(chalk.red('Failed to install VS Code CLI command:'), error.message);
    }
    return false;
  }
}

export async function openInVSCode(): Promise<void> {
  try {
    // 检查 code 命令是否可用
    if (!await checkCodeCommand()) {
      // 尝试安装 code 命令
      if (!await installCodeCommand()) {
        return;
      }
    }
    
    // 打开当前目录
    await open('code .');
    console.log(chalk.green('Opening VS Code...'));
  } catch (error: any) {
    console.error(chalk.red('Error opening VS Code:'), error.message);
  }
}
