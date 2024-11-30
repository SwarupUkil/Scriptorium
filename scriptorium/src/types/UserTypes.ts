export interface LoginFormData {
  username: string;
  password: string;
}

export interface LoginSuccessResponse {
  accessToken: string;
  refreshToken: string;
}

export interface LoginErrorResponse {
  error: string;
  details?: string;
}

export interface SignupFormData {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  pfpURL: string;
  theme: 'LIGHT' | 'DARK';
}

export interface SignupSuccessResponse {
  message: string;
}

export interface SignupErrorResponse {
  error: string;
  details?: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
}

export interface RefreshTokenErrorResponse {
  error: string;
  details?: string;
}

export interface UserProfile {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  pfpURL: string;
  phoneNumber?: string;
  theme: 'LIGHT' | 'DARK';
}

export interface UpdateProfileResponse {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  pfpURL: string;
  phoneNumber?: string;
  theme: 'LIGHT' | 'DARK';
}

export interface ErrorResponse {
  error: string;
  details?: string;
}
export type UserRole = "ADMIN" | "USER";

export type UserProfileUrls = "Option1.png" | "Option2.png" | "Option3.png" | "Option4.png" | "Option5.png";

export interface AccountVerificationResponse {
  accessToken: string;
  refreshToken: string;
  accountType: UserRole;
}