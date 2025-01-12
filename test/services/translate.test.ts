import { describe, it, expect, beforeEach } from 'vitest';
import { translate } from '../../src/services/translate.js';
import { mockAxios, mockConsole } from '../helpers.js';

describe('translate service', () => {
  const axios = mockAxios();
  const console = mockConsole();

  beforeEach(() => {
    console.clear();
    vi.clearAllMocks();
  });

  it('should translate English to Chinese', async () => {
    const mockResponse = {
      data: {
        choices: [{
          message: {
            content: '你好'
          }
        }]
      }
    };
    
    axios.post.mockResolvedValueOnce(mockResponse);
    
    const result = await translate('hello');
    
    expect(result).toEqual({
      english: 'hello',
      chinese: '你好'
    });
    
    expect(axios.post).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        messages: expect.arrayContaining([
          expect.objectContaining({
            content: expect.stringContaining('中文')
          })
        ])
      }),
      expect.any(Object)
    );
  });

  it('should translate Chinese to English', async () => {
    const mockResponse = {
      data: {
        choices: [{
          message: {
            content: 'hello'
          }
        }]
      }
    };
    
    axios.post.mockResolvedValueOnce(mockResponse);
    
    const result = await translate('你好');
    
    expect(result).toEqual({
      english: 'hello',
      chinese: '你好'
    });
  });

  it('should handle translation errors', async () => {
    const error = new Error('Translation failed');
    axios.post.mockRejectedValueOnce(error);
    
    await expect(translate('hello')).rejects.toThrow('Translation failed');
    expect(console.getErrors()).toContain(expect.stringContaining('Translation failed'));
  });

  it('should handle multiple meanings', async () => {
    const mockResponse = {
      data: {
        choices: [{
          message: {
            content: '1. 银行\n2. 河岸'
          }
        }]
      }
    };
    
    axios.post.mockResolvedValueOnce(mockResponse);
    
    const result = await translate('bank');
    
    expect(result.chinese).toBe('1. 银行\n2. 河岸');
  });
});
