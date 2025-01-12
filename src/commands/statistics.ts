import { readFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { join } from 'path';
import chalk from 'chalk';
import { t } from '../i18n/index.js';

interface FileStats {
  extension: string;
  lineCount: number;
  fileCount: number;
  added?: number;
  deleted?: number;
}

interface Options {
  day?: boolean;
  week?: boolean;
  month?: boolean;
  year?: boolean;
}

function getGitStats(since: string): { [key: string]: { added: number; deleted: number } } {
  const stats: { [key: string]: { added: number; deleted: number } } = {};
  
  try {
    const cmd = `git log --since="${since}" --numstat --pretty=format:`;
    const output = execSync(cmd, { encoding: 'utf-8' });
    
    output.split('\n').forEach(line => {
      if (line.trim()) {
        const [added, deleted, file] = line.split('\t');
        if (file) {
          const extension = file.split('.').pop()?.toLowerCase() || 'no-extension';
          if (!stats[extension]) {
            stats[extension] = { added: 0, deleted: 0 };
          }
          stats[extension].added += parseInt(added) || 0;
          stats[extension].deleted += parseInt(deleted) || 0;
        }
      }
    });
  } catch (error) {
    console.error(chalk.red(t('common.error')), error);
  }
  
  return stats;
}

function displayStats(title: string, stats: { [key: string]: FileStats }) {
  console.log('\n' + chalk.cyan(title));
  console.log(chalk.gray('─'.repeat(65)));
  
  console.log(chalk.white(
    t('commands.statistics.header').padEnd(15),
    t('commands.statistics.files').padEnd(10),
    t('commands.statistics.lines').padEnd(10),
    t('commands.statistics.added').padEnd(10),
    t('commands.statistics.deleted').padEnd(10),
    t('commands.statistics.percentage')
  ));
  
  console.log(chalk.gray('─'.repeat(65)));

  const sortedStats = Object.values(stats).sort((a, b) => 
    (b.added || 0) + (b.deleted || 0) - ((a.added || 0) + (a.deleted || 0))
  );

  const totalFiles = sortedStats.reduce((sum, stat) => sum + stat.fileCount, 0);
  const totalLines = sortedStats.reduce((sum, stat) => sum + stat.lineCount, 0);
  const totalAdded = sortedStats.reduce((sum, stat) => sum + (stat.added || 0), 0);
  const totalDeleted = sortedStats.reduce((sum, stat) => sum + (stat.deleted || 0), 0);

  for (const stat of sortedStats) {
    if ((stat.added || 0) + (stat.deleted || 0) > 0) {
      const percentage = ((stat.lineCount / totalLines) * 100).toFixed(1);
      console.log(
        chalk.green(stat.extension.padEnd(15)),
        chalk.yellow(stat.fileCount.toString().padEnd(10)),
        chalk.blue(stat.lineCount.toString().padEnd(10)),
        chalk.green((stat.added || 0).toString().padEnd(10)),
        chalk.red((stat.deleted || 0).toString().padEnd(10)),
        chalk.magenta(`${percentage}%`)
      );
    }
  }

  console.log(chalk.gray('─'.repeat(65)));
  console.log(
    chalk.white(t('commands.statistics.total').padEnd(15)),
    chalk.yellow(totalFiles.toString().padEnd(10)),
    chalk.blue(totalLines.toString().padEnd(10)),
    chalk.green(totalAdded.toString().padEnd(10)),
    chalk.red(totalDeleted.toString().padEnd(10)),
    chalk.magenta('100%')
  );
  console.log();
}

export async function handleStatistics(options: Options = {}) {
  try {
    // 当前项目统计
    const files = execSync('git ls-files', { encoding: 'utf-8' })
      .split('\n')
      .filter(Boolean);

    const currentStats: { [key: string]: FileStats } = {};

    for (const file of files) {
      const extension = file.split('.').pop()?.toLowerCase() || 'no-extension';
      
      try {
        const content = readFileSync(file, 'utf-8');
        const lineCount = content.split('\n').length;

        if (!currentStats[extension]) {
          currentStats[extension] = {
            extension,
            lineCount: 0,
            fileCount: 0
          };
        }

        currentStats[extension].lineCount += lineCount;
        currentStats[extension].fileCount += 1;
      } catch (error) {
        console.error(chalk.red(`Error reading file ${file}:`, error));
      }
    }

    // 显示当前项目统计
    displayStats(t('commands.statistics.current'), currentStats);

    // 根据选项显示不同时间范围的统计
    const timeRanges = {
      day: { flag: options.day, period: '1 day' },
      week: { flag: options.week, period: '1 week' },
      month: { flag: options.month, period: '1 month' },
      year: { flag: options.year, period: '1 year' }
    };

    for (const [key, { flag, period }] of Object.entries(timeRanges)) {
      if (flag) {
        const stats = getGitStats(period);
        const timeStats: { [key: string]: FileStats } = {};

        // 合并当前统计和变更统计
        for (const extension in currentStats) {
          timeStats[extension] = {
            ...currentStats[extension],
            added: 0,
            deleted: 0
          };
        }

        for (const extension in stats) {
          if (!timeStats[extension]) {
            timeStats[extension] = {
              extension,
              lineCount: 0,
              fileCount: 0,
              added: 0,
              deleted: 0
            };
          }
          timeStats[extension].added = stats[extension].added;
          timeStats[extension].deleted = stats[extension].deleted;
        }

        displayStats(t(`commands.statistics.${key}`), timeStats);
      }
    }

  } catch (error) {
    console.error(chalk.red(t('common.error')), error);
  }
}
