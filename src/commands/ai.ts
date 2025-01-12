import inquirer from 'inquirer';
import chalk from 'chalk';
import { showConfig, toggleLanguage } from '../config/ai.js';
import { chat, showHistory, clearHistory } from '../services/chat.js';
import ora from 'ora';

export async function handleAI(question?: string) {
  // 如果提供了问题，直接进行对话
  if (question) {
    const spinner = ora('Thinking...').start();
    try {
      const answer = await chat(question);
      spinner.stop();
      console.log(chalk.blue('\nAI:'), answer);
    } catch (error: any) {
      spinner.fail('Failed to get response');
      console.error(chalk.red('Error:'), error.message);
    }
    return;
  }

  // 否则显示配置菜单
  const choices = [
    {
      name: 'Ask a question',
      value: 'ask'
    },
    {
      name: 'Show chat history',
      value: 'history'
    },
    {
      name: 'Clear chat history',
      value: 'clear'
    },
    {
      name: 'Show current configuration',
      value: 'show'
    },
    {
      name: 'Toggle commit message language (English/Chinese)',
      value: 'language'
    },
    {
      name: 'Exit',
      value: 'exit'
    }
  ];

  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'Select an action:',
      choices
    }
  ]);

  switch (action) {
    case 'ask': {
      const { question } = await inquirer.prompt([{
        type: 'input',
        name: 'question',
        message: 'What would you like to ask?'
      }]);

      if (question.trim()) {
        const spinner = ora('Thinking...').start();
        try {
          const answer = await chat(question);
          spinner.stop();
          console.log(chalk.blue('\nAI:'), answer);
        } catch (error: any) {
          spinner.fail('Failed to get response');
          console.error(chalk.red('Error:'), error.message);
        }
      }
      break;
    }
    case 'history':
      showHistory();
      break;
    case 'clear':
      clearHistory();
      break;
    case 'show':
      showConfig();
      break;
    case 'language':
      toggleLanguage();
      break;
    case 'exit':
      console.log(chalk.yellow('Exiting...'));
      break;
  }
}
