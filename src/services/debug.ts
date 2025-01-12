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
    // 使用 fc -l 获取最后几条命令
    const historyOutput = execSync('fc -l -5', { 
      encoding: 'utf-8',
      shell: '/bin/zsh',
      env: { ...process.env, LANG: 'en_US.UTF-8' }
    }).trim();

    // 解析命令历史
    const commands = historyOutput.split('\n')
      .map(line => {
        // fc -l 输出格式为：数字  日期时间  命令
        const match = line.match(/^\s*\d+\s+\d+:\d+\s+(.+)$/);
        return match ? match[1].trim() : '';
      })
      .filter(cmd => cmd && !cmd.startsWith('f '))
      .reverse(); // 最新的命令在前面

    if (commands.length === 0) {
      return null;
    }

    // 获取最后一条非 f 命令
    return executeCommand(commands[0]);
  } catch (error) {
    // 如果 fc -l 失败，尝试使用 tail 获取历史文件
    try {
      const historyFile = process.env.HISTFILE || `${process.env.HOME}/.zsh_history`;
      const historyOutput = execSync(`tail -n 5 ${historyFile}`, {
        encoding: 'utf-8',
        env: { ...process.env, LANG: 'en_US.UTF-8' }
      }).trim();

      const commands = historyOutput.split('\n')
        .map(line => line.replace(/^.*?;/, '').trim()) // 移除时间戳部分
        .filter(cmd => cmd && !cmd.startsWith('f '))
        .reverse();

      if (commands.length === 0) {
        return null;
      }

      return executeCommand(commands[0]);
    } catch (err) {
      console.error(chalk.red('Error getting command history:'), error);
      return null;
    }
  }
}

function executeCommand(command: string): CommandHistory {
  try {
    // 不要重新执行某些危险的命令
    if (command.includes('rm ') || command.includes('sudo ') || command.includes('git push')) {
      return {
        command,
        output: '为了安全起见，不重新执行包含 rm、sudo 或 git push 的命令',
        exitCode: 0
      };
    }

    const output = execSync(command, { 
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: '/bin/zsh',
      env: { ...process.env, LANG: 'en_US.UTF-8' }
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
