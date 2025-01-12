import { execSync } from 'child_process';
import { existsSync } from 'fs';

export function createAliases(binPath: string): void {
  try {
    const fPath = binPath.replace(/fir$/, 'f');

    if (!existsSync(fPath)) {
      execSync(`ln -s "${binPath}" "${fPath}"`);
    }
  } catch (error) {
    // 忽略创建软链接时的错误
  }
}
