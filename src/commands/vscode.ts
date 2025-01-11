import { execSync } from 'child_process';
import chalk from 'chalk';
import inquirer from 'inquirer';

interface Editor {
  name: string;
  value: string;
  command: string;
  appPath: string;
}

const EDITORS: Editor[] = [
  {
    name: 'VS Code',
    value: 'vscode',
    command: 'code',
    appPath: '/Applications/Visual Studio Code.app'
  },
  {
    name: 'WebStorm',
    value: 'webstorm',
    command: 'webstorm',
    appPath: '/Applications/WebStorm.app'
  }
];

export async function openInEditor(): Promise<void> {
  try {
    // 使用 inquirer 让用户选择编辑器
    const { editor } = await inquirer.prompt([
      {
        type: 'list',
        name: 'editor',
        message: 'Choose an editor:',
        choices: EDITORS.map(e => ({ name: e.name, value: e }))
      }
    ]);

    const selectedEditor = editor as Editor;

    // 首先尝试使用命令行工具
    try {
      execSync(`which ${selectedEditor.command}`, { stdio: 'ignore' });
      execSync(`${selectedEditor.command} .`, { stdio: 'inherit' });
      console.log(chalk.green(`✓ Opened current directory in ${selectedEditor.name}`));
      return;
    } catch (cmdError) {
      // 如果命令行工具不可用，尝试直接打开应用
      console.log(chalk.yellow(`${selectedEditor.command} command not found, trying to open app directly...`));
      
      try {
        execSync(`open -a "${selectedEditor.appPath}" .`);
        console.log(chalk.green(`✓ Opened current directory in ${selectedEditor.name}`));
        return;
      } catch (appError) {
        throw new Error(`Failed to open ${selectedEditor.name}. Please make sure it's installed.`);
      }
    }
  } catch (error: any) {
    console.error(chalk.red('Error:'), error.message);
  }
}
