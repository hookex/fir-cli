import { exec } from 'child_process';
import { promisify } from 'util';
import chalk from 'chalk';
import { t } from '../i18n/index.js';

const execAsync = promisify(exec);

export async function openBrowser(url?: string): Promise<void> {
  try {
    const command = process.platform === 'darwin'
      ? `open -a "Google Chrome" ${url || ''}`
      : process.platform === 'win32'
        ? `start chrome ${url || ''}`
        : `google-chrome ${url || ''}`;

    await execAsync(command);
    console.log(chalk.green(t('commands.chrome.success')));
  } catch (error: any) {
    console.error(chalk.red(t('common.error')), error.message);
  }
}
