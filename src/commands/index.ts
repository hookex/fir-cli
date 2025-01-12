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
  for (const [cmd, config] of Object.entries(commandMap)) {
    if (config.aliases?.includes(input)) {
      matches.push(cmd);
    }
  }
  return matches;
}

// 定义命令配置
const commands: Array<any> = [
  {
    command: 'chrome [url]',
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
    describe: 'Ping domain(s)',
    handler: (argv: any) => handlePing(argv.domain)
  },
  {
    command: 'install [args..]',
    describe: 'Run or install and run a global npm package',
    builder: (yargs: Argv) => {
      return yargs
        .positional('command', {
          type: 'string',
          describe: 'Command to run'
        })
        .positional('args', {
          type: 'string',
          describe: 'Command arguments',
          array: true
        });
    },
    handler: async (argv: any) => {
      const command = argv.command;
      
      try {
        // 检查是否是内部命令或别名
        const resolvedCommand = await resolveCommand(command);
        if (resolvedCommand) {
          // 如果是别名，使用原始命令
          const args = argv.args || [];
          argv._ = [resolvedCommand.name, ...args];
          return;
        }

        // 如果不是内部命令或别名，尝试作为 npm 包运行
        await handleNpmCommand(command, argv.args || []);
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
    describe: 'Configure settings and view history',
    handler: async () => {
      try {
        await handleConfig();
      } catch (error: any) {
        console.error("Error:", error.message);
      }
    }
  },
  {
    command: 'ai [question]',
    describe: 'Chat with AI assistant',
    handler: (argv: any) => handleAI(argv.question)
  },
  {
    command: 'clean',
    describe: 'Clean git changes, restore modified files and remove untracked files',
    handler: async () => {
      try {
        await handleClean();
      } catch (error: any) {
        console.error("Error:", error.message);
      }
    }
  },
  {
    command: 'debug',
    aliases: ['d', 'de'],
    describe: 'Analyze last command execution',
    handler: handleDebug
  }
];

export function registerCommands() {
  const yargsInstance = yargs(hideBin(process.argv));

  // 注册所有命令到 commandMap
  commands.forEach(cmd => {
    const { command, describe, handler, builder, aliases = [] } = cmd;
    const mainCommand = command.split(' ')[0];
    commandMap[mainCommand] = { command, describe, handler, builder, aliases };
  });

  // 处理命令执行
  yargsInstance.middleware(async (argv) => {
    const command = argv._[0] as string;
    if (!command) return;

    const matchingCommands = findMatchingCommands(command);
    
    if (matchingCommands.length > 1) {
      // 有冲突的命令，让用户选择
      const selectedCommand = await handleCommandConflict(command, matchingCommands);
      // 更新 argv 中的命令
      argv._ = [selectedCommand, ...argv._.slice(1)];
    }
  });

  // 注册所有命令
  commands.forEach(cmd => {
    const { command, describe, handler, builder, aliases = [] } = cmd;
    yargsInstance.command(command, describe, builder || {}, handler);
    if (aliases.length > 0) {
      yargsInstance.alias(command.split(' ')[0], aliases);
    }
  });

  yargsInstance
    .help()
    .alias('help', 'h')
    .demandCommand(1, '')
    .strict()
    .parse();

  return yargsInstance;
}
