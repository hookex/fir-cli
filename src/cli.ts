#!/usr/bin/env node
import figlet from 'figlet';
import chalk from 'chalk';
import { registerCommands } from './commands/index.js';
import axios from 'axios';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

process.env.NODE_NO_WARNINGS = '1';

// 获取 npm 仓库中的最新版本
async function getLatestVersion() {
  try {
    const response = await axios.get('https://registry.npmjs.org/fir-cli/latest');
    return response.data.version;
  } catch (error) {
    return null;
  }
}

// 获取当前安装的版本
function getCurrentVersion() {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const packagePath = join(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(readFileSync(packagePath, 'utf-8'));
    return packageJson.version;
  } catch (error) {
    return 'unknown';
  }
}

// 只在特定命令时显示欢迎信息
const args = process.argv.slice(2);
const showLogo = args.length === 0 || args[0] === '--help' || args[0] === '-h';
const currentVersion = getCurrentVersion();

if (showLogo) {
  console.log(
    chalk.cyan(
      figlet.textSync('Fir CLI', {
        font: 'Standard',
        horizontalLayout: 'default',
        verticalLayout: 'default'
      })
    )
  );
  console.log(chalk.yellow('Your command line companion\n'));

  // 显示版本信息
  getLatestVersion().then(latestVersion => {
    console.log(chalk.gray(`Current version: v${currentVersion}`));
    if (latestVersion && latestVersion !== currentVersion) {
      console.log(chalk.yellow(`Latest version: v${latestVersion}`));
      console.log(chalk.green('\nRun "npm install -g fir-cli" to update\n'));
    } else {
      console.log(chalk.green('You are using the latest version\n'));
    }
  });
}

// 注册命令
registerCommands(currentVersion).catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
