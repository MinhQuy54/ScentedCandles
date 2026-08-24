export interface IResponse<T = null> {
    success: boolean;
    code: number;
    message: string;
    data: T | null;
    errorMessage?: string;
  }
  