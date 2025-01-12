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
import chalk from 'chalk';

interface CommitArgs {
  message?: string;
  verbose?: boolean;
}

interface GitArgs {
  action: string;
  message?: string;
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
    command: 'push [message]',
    aliases: ['p'],
    describe: 'Push changes with optional commit message (uses AI if message is empty)',
    builder: (yargs: Argv) => {
      return yargs.positional('message', {
        type: 'string',
        describe: 'Commit message (optional, will use AI if not provided)'
      });
    },
    handler: async (argv: any) => {
      try {
        await handleGitPush(argv.message);
      } catch (error: any) {
        console.error("Error:", error.message);
      }
    }
  },
  {
    command: 'git <action> [message]',
    describe: 'Git operations',
    aliases: ['g'],
    builder: (yargs: Argv) => {
      return yargs
        .positional('action', {
          choices: ['open'] as const,
          describe: 'Git action to perform'
        })
        .positional('message', {
          type: 'string',
          describe: 'Optional commit message for push'
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
    aliases: ['t'],
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
    aliases: ['c', 'o'],
    handler: async () => {
      try {
        await handleVSCode();
      } catch (error: any) {
        console.error("Error opening editor:", error.message);
      }
    }
  },
  {
    command: 'commit [message]',
    describe: 'Commit changes with a message (uses AI if message is empty)',
    builder: (yargs: Argv) => {
      return yargs
        .positional('message', {
          type: 'string',
          describe: 'Commit message (optional, will use AI if not provided)'
        })
        .option('verbose', {
          alias: 'v',
          type: 'boolean',
          description: 'Show diff information when generating commit message'
        });
    },
    handler: async (argv: any) => {
      try {
        const args = argv as CommitArgs & { verbose?: boolean };
        await handleGitCommit(args.message, args.verbose);
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
    command: 'clean',
    describe: 'Clean git changes, restore modified files and remove untracked files',
    handler: async () => {
      try {
        await handleClean();
      } catch (error: any) {
        console.error("Error:", error.message);
      }
    }
  }
];

export function registerCommands() {
  let yargsInstance = yargs(hideBin(process.argv))
    .scriptName('fir')
    .alias('$0', 'f')
    .usage('$0 <command> [options]')
    .epilogue('For more information, visit https://github.com/hookex/one-cli')
    .wrap(null);

  // 添加示例
  yargsInstance = yargsInstance
    .example('f chrome', 'Open Chrome browser')
    .example('f chrome https://github.com', 'Open Chrome with specific URL')
    .example('f nrm', 'Install and run nrm if not found')
    .example('f nrm ls', 'Run nrm with arguments')
    .example('f commit', 'Commit changes with AI-generated message')
    .example('f commit "feat: update readme"', 'Commit with specific message')
    .example('f push', 'Commit with AI-generated message and push')
    .example('f p', 'Shorthand for push with AI commit')
    .example('f push "feat: add feature"', 'Push with specific commit message')
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
    .example('f commit --verbose', 'Show diff when generating commit message')
    .example('f ping', 'Ping top 10 most visited domains')
    .example('f ping github.com', 'Ping specific domain')
    .example('f ai', 'Configure AI settings')
    .example('f translate "hello world"', 'Translate text between English and Chinese')
    .example('f clean', 'Clean git changes, restore modified files and remove untracked files');

  // 添加命令
  yargsInstance = yargsInstance
    .command({
      command: 'chrome [url]',
      describe: 'Open Chrome browser',
      handler: (argv: any) => handleChrome('chrome', argv.url)
    })
    .command({
      command: 'push [message]',
      describe: 'Push changes with optional commit message (uses AI if message is empty)',
      aliases: ['p'],
      handler: (argv: ArgumentsCamelCase<any>) => handleGitPush(argv.message)
    })
    .command({
      command: 'git <action> [message]',
      describe: 'Git operations (open: open repo in browser)',
      aliases: ['g'],
      handler: async (argv: ArgumentsCamelCase<GitArgs>) => {
        try {
          if (argv.action === 'open') {
            await handleGitOpen();
          }
        } catch (error: any) {
          console.error("Error:", error.message);
        }
      }
    })
    .command({
      command: 'ip',
      describe: 'Show local IP addresses',
      aliases: ['i'],
      handler: handleIp
    })
    .command({
      command: 'time',
      describe: 'Show current time in Beijing and UTC',
      aliases: ['t'],
      handler: (argv: ArgumentsCamelCase<TimeArgs>) => handleTime(argv.watch)
    })
    .command({
      command: 'code',
      describe: 'Open current directory in editor',
      aliases: ['c', 'o'],
      handler: handleVSCode
    })
    .command({
      command: 'ping [domain]',
      describe: 'Ping domain(s) to test network latency',
      handler: (argv: ArgumentsCamelCase<PingArgs>) => handlePing(argv.domain)
    })
    .command({
      command: 'ai [question]',
      describe: 'Configure AI settings or ask a question',
      handler: (argv: any) => handleAI(argv.question)
    })
    .command({
      command: 'commit [message]',
      describe: 'Commit changes with a message (uses AI if message is empty)',
      builder: (yargs: Argv) => {
        return yargs
          .positional('message', {
            type: 'string',
            describe: 'Commit message (optional, will use AI if not provided)'
          })
          .option('verbose', {
            alias: 'v',
            type: 'boolean',
            description: 'Show diff information when generating commit message'
          });
      },
      handler: async (argv: ArgumentsCamelCase<CommitArgs>) => {
        try {
          await handleGitCommit(argv.message, argv.verbose);
        } catch (error: any) {
          console.error("Error:", error.message);
        }
      }
    })
    .command({
      command: 'translate <text>',
      aliases: ['t'],
      describe: 'Translate text between English and Chinese',
      handler: (argv: any) => handleTranslate(argv.text)
    })
    .command({
      command: 'clean',
      describe: 'Clean git changes, restore modified files and remove untracked files',
      handler: async () => {
        try {
          await handleClean();
        } catch (error: any) {
          console.error("Error:", error.message);
        }
      }
    })
    .command({
      command: '*',
      describe: 'Run or install and run a global npm package',
      handler: (argv: ArgumentsCamelCase<any>) => {
        const [command, ...args] = argv._;
        if (!command) {
          console.log(chalk.yellow('\nPlease provide a command or use --help to see available commands.\n'));
          console.log('Example commands:');
          console.log(chalk.cyan('  f commit') + '           - Commit changes with AI-generated message');
          console.log(chalk.cyan('  f push') + '            - Push changes to remote repository');
          console.log(chalk.cyan('  f g open') + '          - Open repository in browser');
          console.log(chalk.cyan('  f ping') + '            - Ping top 10 most visited domains');
          console.log(chalk.cyan('  f time') + '            - Show current time');
          console.log(chalk.cyan('  f nrm ls') + '          - Run nrm with arguments\n');
          return;
        }
        handleNpmCommand(String(command), args.map(arg => String(arg)));
      }
    })
    .demandCommand(1, 'Not enough non-option arguments: got 0, need at least 1')
    .help()
    .alias('h', 'help')
    .version()
    .alias('v', 'version');

  return yargsInstance;
}
