#!/usr/bin/env node

import { Command } from 'commander';
import open from 'open';
import { handleGitOpen, handleGitPush, handleGitCommit } from './commands/git.js';

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
        await handleGitOpen();
        return;
      }

      // Handle git push with optional commit
      if (action === 'git' && subaction === 'push') {
        await handleGitPush(message);
        return;
      }

      // Regular commit
      if (action) {
        await handleGitCommit(action);
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
