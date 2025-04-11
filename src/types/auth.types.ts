// Auth related types
interface AuthResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
}

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

// Export the types
export type { AuthResponse, LoginRequest, RegisterRequest };

// Also export an empty object to satisfy TypeScript
export {};