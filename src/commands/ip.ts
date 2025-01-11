import { networkInterfaces } from 'os';
import chalk from 'chalk';

export function getLocalIPs(): void {
  const interfaces = networkInterfaces();
  let hasInterfaces = false;

  console.log(chalk.cyan('\nLocal IP Addresses:'));
  
  for (const [name, nets] of Object.entries(interfaces)) {
    if (!nets) continue;

    console.log(chalk.yellow(`\n${name}:`));
    
    for (const net of nets) {
      // 跳过内部 IPv6 地址
      if (net.family === 'IPv6' && net.internal) {
        continue;
      }

      const ipType = net.family === 'IPv4' ? 'IPv4' : 'IPv6';
      const internal = net.internal ? '(internal)' : '';
      
      console.log(chalk.white(`  ${ipType}: ${net.address} ${internal}`));
      hasInterfaces = true;
    }
  }

  if (!hasInterfaces) {
    console.log(chalk.red('  No network interfaces found'));
  }
}
