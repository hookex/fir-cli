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
    aliases: ['p'],
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
    aliases: ['g'],
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
    aliases: ['i'],
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
    aliases: ['tm'],
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
    aliases: ['e', 'o'],
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
    command: '$0 <command> [args..]',
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
      // 检查是否是内部命令
      const internalCommands = ['git', 'ip', 'time', 'code', 'commit', 'push', 'ping'];
      if (internalCommands.includes(argv.command)) {
        console.error(chalk.red(`Error: '${argv.command}' is an internal command. Use it directly without $0.`));
        return;
      }

      try {
        await handleNpmCommand(argv.command, argv.args || []);
      } catch (error: any) {
        console.error("Error:", error.message);
      }
    }
  },
  {
    command: 'translate <text>',
    aliases: ['t'],
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
    aliases: ['d'],
    describe: 'Analyze last command execution',
    handler: handleDebug
  }
];

export function registerCommands() {
  // 清除之前的别名注册
  clearAliases();

  // 注册所有命令的别名
  commands.forEach(cmd => {
    if (cmd.aliases) {
      cmd.aliases.forEach(alias => {
        registerAlias(alias, {
          name: cmd.command.split(' ')[0],
          description: cmd.describe,
          aliases: cmd.aliases
        });
      });
    }
  });

  const parser = yargs(hideBin(process.argv))
    .scriptName('f')
    .usage('$0 <command> [options]')
    .middleware(async (argv) => {
      // 如果使用了别名，检查是否有冲突
      const alias = argv._[0] as string;
      if (alias) {
        const resolvedCommand = await resolveCommand(alias);
        if (resolvedCommand) {
          // 更新命令名称
          argv._ = [resolvedCommand.name, ...argv._.slice(1)];
        }
      }
      return argv;
    })
    .demandCommand(1, 'You need at least one command before moving on')
    .recommendCommands()
    .strict()
    .help()
    .alias('h', 'help')
    .version()
    .alias('v', 'version')
    .example('f commit', 'Commit changes with AI message')
    .example('f commit -v', 'Commit with verbose output')
    .example('f push', 'Push changes to remote')
    .example('f push -v', 'Push with verbose output')
    .example('f g open', 'Open repository in browser (alias for git open)')
    .example('f i', 'Show local IP addresses (alias for ip)')
    .example('f t', 'Show current time (alias for time)')
    .example('f time', 'Show current time')
    .example('f time -w', 'Show auto-updating time (Ctrl+C to stop)')
    .example('f t --watch', 'Another way to show auto-updating time')
    .example('f c', 'Open in editor (alias for code)')
    .example('f o', 'Open in editor (another alias for code)')
    .example('f code', 'Open current directory in your preferred editor')
    .example('f commit -v', 'Show diff when generating commit message')
    .example('f push -v', 'Show diff when pushing changes')
    .example('f chrome', 'Open Chrome browser')
    .example('f chrome https://github.com', 'Open Chrome with URL')
    .example('f ping github.com', 'Ping domain')
    .example('f translate "Hello"', 'Translate text')
    .example('f debug', 'Debug last command execution')
    .example('f config', 'Configure settings')
    .example('f help', 'Show help information')
    .example('f nrm ls', 'List npm registries')
    .example('f ncu', 'Check package updates');

  // 注册所有命令
  commands.forEach(cmd => {
    parser.command(cmd);
  });

  return parser;
}
