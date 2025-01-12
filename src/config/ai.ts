import fs from 'fs';
import path from 'path';
import { config } from './config.js';
import chalk from 'chalk';

export interface AIConfig {
  language: string;
}

const CONFIG_FILE = path.join(config.paths.config, 'ai.json');
const DEFAULT_CONFIG: AIConfig = {
  language: 'zh'
};

// 确保配置目录存在
function ensureConfigDir() {
  const configDir = path.dirname(CONFIG_FILE);
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
}

// 加载配置
export function getConfig(): AIConfig {
  try {
    ensureConfigDir();
    if (fs.existsSync(CONFIG_FILE)) {
      return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
    }
    return DEFAULT_CONFIG;
  } catch (error) {
    console.error('Error loading AI config:', error);
    return DEFAULT_CONFIG;
  }
}

// 保存配置
function saveConfig(config: AIConfig) {
  try {
    ensureConfigDir();
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
  } catch (error) {
    console.error('Error saving AI config:', error);
  }
}

// 显示当前配置
export function showConfig() {
  const config = getConfig();
  console.log(chalk.cyan('\nAI Configuration:'));
  console.log(chalk.gray('----------------------------------------'));
  console.log(chalk.yellow('Commit Message Language:'), config.language === 'zh' ? 'Chinese' : 'English');
  console.log(chalk.gray('----------------------------------------'));
}

// 切换语言
export function toggleLanguage() {
  const config = getConfig();
  config.language = config.language === 'zh' ? 'en' : 'zh';
  saveConfig(config);
  
  console.log(chalk.green('✓'), 'Commit message language set to:',
    config.language === 'zh' ? chalk.cyan('Chinese') : chalk.cyan('English'));
}
