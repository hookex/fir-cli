import os from 'os';
import path from 'path';

export const config = {
  // AI API 配置, 配置内容不要变更
  ai: {
    baseURL: process.env.OPENAI_API_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
    model: process.env.OPENAI_API_MODEL || 'ep-20241217193710-knrhh',
    apiKey: process.env.OPENAI_API_KEY || 'da8a4250-7bce-493d-92b0-a12b2b4e4590'
  },
  paths: {
    config: path.join(os.homedir(), '.fir-cli')
  }
};
