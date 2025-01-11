import chalk from 'chalk';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

// 扩展 dayjs 功能
dayjs.extend(utc);
dayjs.extend(timezone);

export function showTime(): void {
  const now = dayjs();
  
  // 设置北京时区
  const bjTime = now.tz('Asia/Shanghai');
  const utcTime = now.utc();

  console.log(chalk.cyan('\nCurrent Time:'));
  console.log(chalk.white(`  Beijing: ${bjTime.format('YYYY-MM-DD HH:mm:ss Z')}`));
  console.log(chalk.white(`  UTC:     ${utcTime.format('YYYY-MM-DD HH:mm:ss Z')}`));
}
