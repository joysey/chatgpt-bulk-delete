export interface BaseMessage {
  type: string;
  requestId: string;
  payload?: any;
}

export interface BaseResponse {
  success: boolean;
  requestId: string;
  error?: string;
}

export interface GetConversationsMessage extends BaseMessage {
  type: 'GET_CONVERSATIONS';
  payload: {
    offset: number;
    limit: number;
  };
}

export interface GetConversationsResponse extends BaseResponse {
  data?: {
    items: any[];
    total: number;
    offset: number;
    limit: number;
    has_missing_conversations: boolean;
  };
}

export interface SearchConversationsMessage extends BaseMessage {
  type: 'SEARCH_CONVERSATIONS';
  payload: {
    query: string;
    offset?: number;
  };
}

export interface SearchConversationsResponse extends BaseResponse {
  data?: {
    items: any[];
    total: number;
  };
}

export interface DeleteConversationMessage extends BaseMessage {
  type: 'DELETE_CONVERSATION';
  payload: {
    id: string;
  };
}

export interface DeleteConversationResponse extends BaseResponse {
  data?: {
    success: boolean;
  };
}

export interface GetTokenMessage extends BaseMessage {
  type: 'GET_TOKEN';
}

export interface GetTokenResponse extends BaseResponse {
  data?: {
    accessToken: string;
  };
}

export interface CheckStatusMessage extends BaseMessage {
  type: 'CHECK_STATUS';
}

export interface CheckStatusResponse extends BaseResponse {
  data?: {
    isLoggedIn: boolean;
    hasAccess: boolean;
  };
}

export type ContentMessage = 
  | GetConversationsMessage
  | SearchConversationsMessage
  | DeleteConversationMessage
  | GetTokenMessage
  | CheckStatusMessage;

export type ContentResponse = 
  | GetConversationsResponse
  | SearchConversationsResponse
  | DeleteConversationResponse
  | GetTokenResponse
  | CheckStatusResponse;