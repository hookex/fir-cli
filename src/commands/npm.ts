import { execSync } from 'child_process';
import chalk from 'chalk';
import { searchNpmPackages } from '../services/npm.js';

export async function installAndRunGlobalPackage(packageName: string, args: string[] = []): Promise<void> {
  try {
    // 首先检查命令是否存在
    let isInstalled = false;
    try {
      execSync(`which ${packageName}`, { stdio: 'ignore' });
      isInstalled = true;
    } catch {
      // 命令不存在，先尝试搜索 npm
      console.log(chalk.yellow(`Command '${packageName}' not found. Searching npm...`));
      
      const packages = await searchNpmPackages(packageName);
      if (packages.length === 0) {
        console.log(chalk.red('No matching packages found.'));
        return;
      }

      // 显示搜索结果
      console.log(chalk.cyan('\nFound similar packages:'));
      packages.forEach((pkg, index) => {
        console.log(chalk.white(`${index + 1}. ${pkg.name} - ${pkg.description}`));
        console.log(chalk.gray(`   Downloads: ${pkg.downloads} | Version: ${pkg.version}`));
      });

      // 提示用户选择
      console.log(chalk.cyan('\nTo install a package, run:'));
      console.log(chalk.white(`npm install -g <package-name>`));
      return;
    }

    if (!isInstalled) {
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

function commandExists(command: string): boolean {
  try {
    execSync(`which ${command}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}
