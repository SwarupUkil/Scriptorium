import { LoginFormData, LoginSuccessResponse, SignupFormData, 
  SignupSuccessResponse, RefreshTokenResponse, UserProfile, 
  UpdateProfileResponse, ErrorResponse, AccountVerificationResponse, UserProfileUrls } from "@/types/UserTypes";
import { tokenMiddleware } from "./TokenMiddleware";

export async function loginAPI(formData: LoginFormData, setTheme: (theme: "LIGHT" | "DARK") => void, setProfileURL: (image: UserProfileUrls) => void): Promise<void> {
  try {
    const response = await fetch('/api/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    const data: LoginSuccessResponse | ErrorResponse = await response.json();

    if (!response.ok) {
      throw new Error((data as ErrorResponse).error || 'Login failed');
    }

    const { accessToken, refreshToken } = data as LoginSuccessResponse;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('username', formData.username);

    const profile = await tokenMiddleware(fetchUserProfile, [setTheme]);
    if (profile) {
      const { pfpURL } = profile;
      setProfileURL(pfpURL);
    }

    console.log('Tokens stored in local storage');
  } catch (error) {
    if (error instanceof Error) {
      console.error('Login error:', error.message);
      throw error;
    }
    throw new Error('An unexpected error occurred during login.');
  }
}


export async function signup(formData: SignupFormData, setTheme: (theme: "LIGHT" | "DARK") => void): Promise<SignupSuccessResponse> {
  try {
    const response = await fetch('/api/users/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    const data: SignupSuccessResponse | ErrorResponse = await response.json();

    if (!response.ok) {
      throw new Error((data as ErrorResponse).error || 'Signup failed');
    }

    setTheme(formData.theme);

    return data as SignupSuccessResponse;
  } catch (error) {
    if (error instanceof Error) {
      console.error('Signup error:', error.message);
      throw error;
    }
    throw new Error('An unexpected error occurred during signup.');
  }
}

export async function refreshAccessToken(refreshToken: string): Promise<void> {
  try {
    const response = await fetch('/api/users/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    const data: RefreshTokenResponse | ErrorResponse = await response.json();

    if (!response.ok) {
      throw new Error((data as ErrorResponse).error || 'Failed to refresh token');
    }

    const { accessToken } = data as RefreshTokenResponse;
    localStorage.setItem('accessToken', accessToken);

    console.log('Access token refreshed successfully');
  } catch (error) {
    console.error('Error refreshing access token:', error);
    throw error;
  }
}

export async function fetchUserProfile(setTheme: (theme: "LIGHT" | "DARK") => void): Promise<UserProfile | Error> {
  try {
    const response = await fetch("/api/users/profile", {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });


    const data: UserProfile | ErrorResponse = await response.json();

    if (!response.ok) {
      return new Error((data as ErrorResponse).error || 'Failed to fetch profile');
    }

    const { theme } = data as UserProfile;
    setTheme(theme);

    return data as UserProfile;
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw error;
  }
}

export async function updateUserProfile(profileData: UserProfile, setTheme: (theme: "LIGHT" | "DARK") => void, setProfileURL: (image: UserProfileUrls) => void): Promise<UpdateProfileResponse> {
  try {
    const response = await fetch("/api/users/profile", {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify(profileData),
    });

    const data: UpdateProfileResponse | ErrorResponse = await response.json();

    if (!response.ok) {
      throw new Error((data as ErrorResponse).error || 'Failed to update profile');
    }

    const { theme, pfpURL } = data as UpdateProfileResponse;
    setTheme(theme);
    setProfileURL(pfpURL as UserProfileUrls);

    return data as UpdateProfileResponse;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
}

export async function accountVerification(accessToken: string, refreshToken: string, logout: () => void): Promise<AccountVerificationResponse | null> {
  try {
    const response = await fetch('/api/users/verification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ accessToken, refreshToken }),
    });

    const data: AccountVerificationResponse | ErrorResponse = await response.json();

    if (!response.ok) {
      logout();
      return null;
    }
    
    return data as AccountVerificationResponse;
  } catch (error) {
    console.error('Error verifying account:', error);
    throw error;
  }
}