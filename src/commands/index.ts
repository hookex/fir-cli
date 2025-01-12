import { Argv, CommandModule } from 'yargs';
import { handleGitOpen, handleGitPush, handleGitCommit } from './git.js';
import { getLocalIPs } from './ip.js';
import { openInEditor } from './vscode.js';
import { showTime } from './time.js';
import { installAndRunGlobalPackage } from './npm.js';
import { openBrowser } from './browser.js';
import chalk from 'chalk';

interface GitArgs {
  action: 'push' | 'open';
  message?: string;
}

interface CommitArgs {
  message: string;
}

// 定义命令配置
const commands: Array<CommandModule<{}, any>> = [
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
        await openBrowser('chrome', argv.url);
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
        await getLocalIPs();
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
        showTime(argv.watch);
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
        await openInEditor();
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
      const internalCommands = ['git', 'ip', 'time', 'code', 'commit', 'push'];
      if (internalCommands.includes(argv.command)) {
        console.error(chalk.red(`Error: '${argv.command}' is an internal command. Use it directly without $0.`));
        return;
      }

      try {
        await installAndRunGlobalPackage(argv.command, argv.args || []);
      } catch (error: any) {
        console.error("Error:", error.message);
      }
    }
  }
];

// 注册所有命令
export function registerCommands(yargs: Argv): Argv {
  let yargsInstance = yargs;
  
  // 注册每个命令
  commands.forEach(cmd => {
    yargsInstance = yargsInstance.command(cmd);
  });

  // 添加示例
  return yargsInstance
    .example('fir chrome', 'Open Chrome browser')
    .example('fir chrome https://github.com', 'Open Chrome with specific URL')
    .example('fir nrm', 'Install and run nrm if not found')
    .example('fir nrm ls', 'Run nrm with arguments')
    .example('fir commit', 'Commit changes with AI-generated message')
    .example('fir commit "feat: update readme"', 'Commit with specific message')
    .example('fir push', 'Commit with AI-generated message and push')
    .example('fir p', 'Shorthand for push with AI commit')
    .example('fir push "feat: add feature"', 'Push with specific commit message')
    .example('fir g open', 'Open repository in browser (alias for git open)')
    .example('fir i', 'Show local IP addresses (alias for ip)')
    .example('fir t', 'Show current time (alias for time)')
    .example('fir time', 'Show current time')
    .example('fir time -w', 'Show auto-updating time (Ctrl+C to stop)')
    .example('fir t --watch', 'Another way to show auto-updating time')
    .example('fir c', 'Open in editor (alias for code)')
    .example('fir o', 'Open in editor (another alias for code)')
    .example('fir code', 'Open current directory in your preferred editor')
    .example('fir commit -v', 'Show diff when generating commit message')
    .example('fir commit --verbose', 'Show diff when generating commit message')
    .usage('fir <command> [options]')
    .demandCommand(1, 'Not enough non-option arguments: got 0, need at least 1')
    .help()
    .alias('h', 'help')
    .version()
    .alias('v', 'version');
}
