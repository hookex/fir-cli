import { readFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { join, relative } from 'path';
import chalk from 'chalk';
import { t } from '../i18n/index.js';

interface FileStats {
  extension: string;
  lineCount: number;
  fileCount: number;
}

export async function handleStatistics() {
  try {
    // 读取 .gitignore 文件
    const gitignorePath = join(process.cwd(), '.gitignore');
    const gitignorePatterns = existsSync(gitignorePath)
      ? readFileSync(gitignorePath, 'utf-8')
          .split('\n')
          .filter(line => line && !line.startsWith('#'))
      : [];

    // 使用 git ls-files 获取所有未被 git 忽略的文件
    const files = execSync('git ls-files', { encoding: 'utf-8' })
      .split('\n')
      .filter(Boolean);

    const stats: { [key: string]: FileStats } = {};

    for (const file of files) {
      const extension = file.split('.').pop()?.toLowerCase() || 'no-extension';
      
      try {
        const content = readFileSync(file, 'utf-8');
        const lineCount = content.split('\n').length;

        if (!stats[extension]) {
          stats[extension] = {
            extension,
            lineCount: 0,
            fileCount: 0
          };
        }

        stats[extension].lineCount += lineCount;
        stats[extension].fileCount += 1;
      } catch (error) {
        console.error(chalk.red(`Error reading file ${file}:`, error));
      }
    }

    // 按行数排序
    const sortedStats = Object.values(stats).sort((a, b) => b.lineCount - a.lineCount);

    // 计算总计
    const totalFiles = sortedStats.reduce((sum, stat) => sum + stat.fileCount, 0);
    const totalLines = sortedStats.reduce((sum, stat) => sum + stat.lineCount, 0);

    // 显示结果
    console.log('\n' + chalk.cyan(t('commands.statistics.title')));
    console.log(chalk.gray('─'.repeat(50)));
    
    console.log(chalk.white(
      t('commands.statistics.header').padEnd(15),
      t('commands.statistics.files').padEnd(10),
      t('commands.statistics.lines').padEnd(10),
      t('commands.statistics.percentage')
    ));
    
    console.log(chalk.gray('─'.repeat(50)));

    for (const stat of sortedStats) {
      const percentage = ((stat.lineCount / totalLines) * 100).toFixed(1);
      console.log(
        chalk.green(stat.extension.padEnd(15)),
        chalk.yellow(stat.fileCount.toString().padEnd(10)),
        chalk.blue(stat.lineCount.toString().padEnd(10)),
        chalk.magenta(`${percentage}%`)
      );
    }

    console.log(chalk.gray('─'.repeat(50)));
    console.log(
      chalk.white(t('commands.statistics.total').padEnd(15)),
      chalk.yellow(totalFiles.toString().padEnd(10)),
      chalk.blue(totalLines.toString().padEnd(10)),
      chalk.magenta('100%')
    );
    console.log();

  } catch (error) {
    console.error(chalk.red(t('common.error')), error);
  }
}
