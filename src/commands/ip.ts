import axios from 'axios';
import { networkInterfaces } from 'os';
import chalk from 'chalk';
import { t } from '../i18n/index.js';

export async function handleIp() {
  // 获取本地 IP
  const interfaces = networkInterfaces();
  let localIp = '';
  
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] ?? []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        localIp = iface.address;
        break;
      }
    }
    if (localIp) break;
  }

  try {
    // 获取公网 IP
    const response = await axios.get('https://api.ipify.org?format=json');
    const publicIp = response.data.ip;

    // 显示结果
    console.log('\n' + t('commands.ip.title'));
    console.log('  ' + t('commands.ip.local').padEnd(10) + localIp);
    console.log('  ' + t('commands.ip.public').padEnd(10) + publicIp);
    console.log();

  } catch (error) {
    console.error(chalk.red(t('common.error')), error);
  }
}
