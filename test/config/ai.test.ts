import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getConfig, saveConfig, showConfig, toggleLanguage } from '../../src/config/ai.js';
import { mockConsole } from '../helpers.js';
import fs from 'fs';
import path from 'path';
import os from 'os';

describe('AI configuration', () => {
  const console = mockConsole();
  const configPath = path.join(os.homedir(), '.fir-cli', 'ai-config.json');
  
  beforeEach(() => {
    console.clear();
    // 清理测试配置文件
    try {
      fs.unlinkSync(configPath);
    } catch {}
  });

  afterEach(() => {
    // 清理测试配置文件
    try {
      fs.unlinkSync(configPath);
    } catch {}
  });

  it('should return default config when no file exists', () => {
    const config = getConfig();
    expect(config).toEqual({
      useChinese: false
    });
  });

  it('should save and load config', () => {
    const testConfig = {
      useChinese: true
    };
    
    saveConfig(testConfig);
    const loadedConfig = getConfig();
    
    expect(loadedConfig).toEqual(testConfig);
    expect(console.getLogs()).toContain(expect.stringContaining('saved successfully'));
  });

  it('should toggle language setting', () => {
    const initialConfig = getConfig();
    expect(initialConfig.useChinese).toBe(false);
    
    toggleLanguage();
    const updatedConfig = getConfig();
    expect(updatedConfig.useChinese).toBe(true);
    
    toggleLanguage();
    const finalConfig = getConfig();
    expect(finalConfig.useChinese).toBe(false);
  });

  it('should show current configuration', () => {
    showConfig();
    expect(console.getLogs()).toContain(expect.stringContaining('Current AI Configuration'));
    expect(console.getLogs()).toContain(expect.stringContaining('Commit Message Language'));
  });
});
