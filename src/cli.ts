#!/usr/bin/env node --no-deprecation
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { registerCommands } from './commands/index.js';
import chalk from 'chalk';
import figlet from 'figlet';

process.env.NODE_NO_WARNINGS = '1';

// 显示欢迎信息的函数
function showWelcome() {
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

// 检查是否需要显示欢迎信息
const args = hideBin(process.argv);
const shouldShowWelcome = args.length === 0 || // 没有参数时
                         args[0] === 'help' || // 显示帮助时
                         args[0] === '--help' || // 显示帮助时
                         args[0] === '-h'; // 显示帮助时

if (shouldShowWelcome) {
  showWelcome();
}

// 配置 yargs
const cli = yargs(hideBin(process.argv))
  .scriptName('one')
  .usage('$0 <command> [options]')
  .version()
  .alias('v', 'version')
  .help()
  .alias('h', 'help');

// 注册所有命令
registerCommands(cli).parse();
