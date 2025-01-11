import { Argv, CommandModule } from 'yargs';
import { handleGitOpen, handleGitPush, handleGitCommit } from './git.js';
import { getLocalIPs } from './ip.js';
import { openInVSCode } from './vscode.js';
import { showTime } from './time.js';

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
    command: '$0 <message>',
    describe: 'Commit changes with a message',
    builder: (yargs: Argv) => {
      return yargs.positional('message', {
        type: 'string',
        describe: 'Commit message'
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
    handler: () => {
      try {
        showTime();
      } catch (error: any) {
        console.error("Error:", error.message);
      }
    }
  },
  {
    command: 'code',
    describe: 'Open current directory in VS Code',
    aliases: ['c', 'o'],
    handler: async () => {
      try {
        await openInVSCode();
      } catch (error: any) {
        console.error("Error opening VS Code:", error.message);
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
    .example('$0 "fix: update readme"', 'Commit changes with a message')
    .example('$0 g push', 'Push changes using last commit message (alias for git)')
    .example('$0 git push "feat: new feature"', 'Push changes with a new message')
    .example('$0 g open', 'Open repository in browser (alias for git open)')
    .example('$0 i', 'Show local IP addresses (alias for ip)')
    .example('$0 t', 'Show current time (alias for time)')
    .example('$0 c', 'Open in VS Code (alias for code)')
    .example('$0 o', 'Open in VS Code (another alias for code)')
    .example('a "fix: update"', 'Short alias for one')
    .example('o "fix: update"', 'Another alias for one');
}
