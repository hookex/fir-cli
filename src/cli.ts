#!/usr/bin/env node --no-deprecation
import figlet from 'figlet';
import chalk from 'chalk';
import { registerCommands } from './commands/index.js';
import { createAliases } from './utils/aliases.js';

process.env.NODE_NO_WARNINGS = '1';

// 创建命令行别名
console.log('Binary path:', process.argv[1]);
createAliases(process.argv[1]);

// 显示欢迎信息
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

// 注册命令
registerCommands().parse();
