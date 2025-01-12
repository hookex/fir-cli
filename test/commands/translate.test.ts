import { describe, it, expect, beforeEach } from 'vitest';
import { handleTranslate } from '../../src/commands/translate.js';
import { mockConsole } from '../helpers.js';
import * as translateService from '../../src/services/translate.js';

describe('translate command', () => {
  const console = mockConsole();
  
  beforeEach(() => {
    console.clear();
    vi.clearAllMocks();
  });

  it('should show usage when no text provided', async () => {
    await handleTranslate('');
    expect(console.getLogs()).toContain(expect.stringContaining('Usage:'));
    expect(console.getLogs()).toContain(expect.stringContaining('Examples:'));
  });

  it('should handle successful translation', async () => {
    vi.spyOn(translateService, 'translate').mockResolvedValueOnce({
      english: 'hello',
      chinese: '你好'
    });

    await handleTranslate('hello');
    
    expect(console.getLogs()).toContain(expect.stringContaining('Translation completed'));
    expect(console.getLogs()).toContain(expect.stringContaining('EN: hello'));
    expect(console.getLogs()).toContain(expect.stringContaining('CN: 你好'));
  });

  it('should handle translation error', async () => {
    vi.spyOn(translateService, 'translate').mockRejectedValueOnce(new Error('API error'));

    await handleTranslate('hello');
    
    expect(console.getLogs()).toContain(expect.stringContaining('Translation failed'));
    expect(console.getErrors()).toContain(expect.stringContaining('API error'));
  });

  it('should handle multiple meanings', async () => {
    vi.spyOn(translateService, 'translate').mockResolvedValueOnce({
      english: 'bank',
      chinese: '1. 银行\n2. 河岸'
    });

    await handleTranslate('bank');
    
    expect(console.getLogs()).toContain(expect.stringContaining('1. 银行'));
    expect(console.getLogs()).toContain(expect.stringContaining('2. 河岸'));
  });
});
