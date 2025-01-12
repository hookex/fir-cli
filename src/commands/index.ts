import yargs, { Argv, ArgumentsCamelCase } from 'yargs';
import { hideBin } from 'yargs/helpers';
import { openBrowser as handleChrome } from './browser.js';
import { handleGitOpen, handleGitCommit, handleGitPush, handleClean } from './git.js';
import { getLocalIPs as handleIp } from './ip.js';
import { showTime as handleTime } from './time.js';
import { openInEditor as handleVSCode } from './vscode.js';
import { installAndRunGlobalPackage as handleNpmCommand } from './npm.js';
import { handlePing } from './ping.js';
import { handleAI } from './ai.js';
import { handleTranslate } from './translate.js';
import { handleConfig } from './config.js';
import { handleDebug } from './debug.js';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { execSync } from 'child_process';
import { registerAlias, resolveCommand, clearAliases } from '../services/command.js';

interface CommitArgs {
  verbose?: boolean;
}

interface GitArgs {
  action: string;
}

interface TimeArgs {
  watch?: boolean;
}

interface PingArgs {
  domain?: string;
}

// 存储命令和别名的映射关系
interface CommandMap {
  [key: string]: {
    command: string;
    describe: string;
    handler: (...args: any[]) => any;
    builder?: (yargs: Argv) => Argv;
    aliases?: string[];
  };
}

const commandMap: CommandMap = {};

// 处理命令冲突
async function handleCommandConflict(alias: string, matchingCommands: string[]): Promise<string> {
  console.log(chalk.yellow(`\n命令 '${alias}' 有多个匹配项：`));
  
  const { selectedCommand } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedCommand',
      message: '请选择要执行的命令：',
      choices: matchingCommands.map(cmd => ({
        name: `${cmd} - ${commandMap[cmd].describe}`,
        value: cmd
      }))
    }
  ]);

  return selectedCommand;
}

// 查找匹配的命令
function findMatchingCommands(input: string): string[] {
  const matches: string[] = [];
  commands.forEach(cmd => {
    const { command, aliases = [] } = cmd;
    const mainCommand = command.split(' ')[0];
    if (aliases.includes(input)) {
      matches.push(mainCommand);
    }
  });
  return matches;
}

// 定义命令配置
const commands: Array<any> = [
  {
    command: 'chrome [url]',
    aliases: ['c', 'ch'],
    describe: 'Open Chrome browser',
    builder: (yargs: Argv) => {
      return yargs.positional('url', {
        type: 'string',
        describe: 'URL to open (optional)'
      });
    },
    handler: async (argv: any) => {
      try {
        await handleChrome('chrome', argv.url);
      } catch (error: any) {
        console.error("Error:", error.message);
      }
    }
  },
  {
    command: 'push',
    aliases: ['p', 'pu'],
    describe: 'Push changes with optional commit message (uses AI if message is empty)',
    builder: (yargs: Argv) => {
      return yargs.option('verbose', {
        alias: 'v',
        type: 'boolean',
        description: 'Show diff information when generating commit message'
      });
    },
    handler: async (argv: any) => {
      try {
        await handleGitPush(argv.verbose);
      } catch (error: any) {
        console.error("Error:", error.message);
      }
    }
  },
  {
    command: 'git <action>',
    describe: 'Git operations',
    aliases: ['g', 'gi'],
    builder: (yargs: Argv) => {
      return yargs
        .positional('action', {
          choices: ['open'] as const,
          describe: 'Git action to perform'
        });
    },
    handler: async (argv: any) => {
      try {
        const args = argv as GitArgs;
        if (args.action === 'open') {
          await handleGitOpen();
        }
      } catch (error: any) {
        console.error("Error:", error.message);
      }
    }
  },
  {
    command: 'ip',
    describe: 'Show local IP addresses',
    aliases: ['i', 'ip'],
    handler: async () => {
      try {
        await handleIp();
      } catch (error: any) {
        console.error("Error:", error.message);
      }
    }
  },
  {
    command: 'time',
    describe: 'Show current time in Beijing and UTC',
    aliases: ['t', 'ti'],
    builder: (yargs: Argv) => {
      return yargs.option('watch', {
        alias: 'w',
        type: 'boolean',
        describe: 'Auto update time every second'
      });
    },
    handler: (argv: any) => {
      try {
        handleTime(argv.watch);
      } catch (error: any) {
        console.error("Error:", error.message);
      }
    }
  },
  {
    command: 'code',
    describe: 'Open current directory in editor',
    aliases: ['c', 'co'],
    handler: async () => {
      try {
        await handleVSCode();
      } catch (error: any) {
        console.error("Error opening editor:", error.message);
      }
    }
  },
  {
    command: 'commit',
    aliases: ['c', 'co', 'com'],
    describe: 'Commit changes with a message (uses AI if message is empty)',
    builder: (yargs: Argv) => {
      return yargs
        .option('verbose', {
          alias: 'v',
          type: 'boolean',
          description: 'Show diff information when generating commit message'
        });
    },
    handler: async (argv: any) => {
      try {
        const args = argv as CommitArgs;
        await handleGitCommit(args.verbose);
      } catch (error: any) {
        console.error("Error:", error.message);
      }
    }
  },
  {
    command: 'ping [domain]',
    aliases: ['p', 'pi'],
    describe: 'Ping domain(s)',
    handler: (argv: any) => handlePing(argv.domain)
  },
  {
    command: 'install [args..]',
    aliases: ['i', 'in'],
    describe: 'Run or install and run a global npm package',
    builder: (yargs: Argv) => {
      return yargs
        .positional('args', {
          type: 'string',
          describe: 'Command and arguments to run'
        });
    },
    handler: async (argv: any) => {
      try {
        const command = argv.args[0];
        const args = argv.args.slice(1);
        await handleNpmCommand(command, args);
      } catch (error: any) {
        console.error("Error:", error.message);
      }
    }
  },
  {
    command: 'translate <text>',
    aliases: ['t', 'tr'],
    describe: 'Translate text between English and Chinese',
    handler: (argv: any) => handleTranslate(argv.text)
  },
  {
    command: 'config',
    aliases: ['c', 'co'],
    describe: 'Configure settings and view history',
    handler: handleConfig
  },
  {
    command: 'ai [question]',
    aliases: ['a', 'ai'],
    describe: 'Chat with AI assistant',
    handler: (argv: any) => handleAI(argv.question)
  },
  {
    command: 'clean',
    aliases: ['c', 'cl'],
    describe: 'Clean git changes, restore modified files and remove untracked files',
    handler: handleClean
  },
  {
    command: 'debug',
    aliases: ['d', 'de'],
    describe: 'Analyze last command execution',
    handler: handleDebug
  }
];

export async function registerCommands() {
  const yargsInstance = yargs(hideBin(process.argv));

  // 初始化 commandMap
  commands.forEach(cmd => {
    const { command, describe, handler, builder, aliases = [] } = cmd;
    const mainCommand = command.split(' ')[0];
    commandMap[mainCommand] = { command, describe, handler, builder, aliases };
  });

  const args = process.argv.slice(2);
  if (args.length > 0) {
    const input = args[0];
    const matchingCommands = findMatchingCommands(input);
    
    if (matchingCommands.length > 0) {
      // 如果只有一个匹配的命令，直接执行
      const selectedCommand = matchingCommands.length === 1 
        ? matchingCommands[0] 
        : await handleCommandConflict(input, matchingCommands);

      // 执行选中的命令
      const newArgs = [selectedCommand, ...args.slice(1)];
      const cmdPath = process.argv[1];
      const fullCommand = `node ${cmdPath} ${newArgs.join(' ')}`;
      try {
        execSync(fullCommand, { stdio: 'inherit' });
        process.exit(0);
      } catch (error) {
        process.exit(1);
      }
    }
  }

  // 注册所有命令
  commands.forEach(cmd => {
    const { command, describe, handler, builder, aliases = [] } = cmd;
    yargsInstance.command(command, describe, builder || {}, handler);
  });

  return new Promise((resolve, reject) => {
    yargsInstance
      .help()
      .alias('help', 'h')
      .demandCommand(1, '')
      .strict()
      .parse(process.argv.slice(2), (err: Error | null, argv: any, output: string) => {
        if (err) reject(err);
        else resolve(argv);
      });
  });
}
