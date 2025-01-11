#!/usr/bin/env node

import { Command } from 'commander';
import open from 'open';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function getCurrentBranch(): Promise<string> {
  const { stdout } = await execAsync('git rev-parse --abbrev-ref HEAD');
  return stdout.trim();
}

async function getLastCommitMessage(): Promise<string> {
  const { stdout } = await execAsync('git log -1 --pretty=%B');
  return stdout.trim();
}

const program = new Command()
  .name("one")
  .version("1.0.0")
  .description("Personal CLI tools collection");

program
  .argument("[action]", "git action (e.g., 'git push')")
  .argument("[message]", "commit message (optional)")
  .action(async (action?: string, message?: string) => {
    try {
      // Handle git push with optional commit
      if (action === 'git' && message?.toLowerCase() === 'push') {
        await execAsync('git add .');
        const currentBranch = await getCurrentBranch();
        const lastMessage = await getLastCommitMessage();
        await execAsync(`git commit -m "update: ${lastMessage}"`);
        const { stdout: pushOutput } = await execAsync(`git push origin ${currentBranch}`);
        console.log(pushOutput || `Successfully pushed to ${currentBranch}`);
      } 
      // Handle git push with custom commit message
      else if (action === 'git' && message) {
        await execAsync('git add .');
        await execAsync(`git commit -m "${message}"`);
        const currentBranch = await getCurrentBranch();
        const { stdout: pushOutput } = await execAsync(`git push origin ${currentBranch}`);
        console.log(pushOutput || `Successfully pushed to ${currentBranch}`);
      }
      // Regular commit
      else if (action) {
        await execAsync('git add .');
        await execAsync(`git commit -m "${action}"`);
        console.log(`Committed with message: ${action}`);
      } else {
        console.log('Usage:\n  one "commit message"\n  one git push\n  one git push "commit message"');
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
