import axios from 'axios';
import { config } from '../config/config.js';
import fs from 'fs';
import path from 'path';
import os from 'os';
import chalk from 'chalk';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatHistory {
  messages: Message[];
  lastUpdate: string;
}

const HISTORY_FILE = path.join(os.homedir(), '.fir-cli', 'chat-history.json');
const MAX_HISTORY = 10; // 保留最近10次对话

// 加载历史记录
function loadHistory(): ChatHistory {
  try {
    if (fs.existsSync(HISTORY_FILE)) {
      return JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf-8'));
    }
  } catch (error) {
    console.error('Error loading chat history:', error);
  }
  
  return {
    messages: [],
    lastUpdate: new Date().toISOString()
  };
}

// 保存历史记录
function saveHistory(history: ChatHistory) {
  try {
    const configDir = path.dirname(HISTORY_FILE);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
  } catch (error) {
    console.error('Error saving chat history:', error);
  }
}

// 获取系统提示
function getSystemPrompt(): string {
  return `你是一个友好的 AI 助手，专注于帮助用户解决编程和技术问题。
  规则：
  1. 保持回答简洁明了
  2. 优先使用代码示例来解释
  3. 如果不确定，诚实地说出来
  4. 使用 markdown 格式化输出`;
}

export async function chat(question: string): Promise<string> {
  try {
    const history = loadHistory();
    
    // 如果是新对话，添加系统提示
    if (history.messages.length === 0) {
      history.messages.push({
        role: 'system',
        content: getSystemPrompt()
      });
    }
    
    // 添加用户问题
    history.messages.push({
      role: 'user',
      content: question
    });
    
    // 保持历史记录在合理范围内
    if (history.messages.length > MAX_HISTORY * 2) {
      // 保留系统提示和最近的对话
      history.messages = [
        history.messages[0],
        ...history.messages.slice(-MAX_HISTORY * 2)
      ];
    }
    
    const response = await axios.post(config.ai.baseURL, {
      model: config.ai.model,
      messages: history.messages,
      temperature: 0.7,
      max_tokens: 1000,
      stream: false
    }, {
      headers: {
        'Authorization': `Bearer ${config.ai.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    const answer = response.data.choices[0].message.content.trim();
    
    // 添加 AI 回答到历史记录
    history.messages.push({
      role: 'assistant',
      content: answer
    });
    
    // 更新最后更新时间
    history.lastUpdate = new Date().toISOString();
    
    // 保存历史记录
    saveHistory(history);
    
    return answer;
  } catch (error: any) {
    console.error(chalk.red('Chat error:'), error.message);
    throw error;
  }
}

export function showHistory() {
  const history = loadHistory();
  if (history.messages.length <= 1) { // 只有系统提示
    console.log(chalk.yellow('No chat history yet.'));
    return;
  }

  console.log(chalk.cyan('\nChat History:'));
  console.log(chalk.gray(`Last updated: ${new Date(history.lastUpdate).toLocaleString()}\n`));
  
  history.messages.forEach((msg, index) => {
    if (msg.role === 'system') return;
    
    if (msg.role === 'user') {
      console.log(chalk.green('You:'), msg.content);
    } else {
      console.log(chalk.blue('AI:'), msg.content);
    }
    
    if (index < history.messages.length - 1) {
      console.log(); // 添加空行分隔
    }
  });
}

export function clearHistory() {
  try {
    if (fs.existsSync(HISTORY_FILE)) {
      fs.unlinkSync(HISTORY_FILE);
      console.log(chalk.green('✓ Chat history cleared'));
    }
  } catch (error) {
    console.error(chalk.red('Error clearing chat history:'), error);
  }
}
