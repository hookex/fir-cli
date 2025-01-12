import chalk from 'chalk';
import ora from 'ora';
import { translate } from '../services/translate.js';

export async function handleTranslate(text: string) {
  if (!text) {
    console.log(chalk.yellow('Usage: f t <text> or f translate <text>'));
    console.log('Examples:');
    console.log(chalk.gray('  f t Hello World'));
    console.log(chalk.gray('  f t 你好世界'));
    return;
  }

  const spinner = ora({
    text: 'Translating...',
    color: 'cyan'
  }).start();

  try {
    const result = await translate(text);
    spinner.succeed('Translation completed');
    
    console.log('\nResult:');
    if (result.english === text) {
      // 英译中
      console.log(chalk.gray('EN: ') + result.english);
      console.log(chalk.green('CN: ') + result.chinese);
    } else {
      // 中译英
      console.log(chalk.gray('CN: ') + result.chinese);
      console.log(chalk.green('EN: ') + result.english);
    }
  } catch (error: any) {
    spinner.fail('Translation failed');
    console.error(chalk.red('Error:'), error.message);
  }
}
