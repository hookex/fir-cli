export const config = {
  // 豆包 API 配置
  doubanAI: {
    apiKey: process.env.DOUBAN_API_KEY || '',
    apiEndpoint: 'https://api.doubao.com/v1/chat/completions', // 替换为实际的豆包 API 端点
  }
};
