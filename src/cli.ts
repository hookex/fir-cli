#!/usr/bin/env node --no-deprecation
import figlet from 'figlet';
import chalk from 'chalk';
import { registerCommands } from './commands/index.js';

process.env.NODE_NO_WARNINGS = '1';

// 只在特定命令时显示欢迎信息
const args = process.argv.slice(2);
const showLogo = args.length === 0 || args[0] === '--help' || args[0] === '-h';

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
}

// 注册命令
registerCommands();
