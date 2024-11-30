import { useState, useEffect } from 'react';
import { fetchUserProfile, updateUserProfile } from '@/services/UserService';
import { UserProfile } from '@/types/UserTypes';
import { useTheme } from "@/contexts/ThemeContext";
import { tokenMiddleware } from '@/services/TokenMiddleware';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';

const profilePictureOptions = ["Option1.png", "Option2.png", "Option3.png", "Option4.png", "Option5.png"];

const ProfilePage = () => {
  const { setTheme } = useTheme();
  const { setProfileURL } = useAuth();

  const [profile, setProfile] = useState<UserProfile>({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    pfpURL: '',
    phoneNumber: '',
    theme: 'LIGHT',
  });

  const [errors, setErrors] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
  });

  const [generalError, setGeneralError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        // console.log(localStorage.getItem('accessToken'));
        const data = await tokenMiddleware(fetchUserProfile, [setTheme]);
        setProfile(data);
      } catch (error) {
        console.error(error);
        setGeneralError('Failed to load profile. Please try again.');
      }
    }

    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });

    setErrors({ ...errors, [name]: '' });
  };

  const handleProfilePictureSelect = (option: string) => {
    setProfile({ ...profile, pfpURL: option });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newErrors = {
      username: profile.username ? '' : 'Username is required',
      firstName: profile.firstName ? '' : 'First name is required',
      lastName: profile.lastName ? '' : 'Last name is required',
      email: profile.email ? '' : 'Email is required',
    };

    setErrors(newErrors);

    if (Object.values(newErrors).every((error) => error === '')) {
      try {
        await tokenMiddleware(updateUserProfile, [profile, setTheme, setProfileURL]);
        console.log('Profile Updated:', profile);
      } catch (err) {
        if (err instanceof Error) {
          setGeneralError(err.message);
        }
      }
    }
    else {
      setGeneralError('Please fill in all required fields.');
      return;
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4 dark:bg-gray-900 dark:text-gray-100">
      <form onSubmit={handleSubmit} className="w-full max-w-2xl p-8 space-y-6 bg-white shadow-md rounded-lg dark:bg-gray-700">
        <h2 className="text-2xl font-bold text-center text-gray-700 dark:text-gray-300">Edit Profile</h2>

        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Username
          </label>
          <input
            id="username"
            name="username"
            value={profile.username}
            onChange={handleChange}
            className={`mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 dark:bg-gray-300 dark:text-black ${
              errors.firstName ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-blue-300'
            }`}
          />
        </div>

        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            First Name
          </label>
          <input
            id="firstName"
            name="firstName"
            value={profile.firstName}
            onChange={handleChange}
            className={`mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 dark:bg-gray-300 dark:text-black ${
              errors.firstName ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-blue-300'
            }`}
          />
          {errors.firstName && <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>}
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Last Name
          </label>
          <input
            id="lastName"
            name="lastName"
            value={profile.lastName}
            onChange={handleChange}
            className={`mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 dark:bg-gray-300 dark:text-black ${
              errors.lastName ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-blue-300'
            }`}
          />
          {errors.lastName && <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={profile.email}
            onChange={handleChange}
            className={`mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 dark:bg-gray-300 dark:text-black ${
              errors.email ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-blue-300'
            }`}
          />
          {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Profile Picture</label>
          <div className="flex flex-wrap items-center gap-4 mt-2">
            {profilePictureOptions.map((option) => (
              <div
                key={option}
                onClick={() => handleProfilePictureSelect(option)}
                className={`w-16 h-16 rounded-md border-2 cursor-pointer flex items-center justify-center text-sm font-medium ${
                  profile.pfpURL === option
                    ? 'border-blue-500 bg-blue-100'
                    : 'border-gray-300 bg-gray-200'
                }`}
              >
                <Image
                  src={`/${option}`}
                  className="w-full h-full object-cover rounded-md"
                  alt={`${option}`}
                  width={32}
                  height={32}
                />
              </div>
            ))}
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">
            Selected: <span className="font-bold">{profile.pfpURL.replace(/\.png$/, '').replace(/Option(\d+)/, 'Option $1')}</span>
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Theme</label>
          <div className="flex items-center gap-4 mt-1">
            <label>
              <input
                type="radio"
                name="theme"
                value="LIGHT"
                checked={profile.theme === 'LIGHT'}
                onChange={handleChange}
                className="mr-2"
              />
              Light
            </label>
            <label>
              <input
                type="radio"
                name="theme"
                value="DARK"
                checked={profile.theme === 'DARK'}
                onChange={handleChange}
                className="mr-2"
              />
              Dark
            </label>
          </div>
        </div>

        {generalError && <p className="text-red-500 text-sm">{generalError}</p>}

        <button
          type="submit"
          className="w-full px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default ProfilePage;