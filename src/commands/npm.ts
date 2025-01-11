import { execSync } from 'child_process';
import chalk from 'chalk';

export async function installAndRunGlobalPackage(packageName: string, args: string[] = []): Promise<void> {
  try {
    // 首先检查命令是否存在
    let isInstalled = false;
    try {
      execSync(`which ${packageName}`, { stdio: 'ignore' });
      isInstalled = true;
    } catch {
      // 命令不存在，进行安装
      console.log(chalk.yellow(`${packageName} not found. Installing...`));
      
      try {
        // 使用 npm install -g 安装包
        execSync(`npm install -g ${packageName}`, { stdio: 'inherit' });
        console.log(chalk.green(`✓ Successfully installed ${packageName}`));
        isInstalled = true;
      } catch (installError: any) {
        console.error(chalk.red(`Failed to install ${packageName}:`), installError.message);
        return;
      }
    }

    if (isInstalled) {
      // 如果没有参数，尝试显示帮助信息
      if (args.length === 0) {
        try {
          console.log(chalk.cyan(`\nAvailable commands for ${packageName}:`));
          execSync(`${packageName} --help`, { stdio: 'inherit' });
        } catch (helpError) {
          // 如果 --help 不可用，尝试直接运行命令
          execSync(packageName, { stdio: 'inherit' });
        }
      } else {
        // 运行带参数的命令
        console.log(chalk.cyan(`Running ${packageName} ${args.join(' ')}`));
        execSync(`${packageName} ${args.join(' ')}`, { stdio: 'inherit' });
      }
    }
  } catch (error: any) {
    // 格式化错误输出
    if (error.message.includes('Command failed')) {
      const errorMessage = error.message.split('\n')[0];
      console.error(chalk.red(`Error running ${packageName}:`), errorMessage);
    } else {
      console.error(chalk.red(`Error running ${packageName}:`), error.message);
    }
    
    // 显示使用帮助
    console.log(chalk.yellow('\nTry running with --help to see available commands:'));
    console.log(chalk.cyan(`  ${packageName} --help`));
  }
}
