export interface ExecuteRequest {
  code: string;
  language: string;
  stdin?: string;
}

export interface ExecuteResponse {
  output: string;
  error?: string;
}

export interface ExecuteErrorResponse {
  error: string;
  details?: string;
}