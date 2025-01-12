import { execSync } from 'child_process';
import chalk from 'chalk';
import { t } from '../i18n/index.js';

export async function handleDebug() {
  try {
    console.log(chalk.gray('⠋ ' + t('commands.debug.analyzing')));

    // 使用 ps 命令获取最后一个命令
    const lastCommand = execSync('ps -o command= -p $PPID', { encoding: 'utf-8' }).trim();

    console.log(chalk.cyan('\n' + t('commands.debug.analysis')));
    console.log(chalk.gray('----------------------------------------'));

    // 解析命令
    const commandParts = lastCommand.split(' ').filter(Boolean);
    const baseCommand = commandParts[0];
    const args = commandParts.slice(1);

    // 显示命令信息
    console.log(chalk.white('\n' + t('commands.debug.commandInfo')));
    console.log(chalk.gray('- ' + t('commands.debug.baseCommand') + '：') + chalk.green(baseCommand));
    if (args.length > 0) {
      console.log(chalk.gray('- ' + t('commands.debug.arguments') + '：') + chalk.yellow(args.join(' ')));
    }

    // 获取进程信息
    const processInfo = execSync('ps -o pid,ppid,user,%cpu,%mem,state,start,time -p $PPID', { encoding: 'utf-8' });
    console.log(chalk.white('\n' + t('commands.debug.processInfo')));
    console.log(chalk.gray(processInfo));

    // 获取环境信息
    console.log(chalk.white('\n' + t('commands.debug.envInfo')));
    console.log(chalk.gray('- ' + t('commands.debug.workingDir') + '：') + chalk.yellow(process.cwd()));
    console.log(chalk.gray('- ' + t('commands.debug.nodeVersion') + '：') + chalk.yellow(process.version));
    console.log(chalk.gray('- ' + t('commands.debug.platform') + '：') + chalk.yellow(process.platform));

  } catch (error) {
    console.error(chalk.red(t('common.error')), error);
  }
}
