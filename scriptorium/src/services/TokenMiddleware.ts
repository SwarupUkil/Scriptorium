import { accountVerification } from "./UserService";
import { getGlobalLogout } from "@/contexts/AuthContext";

export async function tokenMiddleware (
  func: (...args: any[]) => Promise<any>,
  args: any[]
): Promise<any> {
  const logout = getGlobalLogout();

  try {
    const response = await func(...args);
    if (response instanceof Error) {
      if (response.message === 'Unauthorized: Invalid token') {
        console.log('Token invalid, attempting to refresh...');

        const accessToken = localStorage.getItem('accessToken') || '';
        const refreshToken = localStorage.getItem('refreshToken') || '';

        if (!accessToken || !refreshToken) {
          console.error('No tokens available for account verification.');
          logout();
          // throw new Error('Session expired. Please log in again.');
        }

        const verificationResponse = await accountVerification(accessToken, refreshToken, logout);

        if (verificationResponse) {
          console.log('Account verification successful. Retrying...');
          const newResponse = await func(...args);
          if (newResponse instanceof Error) {
            logout();
            return null;
          }
          else {
            return newResponse;
          }
        } 
        else {
          logout();
          // throw new Error('Account verification failed. Please log in again.');
        }
      }
      else {
        logout();
        return null;
      }
    }
    return response;
  } catch (error) {
    return null;
  }
}
