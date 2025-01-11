import { exec } from 'child_process';
import { promisify } from 'util';
import open from 'open';

const execAsync = promisify(exec);

async function getCurrentBranch(): Promise<string> {
  const { stdout } = await execAsync('git rev-parse --abbrev-ref HEAD');
  return stdout.trim();
}

async function getLastCommitMessage(): Promise<string> {
  const { stdout } = await execAsync('git log -1 --pretty=%B');
  return stdout.trim();
}

async function getHttpsRepoUrl(): Promise<string> {
  const { stdout } = await execAsync('git remote get-url origin');
  const url = stdout.trim();
  
  // Convert SSH URL to HTTPS URL
  if (url.startsWith('git@')) {
    // git@github.com:username/repo.git -> https://github.com/username/repo
    return url
      .replace(/^git@([^:]+):/, 'https://$1/')
      .replace(/\.git$/, '');
  }
  
  // Already HTTPS URL, just remove .git suffix if present
  return url.replace(/\.git$/, '');
}

export async function handleGitOpen(): Promise<void> {
  const repoUrl = await getHttpsRepoUrl();
  await open(repoUrl);
}

export async function handleGitPush(message?: string): Promise<void> {
  await execAsync('git add .');
  if (message) {
    await execAsync(`git commit -m "${message}"`);
  } else {
    const lastMessage = await getLastCommitMessage();
    await execAsync(`git commit -m "update: ${lastMessage}"`);
  }
  const currentBranch = await getCurrentBranch();
  const { stdout: pushOutput } = await execAsync(`git push origin ${currentBranch}`);
  console.log(pushOutput || `Successfully pushed to ${currentBranch}`);
}

export async function handleGitCommit(message: string): Promise<void> {
  await execAsync('git add .');
  await execAsync(`git commit -m "${message}"`);
  console.log(`Committed with message: ${message}`);
}
