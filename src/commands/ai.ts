import chalk from 'chalk';
import { chat } from '../services/chat.js';
import ora from 'ora';
import inquirer from 'inquirer';

export async function handleAI(question?: string) {
  let userQuestion: string;

  // 如果没有提供问题，提示用户输入
  if (!question) {
    const { input } = await inquirer.prompt([{
      type: 'input',
      name: 'input',
      message: 'What would you like to ask?'
    }]);
    
    if (!input.trim()) {
      return;
    }
    
    userQuestion = input.trim();
  } else {
    userQuestion = question.trim();
  }

  // 发送问题到 AI
  const spinner = ora('Thinking...').start();
  try {
    const answer = await chat(userQuestion);
    spinner.stop();
    console.log(chalk.blue('\nAI:'), answer);
  } catch (error: any) {
    spinner.fail('Failed to get response');
    console.error(chalk.red('Error:'), error.message);
  }
}
