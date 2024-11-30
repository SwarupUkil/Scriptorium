import { ExecuteRequest, ExecuteResponse, ExecuteErrorResponse } from '@/types/ExecuteType';

export async function executeCode(requestData: ExecuteRequest): Promise<ExecuteResponse> {
  try {
    const response = await fetch('/api/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    const data: ExecuteResponse | ExecuteErrorResponse = await response.json();

    if (!response.ok) {
      throw new Error((data as ExecuteErrorResponse).error + " " + (data as ExecuteErrorResponse).details || 'Execution failed');
    }

    return data as ExecuteResponse;
  } catch (error) {
    if (error instanceof Error) {
      console.error('Execution error:', error.message);
      throw error;
    }
    throw new Error('An unexpected error occurred during execution.');
  }
}
