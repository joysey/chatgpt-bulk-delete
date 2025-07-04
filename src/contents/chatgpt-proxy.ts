import type { PlasmoCSConfig } from "plasmo";
import type { 
  ContentMessage, 
  ContentResponse,
  GetConversationsResponse,
  SearchConversationsResponse,
  DeleteConversationResponse,
  GetTokenResponse,
  CheckStatusResponse
} from "../types/message";
import { MESSAGE_TYPES } from "../utils/constants";

export const config: PlasmoCSConfig = {
  matches: ["https://chatgpt.com/*","https://chat.openai.com/*"],
  all_frames: false,
  run_at: "document_start"
};

/**
 * ChatGPT API 
 */
class ChatGPTProxy {
  private cachedToken: string | null = null;
  private tokenExpiry: number | null = null;

  /**
   * getAccessToken
   */
  async getAccessToken(): Promise<string> {
    if (this.cachedToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.cachedToken;
    }

    try {
      const response = await fetch('https://chatgpt.com/api/auth/session', {
        method: 'GET',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Session request failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.accessToken) {
        throw new Error('No access token in session response');
      }

      this.cachedToken = data.accessToken;
      this.tokenExpiry = Date.now() + (55 * 60 * 1000);

      return data.accessToken;
    } catch (error) {
      throw new Error(`Failed to get access token: ${error.message}`);
    }
  }

 
  private async getHeaders(): Promise<HeadersInit> {
    const token = await this.getAccessToken();
    
    return {
      'accept': '*/*',
      'accept-language': 'en-US,en;q=0.9',
      'authorization': `Bearer ${token}`,
      'content-type': 'application/json',
      'oai-language': 'en-US',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin'
    };
  }

 
  async getConversations(offset: number = 0, limit: number = 28): Promise<any> {
    try {
      const headers = await this.getHeaders();
      const url = `https://chatgpt.com/backend-api/conversations?offset=${offset}&limit=${limit}&order=updated&is_archived=false`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers,
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch conversations: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`Get conversations error: ${error.message}`);
    }
  }

  /**
   * searchConversations
   */
  async searchConversations(query: string, offset: number = 0): Promise<any> {
    try {
      const headers = await this.getHeaders();
      // query=task&cursor=
      const url = `https://chatgpt.com/backend-api/conversations/search?query=${encodeURIComponent(query)}&cursor=`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers,
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Failed to search conversations: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`Search conversations error: ${error.message}`);
    }
  }

  /**
   * deleteConversation
   */
  async deleteConversation(id: string): Promise<any> {
    try {
      const headers = await this.getHeaders();
      const url = `https://chatgpt.com/backend-api/conversation/${id}`;
      
      const response = await fetch(url, {
        method: 'PATCH',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          is_visible: false
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to delete conversation: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      throw new Error(`Delete conversation error: ${error.message}`);
    }
  }

  /**
   * checkStatus
   */
  async checkStatus(): Promise<{ isLoggedIn: boolean; hasAccess: boolean }> {
    try {
      const response = await fetch('https://chatgpt.com/api/auth/session', {
        method: 'GET',
        credentials: 'include'
      });
      console.log(response)

      if (!response.ok) {
        return { isLoggedIn: false, hasAccess: false };
      }

      const data = await response.json();
      console.log("data")
      console.log(data)
      const isLoggedIn = !!data.user;
      const hasAccess = !!data.accessToken;
      console.log("isLoggedIn:",isLoggedIn,hasAccess)
      const result = { isLoggedIn, hasAccess }
      console.log(result)
      return result;
    } catch (error) {
      return { isLoggedIn: false, hasAccess: false };
    }
  }
}

// ChatGPTProxy
const proxy = new ChatGPTProxy();

/**
 * handleMessage
 */
async function handleMessage(message: ContentMessage): Promise<ContentResponse> {
  const { type, requestId, payload } = message;

  try {
    switch (type) {
      case MESSAGE_TYPES.GET_CONVERSATIONS: {
        const { offset, limit } = payload;
        const data = await proxy.getConversations(offset, limit);
        return {
          success: true,
          requestId,
          data
        } as GetConversationsResponse;
      }

      case MESSAGE_TYPES.SEARCH_CONVERSATIONS: {
        const { query, offset } = payload;
        const data = await proxy.searchConversations(query, offset || 0);
        return {
          success: true,
          requestId,
          data
        } as SearchConversationsResponse;
      }

      case MESSAGE_TYPES.DELETE_CONVERSATION: {
        const { id } = payload;
        const data = await proxy.deleteConversation(id);
        return {
          success: true,
          requestId,
          data
        } as DeleteConversationResponse;
      }

      case MESSAGE_TYPES.GET_TOKEN: {
        const accessToken = await proxy.getAccessToken();
        return {
          success: true,
          requestId,
          data: { accessToken }
        } as GetTokenResponse;
      }

      case MESSAGE_TYPES.CHECK_STATUS: {
        const data = await proxy.checkStatus();
        return {
          success: true,
          requestId,
          data
        } as CheckStatusResponse;
      }

      default:
        throw new Error(`Unknown message type: ${type}`);
    }
  } catch (error) {
    return {
      success: false,
      requestId,
      error: error.message
    };
  }
}

/**
 * addListener
 */
chrome.runtime.onMessage.addListener((message: ContentMessage, sender, sendResponse) => {
  if (!message.type || !message.requestId) {
    return false;
  }

  console.log('Content Script received message:', message.type, message.requestId);

  handleMessage(message).then(response => {
    console.log('Content Script sending response:', response);
    sendResponse(response);
  }).catch(error => {
    console.error('Content Script error:', error);
    const errorResponse = {
      success: false,
      requestId: message.requestId,
      error: error.message
    };
    console.log('Content Script sending error response:', errorResponse);
    sendResponse(errorResponse);
  });

  return true;
});

window.addEventListener('load', () => {
  setTimeout(() => {
    proxy.getAccessToken().catch(error => {
      console.warn('Failed to cache access token:', error.message);
    });
  }, 2000);
});

console.log('ChatGPT Batch Delete: Content script loaded');