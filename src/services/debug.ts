import { execSync } from 'child_process';
import { chat } from './chat.js';
import chalk from 'chalk';
import ora from 'ora';

interface CommandHistory {
  command: string;
  output: string;
  exitCode: number;
}

function getLastCommand(): CommandHistory | null {
  try {
    // 获取最后一条命令的历史记录
    const historyCommand = process.platform === 'darwin' ? 
      'tail -2 ~/.zsh_history' : 
      'tail -2 ~/.bash_history';
    
    const lastCommand = execSync(historyCommand, { encoding: 'utf-8' }).trim();
    
    if (!lastCommand) {
      return null;
    }

    // 尝试执行命令获取输出
    try {
      const output = execSync(lastCommand, { encoding: 'utf-8' });
      return {
        command: lastCommand,
        output,
        exitCode: 0
      };
    } catch (error: any) {
      return {
        command: lastCommand,
        output: error.message,
        exitCode: error.status || 1
      };
    }
  } catch (error) {
    return null;
  }
}

export async function debugLastCommand(): Promise<void> {
  const spinner = ora('Analyzing last command...').start();
  
  try {
    const history = getLastCommand();
    
    if (!history) {
      spinner.fail('No command history found');
      return;
    }

    // 构建提示信息
    const prompt = `分析以下命令的执行情况：

命令：${history.command}
输出：${history.output}
退出码：${history.exitCode}

请提供：
1. 命令的作用解释
2. 输出结果分析
${history.exitCode !== 0 ? '3. 错误原因和解决方案' : ''}

回答要简洁明了，使用 markdown 格式。`;

    // 获取 AI 分析
    const analysis = await chat(prompt);
    spinner.stop();

    // 显示分析结果
    console.log(chalk.cyan('\n命令分析：'));
    console.log(chalk.gray('----------------------------------------'));
    console.log(chalk.yellow('上一条命令：'), history.command);
    console.log(chalk.yellow('执行结果：'));
    console.log(history.output);
    console.log(chalk.gray('----------------------------------------'));
    console.log(analysis);

  } catch (error: any) {
    spinner.fail('Failed to analyze command');
    console.error(chalk.red('Error:'), error.message);
  }
}
