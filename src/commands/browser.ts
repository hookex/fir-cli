import open from 'open';
import chalk from 'chalk';

export async function openBrowser(browserName: string = 'chrome', url?: string): Promise<void> {
  try {
    const args = url ? [url] : [];
    const app = {
      name: browserName,
      arguments: args
    };

    await open(url || '', { app });
    console.log(chalk.green(`✓ Opened ${browserName}${url ? ` with ${url}` : ''}`));
  } catch (error: any) {
    console.error(chalk.red(`Failed to open ${browserName}:`), error.message);
  }
}
