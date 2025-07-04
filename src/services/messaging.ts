import type { 
  ContentMessage, 
  ContentResponse,
  GetConversationsMessage,
  SearchConversationsMessage,
  DeleteConversationMessage,
  GetTokenMessage,
  CheckStatusMessage
} from '../types/message';
import { generateRequestId } from '../utils/helpers';
import { MESSAGE_TYPES } from '../utils/constants';

/**
 */
export class MessagingService {
  private static pendingRequests = new Map<string, {
    resolve: (response: ContentResponse) => void;
    reject: (error: Error) => void;
    timeout: ReturnType<typeof setTimeout>;
  }>();

  /**
   */
  private static async sendMessage<T extends ContentResponse>(
    message: ContentMessage,
    timeout: number = 10000
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const requestId = message.requestId;
      
      const timeoutId = setTimeout(() => {
        this.pendingRequests.delete(requestId);
        reject(new Error('Request timeout'));
      }, timeout);

      this.pendingRequests.set(requestId, {
        resolve: resolve as (response: ContentResponse) => void,
        reject,
        timeout: timeoutId
      });

      chrome.tabs.query({ url: '*://chatgpt.com/*' }, (tabs) => {
        if (tabs.length === 0) {
          this.pendingRequests.delete(requestId);
          clearTimeout(timeoutId);
          reject(new Error('ChatGPT tab not found. Please open chatgpt.com first.'));
          return;
        }

        const tab = tabs[0];
        if (!tab.id) {
          this.pendingRequests.delete(requestId);
          clearTimeout(timeoutId);
          reject(new Error('Invalid tab ID'));
          return;
        }

        console.log('Sending message to tab:', tab.id, message);

        chrome.tabs.sendMessage(tab.id, message, (response) => {
          if (chrome.runtime.lastError) {
            console.error('Chrome runtime error:', chrome.runtime.lastError);
            this.pendingRequests.delete(requestId);
            clearTimeout(timeoutId);
            reject(new Error(`Runtime error: ${chrome.runtime.lastError.message}`));
            return;
          }

          console.log('Received response from content script:', response);
          
          if (response) {
            const requestInfo = this.pendingRequests.get(requestId);
            if (requestInfo) {
              clearTimeout(requestInfo.timeout);
              this.pendingRequests.delete(requestId);
              requestInfo.resolve(response);
            }
          }
        });
      });
    });
  }

  /**
   */
  static handleResponse(response: ContentResponse): void {
  }

  /**
   */
  static async getConversations(offset: number = 0, limit: number = 28) {
    const message: GetConversationsMessage = {
      type: MESSAGE_TYPES.GET_CONVERSATIONS,
      requestId: generateRequestId(),
      payload: { offset, limit }
    };

    return this.sendMessage(message);
  }

  /**
   */
  static async searchConversations(query: string, offset: number = 0) {
    const message: SearchConversationsMessage = {
      type: MESSAGE_TYPES.SEARCH_CONVERSATIONS,
      requestId: generateRequestId(),
      payload: { query, offset }
    };

    return this.sendMessage(message);
  }

  /**
   */
  static async deleteConversation(id: string) {
    const message: DeleteConversationMessage = {
      type: MESSAGE_TYPES.DELETE_CONVERSATION,
      requestId: generateRequestId(),
      payload: { id }
    };

    return this.sendMessage(message);
  }

  /**
   */
  static async getToken() {
    const message: GetTokenMessage = {
      type: MESSAGE_TYPES.GET_TOKEN,
      requestId: generateRequestId()
    };

    return this.sendMessage(message);
  }

  /**
   */
  static async checkStatus() {
    const message: CheckStatusMessage = {
      type: MESSAGE_TYPES.CHECK_STATUS,
      requestId: generateRequestId()
    };

    return this.sendMessage(message, 5000); 
  }

  /**
   */
  static initialize(): void {
  }
}