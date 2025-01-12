import axios from 'axios';
import { config } from '../config/config.js';
import chalk from 'chalk';

interface TranslationResult {
  english?: string;
  chinese?: string;
}

export async function translate(text: string): Promise<TranslationResult> {
  try {
    const isEnglish = /^[a-zA-Z\s\d.,!?'"()\-]+$/.test(text);
    const systemPrompt = isEnglish
      ? `你是一个翻译助手，请将英文翻译成中文。规则：
         1. 直接返回翻译结果，不要有任何解释
         2. 如果有多个含义，用数字列表返回，每行一个含义
         3. 保持简洁，不要有多余的词语
         4. 不要加句号或感叹号`
      : `You are a translation assistant. Rules:
         1. Return only the translation, no explanations
         2. If multiple meanings exist, use numbered list with one meaning per line
         3. Keep it concise, no extra words
         4. No periods or exclamation marks`;

    const response = await axios.post(config.ai.baseURL, {
      model: config.ai.model,
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: text
        }
      ],
      temperature: 0.3, // 降低随机性，提高一致性
      max_tokens: 100,  // 限制返回长度
      presence_penalty: -0.5, // 鼓励简短回答
    }, {
      headers: {
        'Authorization': `Bearer ${config.ai.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    const translation = response.data.choices[0].message.content.trim();
    
    return {
      english: isEnglish ? text : translation,
      chinese: isEnglish ? translation : text
    };
  } catch (error: any) {
    console.error(chalk.red('Translation error:'), error.message);
    throw error;
  }
}
