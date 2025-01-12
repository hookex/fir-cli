import chalk from 'chalk';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import { t } from '../i18n/index.js';

// 扩展 dayjs 功能
dayjs.extend(utc);
dayjs.extend(timezone);

function clearLines(count: number): void {
  // 移动到输出开始处
  process.stdout.write('\x1B[1A'.repeat(count));
  // 清除所有行
  process.stdout.write('\x1B[0J');
}

export function showTime(autoUpdate: boolean = false): void {
  let lineCount = 4; // 标题 + 两个时间行 + 提示行
  let intervalId: NodeJS.Timeout | null = null;
  let isFirstRun = true;

  const displayTime = () => {
    const now = dayjs();
    const bjTime = now.tz('Asia/Shanghai').format('YYYY-MM-DD HH:mm:ss Z');
    const utcTime = now.utc().format('YYYY-MM-DD HH:mm:ss Z');

    // 如果是自动更新模式且不是第一次运行，先清除之前的输出
    if (autoUpdate && !isFirstRun) {
      clearLines(lineCount);
    }

    // 输出时间信息
    if (isFirstRun) {
      console.log(chalk.cyan('\n' + t('commands.time.title')));
    } else {
      console.log(chalk.cyan(t('commands.time.title')));
    }
    console.log(chalk.white(`  ${t('commands.time.beijing').padEnd(8)} ${bjTime}`));
    console.log(chalk.white(`  ${t('commands.time.utc').padEnd(8)}     ${utcTime}`));
    
    if (autoUpdate) {
      console.log(chalk.gray(t('commands.time.press_ctrl_c')));
    }

    isFirstRun = false;
  };

  // 显示初始时间
  displayTime();

  // 如果启用自动更新，设置定时器
  if (autoUpdate) {
    intervalId = setInterval(displayTime, 1000);
    
    // 监听 Ctrl+C 以停止自动更新
    process.on('SIGINT', () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
      process.exit(0);
    });
  }
}
