declare module 'uuid';

interface Window {
  process?: {
    env?: {
      REACT_APP_USE_MOCK_DATA?: string;
      [key: string]: string | undefined;
    };
  };
}

// File extension for prompt data
interface File {
  promptData?: {
    isPrompt: boolean;
    content: string;
    metadata?: any;
    category?: string;
  };
}