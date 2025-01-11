import { execSync } from 'child_process';
import { existsSync } from 'fs';

export function createAliases(binPath: string): void {
  try {
    const aPath = binPath.replace(/one$/, 'a');
    const oPath = binPath.replace(/one$/, 'o');

    if (!existsSync(aPath)) {
      execSync(`ln -s "${binPath}" "${aPath}"`);
    }
    if (!existsSync(oPath)) {
      execSync(`ln -s "${binPath}" "${oPath}"`);
    }
  } catch (error) {
    // 忽略创建软链接时的错误
  }
}
