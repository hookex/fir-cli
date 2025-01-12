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
    // 使用 history 命令获取最近的命令
    const history = execSync('history | tail -n 2', { 
      encoding: 'utf-8',
      shell: '/bin/zsh'
    }).trim().split('\n');

    // history 输出格式为: "数字 命令"
    const commands = history.map(line => {
      const match = line.match(/^\s*\d+\s+(.+)$/);
      return match ? match[1].trim() : '';
    }).filter(cmd => cmd && !cmd.startsWith('f '));

    if (commands.length === 0) {
      return null;
    }

    // 获取最后一条非 f 命令
    const lastCommand = commands[commands.length - 1];
    return executeCommand(lastCommand);
  } catch (error) {
    console.error(chalk.red('Error getting command history:'), error);
    return null;
  }
}

function executeCommand(command: string): CommandHistory {
  try {
    const output = execSync(command, { 
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: '/bin/zsh'
    });
    return {
      command,
      output: output.trim(),
      exitCode: 0
    };
  } catch (error: any) {
    return {
      command,
      output: error.message,
      exitCode: error.status || 1
    };
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
