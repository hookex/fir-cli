import { execSync } from 'child_process';
import chalk from 'chalk';
import { searchNpmPackages, promptPackageSelection } from '../services/npm.js';

export async function installAndRunGlobalPackage(command: string, args: string[] = []) {
  try {
    // 如果命令不存在，先尝试搜索 npm
    if (!commandExists(command)) {
      console.log(chalk.yellow(`Command '${command}' not found. Searching npm...`));
      
      const packages = await searchNpmPackages(command);
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
      const selectedPackage = await promptPackageSelection(packages);
      if (!selectedPackage) {
        console.log(chalk.yellow('Installation cancelled.'));
        return;
      }

      // 安装选中的包
      console.log(chalk.yellow(`\nInstalling ${selectedPackage.name}...`));
      execSync(`npm install -g ${selectedPackage.name}`, { stdio: 'inherit' });
      
      console.log(chalk.green(`\n${selectedPackage.name} installed successfully!`));
      
      // 运行安装的命令
      console.log(chalk.cyan(`\nRunning ${command} ${args.join(' ')}...\n`));
      execSync(`${command} ${args.join(' ')}`, { stdio: 'inherit' });
      return;
    }

    // 如果命令存在，直接运行
    execSync(`${command} ${args.join(' ')}`, { stdio: 'inherit' });
  } catch (error: any) {
    if (error.status === 127) {  // Command not found
      throw new Error(`Command '${command}' not found and installation failed.`);
    }
    throw error;
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
