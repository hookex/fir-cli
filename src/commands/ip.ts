import { networkInterfaces } from 'os';
import chalk from 'chalk';
import axios from 'axios';

export async function getLocalIPs(): Promise<void> {
  // 获取局域网 IP
  const interfaces = networkInterfaces();
  let lanIP = '';

  // 查找第一个非内部的 IPv4 地址
  for (const nets of Object.values(interfaces)) {
    if (!nets) continue;
    
    for (const net of nets) {
      if (net.family === 'IPv4' && !net.internal) {
        lanIP = net.address;
        break;
      }
    }
    if (lanIP) break;
  }

  // 获取公网 IP
  try {
    const response = await axios.get('https://api.ipify.org?format=json');
    const publicIP = response.data.ip;
    
    console.log(chalk.cyan('\nIP Addresses:'));
    console.log(chalk.white(`  LAN:    ${lanIP || 'Not available'}`));
    console.log(chalk.white(`  Public: ${publicIP}`));
  } catch (error) {
    console.log(chalk.cyan('\nIP Addresses:'));
    console.log(chalk.white(`  LAN:    ${lanIP || 'Not available'}`));
    console.log(chalk.red(`  Public: Unable to fetch`));
  }
}
