import { execSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import path from 'path';
import os from 'os';

export function createAliases(binPath: string): void {
  try {
    // 确保使用绝对路径
    const absoluteBinPath = path.resolve(binPath);
    const userBinDir = path.join(os.homedir(), '.local', 'bin');
    const fPath = path.join(userBinDir, 'f');

    // 创建用户的 bin 目录（如果不存在）
    if (!existsSync(userBinDir)) {
      mkdirSync(userBinDir, { recursive: true });
      console.log('Created directory:', userBinDir);
    }

    // 创建别名
    if (!existsSync(fPath)) {
      execSync(`ln -s "${absoluteBinPath}" "${fPath}"`);
      console.log('Created alias:', fPath, '->', absoluteBinPath);
      
      // 添加到 PATH（如果需要）
      const rcFile = path.join(os.homedir(), '.zshrc');
      const pathEntry = `\n# Add user's local bin directory to PATH\nexport PATH="$HOME/.local/bin:$PATH"\n`;
      
      if (existsSync(rcFile)) {
        const currentContent = require('fs').readFileSync(rcFile, 'utf8');
        if (!currentContent.includes('.local/bin')) {
          require('fs').appendFileSync(rcFile, pathEntry);
          console.log('Added .local/bin to PATH in .zshrc');
          console.log('Please run: source ~/.zshrc');
        }
      }
    }
  } catch (error) {
    console.error('Error creating alias:', error);
  }
}
