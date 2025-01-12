export const config = {
  // AI API 配置
  ai: {
    baseURL: process.env.API_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
    model: process.env.API_MODEL || 'ep-20241217193710-knrhh',
    apiKey: process.env.OPENAI_API_KEY || 'da8a4250-7bce-493d-92b0-a12b2b4e4590'
  }
};
