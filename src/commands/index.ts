import yargs, { Argv } from 'yargs';
import { hideBin } from 'yargs/helpers';
import { openBrowser as handleChrome } from './browser.js';
import { handleGitPush, handleGitCommit, handleGitOpen, handleClean } from './git.js';
import { handleIp } from './ip.js';
import { showTime as handleTime } from './time.js';
import { openInEditor as handleCode } from './vscode.js';
import { installAndRunGlobalPackage as handleInstall } from './npm.js';
import { handleTranslate } from './translate.js';
import { handleConfig } from './config.js';
import { handleAI } from './ai.js';
import { handleDebug } from './debug.js';
import { handleStatistics } from './statistics.js';
import { t } from '../i18n/index.js';

interface CommitArgs {
  verbose?: boolean;
  build?: boolean;
}

interface Command {
  command: string;
  describe: string;
  handler: (...args: any[]) => any;
  builder?: (yargs: Argv) => Argv;
  aliases?: string[];
}

const commands: Command[] = [
  {
    command: 'chrome [url]',
    describe: t('commands.chrome.desc'),
    aliases: ['c', 'ch'],
    handler: async (argv: any) => {
      await handleChrome(argv.url);
    }
  },
  {
    command: 'push',
    describe: t('commands.push.desc'),
    builder: (yargs: Argv) => {
      return yargs
        .option('verbose', {
          alias: 'v',
          type: 'boolean',
          description: t('commands.git.verbose')
        })
        .option('build', {
          alias: 'b',
          type: 'boolean',
          description: t('commands.push.build_flag')
        });
    },
    handler: async (argv: any) => {
      try {
        await handleGitPush(argv.verbose, argv.build);
      } catch (error: any) {
        console.error(t('common.error'), error.message);
      }
    },
    aliases: ['p', 'pu']
  },
  {
    command: 'git <action>',
    describe: t('commands.git.desc'),
    aliases: ['g', 'gi'],
    handler: async (argv: any) => {
      await handleGitOpen();
    }
  },
  {
    command: 'ip',
    describe: t('commands.ip.desc'),
    aliases: ['i', 'ip'],
    handler: async () => {
      await handleIp();
    }
  },
  {
    command: 'time',
    describe: t('commands.time.desc'),
    aliases: ['t', 'ti'],
    builder: (yargs: Argv) => {
      return yargs.option('watch', {
        alias: 'w',
        type: 'boolean',
        describe: t('commands.time.watch')
      });
    },
    handler: (argv: any) => {
      try {
        handleTime(argv.watch);
      } catch (error: any) {
        console.error(t('common.error'), error.message);
      }
    }
  },
  {
    command: 'code',
    describe: t('commands.code.desc'),
    aliases: ['c', 'co'],
    handler: async () => {
      try {
        await handleCode();
      } catch (error: any) {
        console.error(t('common.error'), error.message);
      }
    }
  },
  {
    command: 'commit',
    describe: t('commands.commit.desc'),
    builder: (yargs: Argv) => {
      return yargs
        .option('verbose', {
          alias: 'v',
          type: 'boolean',
          description: t('commands.git.verbose')
        })
        .option('build', {
          alias: 'b',
          type: 'boolean',
          description: t('commands.push.build_flag')
        });
    },
    handler: async (argv: any) => {
      try {
        const args = argv as CommitArgs;
        await handleGitCommit(args.verbose, args.build);
      } catch (error: any) {
        console.error(t('common.error'), error.message);
      }
    },
    aliases: ['c', 'co', 'com']
  },
  {
    command: 'install [args..]',
    describe: t('commands.install.desc'),
    aliases: ['i', 'in'],
    handler: async (argv: any) => {
      await handleInstall(argv.args);
    }
  },
  {
    command: 'translate <text>',
    describe: t('commands.translate.desc'),
    aliases: ['t', 'tr'],
    handler: async (argv: any) => {
      await handleTranslate(argv.text);
    }
  },
  {
    command: 'config',
    describe: t('commands.config.desc'),
    aliases: ['c', 'co'],
    handler: async () => {
      await handleConfig();
    }
  },
  {
    command: 'ai [question]',
    describe: t('commands.ai.desc'),
    aliases: ['a', 'ai'],
    handler: async (argv: any) => {
      await handleAI(argv.question);
    }
  },
  {
    command: 'clean',
    describe: t('commands.clean.desc'),
    aliases: ['c', 'cl'],
    handler: handleClean
  },
  {
    command: 'debug',
    describe: t('commands.debug.desc'),
    aliases: ['d', 'de'],
    handler: handleDebug
  },
  {
    command: 'statistics',
    aliases: ['s', 'st', 'stats'],
    handler: (argv) => handleStatistics({
      day: argv.d,
      week: argv.w,
      month: argv.m,
      year: argv.y
    }),
    describe: t('commands.statistics.desc'),
    builder: (yargs) => yargs
      .option('d', {
        alias: 'day',
        type: 'boolean',
        describe: t('commands.statistics.dayOption')
      })
      .option('w', {
        alias: 'week',
        type: 'boolean',
        describe: t('commands.statistics.weekOption')
      })
      .option('m', {
        alias: 'month',
        type: 'boolean',
        describe: t('commands.statistics.monthOption')
      })
      .option('y', {
        alias: 'year',
        type: 'boolean',
        describe: t('commands.statistics.yearOption')
      })
  }
];

export async function registerCommands(version: string, scriptName: string) {
  const parser = yargs(hideBin(process.argv))
    .scriptName(scriptName)
    .version(version)
    .alias('v', 'version')
    .alias('h', 'help');

  // 注册所有命令
  for (const cmd of commands) {
    parser.command(cmd);
  }

  // 解析参数
  await parser.parse();
}
