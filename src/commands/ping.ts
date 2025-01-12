import { exec } from 'child_process';
import { promisify } from 'util';
import chalk from 'chalk';

const execAsync = promisify(exec);

const TOP_10_DOMAINS = [
  'baidu.com',
  'taobao.com',
  'google.com',
  'github.com',
  'bytedance.net',
  'aliyun.com',
  'registry.npmjs.org'
];

interface PingResult {
  domain: string;
  time?: number;
  error?: string;
}

async function pingDomain(domain: string): Promise<PingResult> {
  try {
    // 使用 -c 1 只 ping 一次，-t 2 设置超时为2秒
    const { stdout } = await execAsync(`ping -c 1 -t 2 ${domain}`);
    
    // 从输出中提取时间
    const timeMatch = stdout.match(/time=(\d+\.\d+)/);
    const time = timeMatch ? parseFloat(timeMatch[1]) : undefined;
    
    return { domain, time };
  } catch (error: any) {
    return { domain, error: 'Request timeout' };
  }
}

export async function handlePing(domain?: string): Promise<void> {
  console.log(chalk.cyan('Pinging...'));
  
  const domains = domain ? [domain] : TOP_10_DOMAINS;
  const results: PingResult[] = [];
  
  for (const d of domains) {
    process.stdout.write(`${chalk.yellow('Testing')} ${chalk.green(d)}... `);
    const result = await pingDomain(d);
    
    if (result.time) {
      console.log(chalk.green(`${result.time.toFixed(2)}ms`));
    } else {
      console.log(chalk.red(result.error));
    }
    
    results.push(result);
  }
  
  // 显示汇总结果
  console.log('\n' + chalk.cyan('Summary:'));
  
  // 按响应时间排序（有错误的放在最后）
  results.sort((a, b) => {
    if (a.time && b.time) return a.time - b.time;
    if (a.time) return -1;
    if (b.time) return 1;
    return 0;
  });
  
  results.forEach(result => {
    const status = result.time
      ? chalk.green(`${result.time.toFixed(2)}ms`)
      : chalk.red(result.error);
      
    console.log(`${chalk.yellow(result.domain.padEnd(20))} ${status}`);
  });
}
