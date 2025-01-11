#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import figlet from 'figlet';
import chalk from 'chalk';
import { registerCommands } from './commands/index.js';
import { createAliases } from './utils/aliases.js';

// 创建 ASCII 艺术字
const title = figlet.textSync('Only One CLI', {
  font: 'Standard',
  horizontalLayout: 'default',
  verticalLayout: 'default',
  width: 80,
  whitespaceBreak: true
});

// 输出带颜色的标题
console.log(chalk.cyan(title));
console.log(chalk.gray('Your command line companion\n'));

// 创建基础命令
const baseCommand = yargs(hideBin(process.argv))
  .scriptName('one')
  .usage('$0 [cmd] [args]')
  .wrap(null)
  .strict()
  .help()
  .alias('h', 'help')
  .alias('v', 'version');

// 注册所有命令
registerCommands(baseCommand);

// 创建命令的别名
const argv = baseCommand.parse();

// 创建软链接别名
createAliases(process.argv[1]);
