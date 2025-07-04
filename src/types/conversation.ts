export interface ConversationItem {
  id: string;
  title: string;
  create_time: string;
  update_time?: string;
  isIgnored: boolean;
}

export interface ConversationResponse {
  items: ConversationItem[];
  total: number;
  offset: number;
  limit: number;
  has_missing_conversations: boolean;
}

export interface OperationLog {
  id: string;
  type: 'selected' | 'page' | 'all';
  timestamp: string;
  total: number;
  success: number;
  failed: number;
  failures: {
    id: string;
    title: string;
    reason: string;
  }[];
}

export interface DeleteProgress {
  total: number;
  current: number;
  success: number;
  failed: number;
  currentTitle: string;
  isRunning: boolean;
  canCancel: boolean;
}