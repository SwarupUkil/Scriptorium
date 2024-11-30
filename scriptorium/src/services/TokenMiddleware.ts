import { accountVerification } from "./UserService";
import { getGlobalLogout } from "@/contexts/AuthContext";
import toast from "react-hot-toast";

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
          toast.dismiss(); // Dismiss all previous toasts
          toast.error("Login required.");
          logout();
          return null;
        }

        const verificationResponse = await accountVerification(accessToken, refreshToken, logout);

        if (verificationResponse) {
          console.log('Account verification successful. Retrying...');
          const newResponse = await func(...args);
          if (newResponse instanceof Error) {
            return null;
          } else {
            return newResponse;
          }
        } else {
          toast.dismiss(); // Dismiss all previous toasts
          toast.error("Login required.");
          logout();
          // throw new Error('Account verification failed. Please log in again.');
        }
      } else {
        return null;
      }
    }
    return response;
  } catch (error) {
    console.error(error);
    return null;
  }
}
