export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[]; 
  data?: T[]; // Some implementations use data instead of items
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  pages?: number; // Some implementations use pages instead of totalPages
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages?: number;
    totalPages?: number;
  };
}