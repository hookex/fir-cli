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
    command: 'git <action> [message]',
    describe: 'Git operations',
    aliases: ['g'],
    builder: (yargs: Argv) => {
      return yargs
        .positional('action', {
          choices: ['push', 'open'] as const,
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
        } else if (args.action === 'push') {
          await handleGitPush(args.message);
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
      return yargs.positional('message', {
        type: 'string',
        describe: 'Commit message (optional, will use AI if not provided)'
      });
    },
    handler: async (argv: any) => {
      try {
        const args = argv as CommitArgs;
        await handleGitCommit(args.message);
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
      const internalCommands = ['git', 'ip', 'time', 'code', 'commit'];
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
    .example('$0 chrome', 'Open Chrome browser')
    .example('$0 chrome https://github.com', 'Open Chrome with specific URL')
    .example('$0 nrm', 'Install and run nrm if not found')
    .example('$0 nrm ls', 'Run nrm with arguments')
    .example('$0 commit', 'Commit changes with AI-generated message')
    .example('$0 commit "feat: update readme"', 'Commit with specific message')
    .example('$0 g push', 'Push changes using last commit message (alias for git)')
    .example('$0 git push "feat: new feature"', 'Push changes with a new message')
    .example('$0 g open', 'Open repository in browser (alias for git open)')
    .example('$0 i', 'Show local IP addresses (alias for ip)')
    .example('$0 t', 'Show current time (alias for time)')
    .example('$0 time', 'Show current time')
    .example('$0 time -w', 'Show auto-updating time (Ctrl+C to stop)')
    .example('$0 t --watch', 'Another way to show auto-updating time')
    .example('$0 c', 'Open in editor (alias for code)')
    .example('$0 o', 'Open in editor (another alias for code)')
    .example('$0 code', 'Open current directory in your preferred editor');
}
