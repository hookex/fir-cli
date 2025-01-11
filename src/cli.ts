#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import open from 'open';
import { handleGitOpen, handleGitPush, handleGitCommit } from './commands/git.js';

interface GitArgs {
  action: 'push' | 'open';
  message?: string;
}

interface CommitArgs {
  message: string;
}

yargs(hideBin(process.argv))
  .scriptName('one')
  .usage('$0 [cmd] [args]')
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
  .command('o', 'Open current directory in VS Code',
    () => {},
    async () => {
      try {
        await open('code .');
      } catch (error: any) {
        console.error("Error opening VS Code:", error.message);
      }
    }
  )
  .example('$0 "fix: update readme"', 'Commit changes with a message')
  .example('$0 git push', 'Push changes using last commit message')
  .example('$0 git push "feat: new feature"', 'Push changes with a new message')
  .example('$0 git open', 'Open repository in browser')
  .example('$0 o', 'Open in VS Code')
  .strict()
  .help()
  .alias('h', 'help')
  .alias('v', 'version')
  .parse();
