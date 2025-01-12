import fs from 'fs';
import path from 'path';
import os from 'os';
import chalk from 'chalk';

interface AIConfig {
  useChinese: boolean;
  // 可以在这里添加更多 AI 相关的配置项
}

const CONFIG_FILE = path.join(os.homedir(), '.fir-cli', 'ai-config.json');

// 确保配置目录存在
function ensureConfigDir() {
  const configDir = path.dirname(CONFIG_FILE);
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
}

// 获取配置
export function getConfig(): AIConfig {
  try {
    ensureConfigDir();
    if (fs.existsSync(CONFIG_FILE)) {
      const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
      return config;
    }
  } catch (error) {
    console.error('Error reading config:', error);
  }
  
  // 默认配置
  return {
    useChinese: false
  };
}

// 保存配置
export function saveConfig(config: AIConfig) {
  try {
    ensureConfigDir();
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
    console.log(chalk.green('✓ Configuration saved successfully'));
  } catch (error) {
    console.error('Error saving config:', error);
  }
}

// 显示当前配置
export function showConfig() {
  const config = getConfig();
  console.log('\nCurrent AI Configuration:');
  console.log(chalk.cyan('Commit Message Language:'), config.useChinese ? 'Chinese' : 'English');
  // 在这里添加更多配置项的显示
  console.log();
}

// 切换语言设置
export function toggleLanguage() {
  const config = getConfig();
  config.useChinese = !config.useChinese;
  saveConfig(config);
  console.log(chalk.green(`✓ Commit message language set to ${config.useChinese ? 'Chinese' : 'English'}`));
}
