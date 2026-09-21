export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  totalCount?: number;
  pageNumber?: number;
  pageSize?: number;
}

export interface PagedRequest {
  pageNumber?: number;
  pageSize?: number;
}

export interface PagedResult<T> {
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  data: T[];
}
