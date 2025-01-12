#!/usr/bin/env node
import figlet from 'figlet';
import chalk from 'chalk';
import { registerCommands } from './commands/index.js';
import axios from 'axios';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { t } from './i18n/index.js';

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

// 显示欢迎信息
function showWelcomeMessage() {
  console.log(
    chalk.cyan(
      figlet.textSync('Fir CLI', {
        font: 'Standard',
        horizontalLayout: 'default',
        verticalLayout: 'default'
      })
    )
  );
  console.log(chalk.yellow(t('welcome.slogan') + '\n'));
}

// 检查版本更新
async function checkVersion() {
  const currentVersion = getCurrentVersion();
  const latestVersion = await getLatestVersion();
  
  if (latestVersion) {
    console.log(chalk.gray(t('welcome.version.current', { version: currentVersion })));
    if (latestVersion !== currentVersion) {
      console.log(chalk.yellow(t('welcome.version.latest', { version: latestVersion })));
      console.log(chalk.green('\n' + t('welcome.version.update') + '\n'));
    } else {
      console.log(chalk.green(t('welcome.version.latest_version') + '\n'));
    }
  }
  return currentVersion;
}

// 主函数
async function main() {
  try {
    const args = process.argv.slice(2);
    const scriptName = process.argv[1].endsWith('fir') ? 'fir' : 'f';
    const showWelcome = args.length === 0 || args[0] === '--help' || args[0] === '-h';
    
    // 只在没有具体命令时显示欢迎信息和版本信息
    let currentVersion;
    if (showWelcome) {
      showWelcomeMessage();
      currentVersion = await checkVersion();
    } else {
      currentVersion = getCurrentVersion();
    }
    
    // 注册命令并解析参数
    await registerCommands(currentVersion, scriptName);
  } catch (error: any) {
    console.error(chalk.red(t('common.error')), error.message);
    process.exit(1);
  }
}

main();
