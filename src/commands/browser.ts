import open from 'open';
import chalk from 'chalk';

export async function openBrowser(browserName: string = 'chrome', url?: string): Promise<void> {
  try {
    const macChromePath = '/Applications/Google Chrome.app';
    
    if (browserName.toLowerCase() === 'chrome') {
      if (url) {
        // 如果有 URL，使用 Chrome 打开
        await open(url, { app: { name: 'google chrome' } });
        console.log(chalk.green(`✓ Opened Chrome with ${url}`));
      } else {
        // 直接打开 Chrome
        await open(macChromePath);
        console.log(chalk.green('✓ Opened Chrome'));
      }
    }
  } catch (error: any) {
    console.error(chalk.red(`Failed to open Chrome:`), error.message);
    
    // 尝试使用备用方法
    try {
      const command = url ? `open -a "Google Chrome" ${url}` : 'open -a "Google Chrome"';
      await new Promise((resolve, reject) => {
        const { exec } = require('child_process');
        exec(command, (error: Error | null) => {
          if (error) {
            reject(error);
          } else {
            resolve(true);
          }
        });
      });
      console.log(chalk.green('✓ Opened Chrome using fallback method'));
    } catch (fallbackError: any) {
      console.error(chalk.red('Failed to open Chrome using fallback method:'), fallbackError.message);
    }
  }
}
