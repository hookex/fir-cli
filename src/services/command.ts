import chalk from 'chalk';
import readline from 'readline';

interface Command {
  name: string;
  aliases?: string[];
  description: string;
}

const commandMap = new Map<string, Command[]>();
const internalCommands = new Set([
  'git', 'ip', 'time', 'code', 'commit', 'push', 'ping',
  'chrome', 'translate', 'debug', 'ai', 'clean', 'config'
]);

export function isInternalCommand(command: string): boolean {
  return internalCommands.has(command);
}

export function registerAlias(alias: string, command: Command) {
  const commands = commandMap.get(alias) || [];
  commands.push(command);
  commandMap.set(alias, commands);
}

export function clearAliases() {
  commandMap.clear();
}

export async function resolveCommand(alias: string): Promise<Command | null> {
  // 如果是内部命令，直接返回
  if (isInternalCommand(alias)) {
    return {
      name: alias,
      description: `Internal command: ${alias}`
    };
  }

  const commands = commandMap.get(alias);
  
  if (!commands || commands.length === 0) {
    return null;
  }
  
  if (commands.length === 1) {
    return commands[0];
  }
  
  // 如果有多个命令使用相同的别名，提示用户选择
  console.log(chalk.yellow(`\nMultiple commands found for alias '${alias}':`));
  commands.forEach((cmd, index) => {
    console.log(chalk.white(`${index + 1}. ${cmd.name} - ${cmd.description}`));
  });
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(chalk.cyan('\nSelect a command (1-5), or press Enter to cancel: '), (answer) => {
      rl.close();
      
      const index = parseInt(answer) - 1;
      if (isNaN(index) || index < 0 || index >= commands.length) {
        console.log(chalk.yellow('Selection cancelled.'));
        resolve(null);
      } else {
        resolve(commands[index]);
      }
    });
  });
}
