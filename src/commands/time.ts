import chalk from 'chalk';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

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
    const bjTime = now.tz('Asia/Shanghai');
    const utcTime = now.utc();

    // 如果是自动更新模式且不是第一次运行，先清除之前的输出
    if (autoUpdate && !isFirstRun) {
      clearLines(lineCount);
    }

    // 输出时间信息
    if (isFirstRun) {
      console.log(chalk.cyan('\nCurrent Time:'));
    } else {
      console.log(chalk.cyan('Current Time:'));
    }
    console.log(chalk.white(`  Beijing: ${bjTime.format('YYYY-MM-DD HH:mm:ss Z')}`));
    console.log(chalk.white(`  UTC:     ${utcTime.format('YYYY-MM-DD HH:mm:ss Z')}`));
    
    if (autoUpdate) {
      console.log(chalk.gray('  Press Ctrl+C to stop'));
    }

    isFirstRun = false;
  };

  // 显示初始时间
  displayTime();

  // 如果启用自动更新，设置定时器
  if (autoUpdate) {
    intervalId = setInterval(displayTime, 1000);

    // 设置清理函数
    process.on('SIGINT', () => {
      if (intervalId) {
        clearInterval(intervalId);
        console.log(chalk.yellow('\nStopped time update'));
      }
      process.exit(0);
    });
  }
}
