import { Argv } from 'yargs';
import { handleGitOpen, handleGitPush, handleGitCommit } from './git.js';
import { getLocalIPs } from './ip.js';
import { openInVSCode } from './vscode.js';

interface GitArgs {
  action: 'push' | 'open';
  message?: string;
}

interface CommitArgs {
  message: string;
}

export function registerCommands(yargs: Argv): Argv {
  return yargs
    .command('$0 <message>', 'Commit changes with a message', 
      (yargs) => {
        return yargs.positional('message', {
          type: 'string',
          describe: 'Commit message'
        });
      },
      async (argv) => {
        try {
          const args = argv as CommitArgs;
          await handleGitCommit(args.message);
        } catch (error: any) {
          console.error("Error:", error.message);
        }
      }
    )
    .command('git <action> [message]', 'Git operations', 
      (yargs) => {
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
      async (argv) => {
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
    )
    .command('ip', 'Show local IP addresses',
      () => {},
      async () => {
        try {
          await getLocalIPs();
        } catch (error: any) {
          console.error("Error:", error.message);
        }
      }
    )
    .command('o', 'Open current directory in VS Code',
      () => {},
      async () => {
        try {
          await openInVSCode();
        } catch (error: any) {
          console.error("Error opening VS Code:", error.message);
        }
      }
    )
    .example('$0 "fix: update readme"', 'Commit changes with a message')
    .example('$0 git push', 'Push changes using last commit message')
    .example('$0 git push "feat: new feature"', 'Push changes with a new message')
    .example('$0 git open', 'Open repository in browser')
    .example('$0 ip', 'Show local IP addresses')
    .example('$0 o', 'Open in VS Code')
    .example('a "fix: update"', 'Short alias for one')
    .example('o "fix: update"', 'Another alias for one');
}
