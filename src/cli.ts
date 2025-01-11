#!/usr/bin/env node

import { Command } from 'commander';
import open from 'open';
import { exec } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

const program = new Command()
  .name("one")
  .version("1.0.0")
  .description("Personal CLI tools collection");

program
  .argument("[action]", "git action (e.g., 'git push', 'git open')")
  .argument("[subaction]", "git subaction (e.g., 'push', 'open')")
  .argument("[message]", "commit message (optional)")
  .action(async (action?: string, subaction?: string, message?: string) => {
    try {
      // Handle git open
      if (action === 'git' && subaction === 'open') {
        const repoUrl = await getHttpsRepoUrl();
        await open(repoUrl);
        return;
      }

      // Handle git push with optional commit
      if (action === 'git' && subaction === 'push') {
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
        return;
      }

      // Regular commit
      if (action) {
        await execAsync('git add .');
        await execAsync(`git commit -m "${action}"`);
        console.log(`Committed with message: ${action}`);
      } else {
        console.log('Usage:\n  one "commit message"\n  one git push\n  one git push "commit message"\n  one git open');
      }
    } catch (error: any) {
      console.error("Error:", error.message);
    }
  });

program
  .command("o")
  .description("Open current directory in VS Code")
  .action(async () => {
    try {
      await open('code .');
    } catch (error: any) {
      console.error("Error opening VS Code:", error.message);
    }
  });

program.parse();
