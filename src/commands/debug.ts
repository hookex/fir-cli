import { debugLastCommand } from '../services/debug.js';

export async function handleDebug() {
  try {
    await debugLastCommand();
  } catch (error: any) {
    console.error('Debug error:', error.message);
  }
}
