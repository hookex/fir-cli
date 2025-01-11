#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import open from 'open';
import figlet from 'figlet';
import chalk from 'chalk';
import { handleGitOpen, handleGitPush, handleGitCommit } from './commands/git.js';
import { getLocalIPs } from './commands/ip.js';

interface GitArgs {
  action: 'push' | 'open';
  message?: string;
}

interface CommitArgs {
  message: string;
}

// 创建 ASCII 艺术字
const title = figlet.textSync('Only One CLI', {
  font: 'Standard',
  horizontalLayout: 'default',
  verticalLayout: 'default',
  width: 80,
  whitespaceBreak: true
});

// 输出带颜色的标题
console.log(chalk.cyan(title));
console.log(chalk.gray('Your command line companion\n'));

// 创建基础命令
const baseCommand = yargs(hideBin(process.argv))
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
  .example('$0 ip', 'Show local IP addresses')
  .example('$0 o', 'Open in VS Code')
  .example('a "fix: update"', 'Short alias for one')
  .example('o "fix: update"', 'Another alias for one')
  .wrap(null)
  .strict()
  .help()
  .alias('h', 'help')
  .alias('v', 'version');

// 创建命令的别名
const argv = baseCommand.parse();

// 创建软链接
import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

try {
  const binPath = process.argv[1];
  const aPath = binPath.replace(/one$/, 'a');
  const oPath = binPath.replace(/one$/, 'o');

  if (!existsSync(aPath)) {
    execSync(`ln -s "${binPath}" "${aPath}"`);
  }
  if (!existsSync(oPath)) {
    execSync(`ln -s "${binPath}" "${oPath}"`);
  }
} catch (error) {
  // 忽略创建软链接时的错误
}
