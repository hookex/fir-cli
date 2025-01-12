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
      ? '你是一个翻译助手。请将英文翻译成中文，只返回翻译结果，不要有任何解释。'
      : 'You are a translation assistant. Translate Chinese to English, return only the translation, no explanations.';

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
      ]
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
