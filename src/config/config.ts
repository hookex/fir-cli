import os from 'os';
import path from 'path';

export const config = {
  // AI API 配置
  ai: {
    baseURL: process.env.OPENAI_API_BASE_URL || 'https://api.openai.com/v1',
    model: process.env.OPENAI_API_MODEL || 'gpt-3.5-turbo',
    apiKey: process.env.OPENAI_API_KEY || ''
  },
  paths: {
    config: path.join(os.homedir(), '.fir-cli')
  }
};
