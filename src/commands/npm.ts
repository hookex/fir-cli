import { execSync } from 'child_process';
import chalk from 'chalk';

export async function installAndRunGlobalPackage(packageName: string, args: string[] = []): Promise<void> {
  try {
    // 首先检查命令是否存在
    try {
      execSync(`which ${packageName}`, { stdio: 'ignore' });
      console.log(chalk.green(`✓ ${packageName} is already installed`));
    } catch {
      // 命令不存在，进行安装
      console.log(chalk.yellow(`${packageName} not found. Installing...`));
      
      try {
        // 使用 npm install -g 安装包
        execSync(`npm install -g ${packageName}`, { stdio: 'inherit' });
        console.log(chalk.green(`✓ Successfully installed ${packageName}`));
      } catch (installError: any) {
        console.error(chalk.red(`Failed to install ${packageName}:`), installError.message);
        return;
      }
    }

    // 运行命令
    console.log(chalk.cyan(`Running ${packageName}${args.length ? ' ' + args.join(' ') : ''}`));
    execSync(`${packageName} ${args.join(' ')}`, { stdio: 'inherit' });
  } catch (error: any) {
    console.error(chalk.red(`Error running ${packageName}:`), error.message);
  }
}
