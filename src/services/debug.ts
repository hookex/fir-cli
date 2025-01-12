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
    // macOS 下使用 fc 命令获取最后一条命令
    const lastCommand = execSync('fc -ln -1', { 
      encoding: 'utf-8',
      shell: '/bin/zsh'
    }).trim();
    
    if (!lastCommand || lastCommand.startsWith('f ')) {
      // 如果是我们自己的命令，则获取倒数第二条
      const secondLastCommand = execSync('fc -ln -2 | head -n 1', {
        encoding: 'utf-8',
        shell: '/bin/zsh'
      }).trim();
      
      if (!secondLastCommand) {
        return null;
      }
      
      return executeCommand(secondLastCommand);
    }
    
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
      stdio: ['pipe', 'pipe', 'pipe']
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
