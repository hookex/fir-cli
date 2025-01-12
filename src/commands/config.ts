import inquirer from 'inquirer';
import chalk from 'chalk';
import { showConfig, toggleLanguage } from '../config/ai.js';
import { showHistory, clearHistory } from '../services/chat.js';

export async function handleConfig() {
  const choices = [
    {
      name: 'Show current configuration',
      value: 'show'
    },
    {
      name: 'Toggle commit message language (English/Chinese)',
      value: 'language'
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
    case 'show':
      showConfig();
      break;
    case 'language':
      toggleLanguage();
      break;
    case 'history':
      showHistory();
      break;
    case 'clear':
      clearHistory();
      break;
    case 'exit':
      console.log(chalk.yellow('Exiting...'));
      break;
  }
}
