import { execSync } from 'child_process';
import chalk from 'chalk';
import path from 'path';

export async function installAndRunGlobalPackage(packageName: string, args: string[] = []): Promise<void> {
  try {
    // 特殊处理 ncu 命令
    const actualPackageName = packageName === 'ncu' ? 'npm-check-updates' : packageName;
    const commandName = packageName; // 保持原始命令名用于执行

    // 首先检查命令是否存在
    let isInstalled = false;
    try {
      execSync(`which ${commandName}`, { stdio: 'ignore' });
      isInstalled = true;
    } catch {
      // 命令不存在，进行安装
      console.log(chalk.yellow(`${commandName} not found. Installing ${actualPackageName}...`));
      
      try {
        // 使用 npm install -g 安装包
        execSync(`npm install -g ${actualPackageName}`, { stdio: 'inherit' });
        console.log(chalk.green(`✓ Successfully installed ${actualPackageName}`));
        isInstalled = true;
      } catch (installError: any) {
        console.error(chalk.red(`Failed to install ${actualPackageName}:`), installError.message);
        return;
      }
    }

    if (isInstalled) {
      // 对于 ncu 命令，如果没有指定路径，使用当前目录的 package.json
      if (commandName === 'ncu' && args.length === 0) {
        const cwd = process.cwd();
        if (execSync('test -f package.json || echo "no"', { cwd }).toString().trim() === '') {
          // package.json 存在，执行 ncu
          console.log(chalk.cyan(`Checking ${path.join(cwd, 'package.json')}`));
          execSync(`${commandName}`, { stdio: 'inherit', cwd });
        } else {
          console.error(chalk.red('No package.json found in the current directory'));
          return;
        }
      } else {
        // 运行其他命令或带参数的 ncu
        if (args.length === 0) {
          try {
            console.log(chalk.cyan(`\nAvailable commands for ${commandName}:`));
            execSync(`${commandName} --help`, { stdio: 'inherit' });
          } catch (helpError) {
            execSync(commandName, { stdio: 'inherit' });
          }
        } else {
          console.log(chalk.cyan(`Running ${commandName} ${args.join(' ')}`));
          execSync(`${commandName} ${args.join(' ')}`, { stdio: 'inherit' });
        }
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
