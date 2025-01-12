import inquirer from 'inquirer';
import chalk from 'chalk';
import { showConfig as showAiConfig, toggleLanguage as toggleAiLanguage } from '../config/ai.js';
import { showHistory, clearHistory } from '../services/chat.js';
import { t, getConfig, saveConfig, SUPPORTED_LANGUAGES } from '../i18n/index.js';

// 显示当前配置
function showCurrentConfig() {
  const config = getConfig();
  console.log(chalk.cyan('\n' + t('commands.config.current_config')));
  console.log(chalk.gray(t('commands.config.language') + ':'), config.language);
  console.log();
}

// 切换界面语言
async function changeLanguage() {
  const config = getConfig();
  const { language } = await inquirer.prompt([
    {
      type: 'list',
      name: 'language',
      message: t('commands.config.select_language'),
      choices: SUPPORTED_LANGUAGES.map(lang => ({
        name: lang === 'en' ? 'English' : '中文',
        value: lang
      })),
      default: config.language
    }
  ]);

  if (language !== config.language) {
    saveConfig({ language });
    console.log(chalk.green(t('commands.config.save_success')));
  }
}

// 配置 AI 设置
async function configureAI() {
  const choices = [
    {
      name: t('commands.config.ai.show'),
      value: 'show'
    },
    {
      name: t('commands.config.ai.language'),
      value: 'language'
    },
    {
      name: t('commands.config.ai.history'),
      value: 'history'
    },
    {
      name: t('commands.config.ai.clear'),
      value: 'clear'
    },
    {
      name: t('commands.config.back'),
      value: 'back'
    }
  ];

  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: t('commands.config.select_action'),
      choices
    }
  ]);

  switch (action) {
    case 'show':
      showAiConfig();
      break;
    case 'language':
      toggleAiLanguage();
      break;
    case 'history':
      showHistory();
      break;
    case 'clear':
      clearHistory();
      break;
  }
}

// 主配置菜单
export async function handleConfig() {
  while (true) {
    const choices = [
      {
        name: t('commands.config.menu.show'),
        value: 'show'
      },
      {
        name: t('commands.config.menu.language'),
        value: 'language'
      },
      {
        name: t('commands.config.menu.ai'),
        value: 'ai'
      },
      {
        name: t('commands.config.menu.exit'),
        value: 'exit'
      }
    ];

    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: t('commands.config.select_action'),
        choices
      }
    ]);

    switch (action) {
      case 'show':
        showCurrentConfig();
        break;
      case 'language':
        await changeLanguage();
        break;
      case 'ai':
        await configureAI();
        break;
      case 'exit':
        console.log(chalk.yellow(t('commands.config.exiting')));
        return;
    }
  }
}
