import en from './en.js';
import zh from './zh.js';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { homedir } from 'os';
import chalk from 'chalk';

// 支持的语言
export const SUPPORTED_LANGUAGES = ['en', 'zh'] as const;
export type Language = typeof SUPPORTED_LANGUAGES[number];

// 配置文件路径
const CONFIG_FILE = join(homedir(), '.fir-cli.json');

// 配置接口
interface Config {
  language: Language;
}

// 默认配置
const DEFAULT_CONFIG: Config = {
  language: 'en'
};

// 获取配置
export function getConfig(): Config {
  try {
    const config = JSON.parse(readFileSync(CONFIG_FILE, 'utf-8'));
    return {
      ...DEFAULT_CONFIG,
      ...config,
      language: SUPPORTED_LANGUAGES.includes(config.language as Language) 
        ? config.language 
        : DEFAULT_CONFIG.language
    };
  } catch {
    return DEFAULT_CONFIG;
  }
}

// 保存配置
export function saveConfig(config: Partial<Config>): void {
  try {
    const currentConfig = getConfig();
    const newConfig = { ...currentConfig, ...config };
    writeFileSync(CONFIG_FILE, JSON.stringify(newConfig, null, 2));
    console.log(chalk.green('✓ Configuration saved successfully'));
  } catch (error) {
    console.error(chalk.red('Error saving configuration:'), error);
  }
}

// 获取翻译文本
export function t(key: string, params: Record<string, any> = {}): string {
  const config = getConfig();
  const messages = config.language === 'zh' ? zh : en;
  
  // 通过点号分割的路径获取翻译
  const keys = key.split('.');
  let value: any = messages;
  
  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) {
      console.warn(chalk.yellow(`Warning: translation key "${key}" not found`));
      return key;
    }
  }
  
  // 替换参数
  if (typeof value === 'string') {
    return Object.entries(params).reduce((text, [key, val]) => {
      return text.replace(new RegExp(`{${key}}`, 'g'), String(val));
    }, value);
  }
  
  return key;
}

export default {
  t,
  getConfig,
  saveConfig,
  SUPPORTED_LANGUAGES
};
