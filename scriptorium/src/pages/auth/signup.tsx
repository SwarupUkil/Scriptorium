import { useState } from 'react';
import { useRouter } from 'next/router';
import { signup } from '@/services/UserService';
import { SignupFormData } from '@/types/UserTypes';
import { useTheme } from "@/contexts/ThemeContext";

const SignupPage = () => {
  const router = useRouter();
  const { setTheme } = useTheme();

  const [formData, setFormData] = useState<SignupFormData>({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
    pfpURL: 'Option1.png',
    theme: 'LIGHT',
  });

  const [errors, setErrors] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });

  const [generalError, setGeneralError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    setErrors({ ...errors, [name]: '' });
  };

  const handleProfilePictureSelect = (option: string) => {
    setFormData({ ...formData, pfpURL: option });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newErrors = {
      username: formData.username ? '' : 'Username is required',
      firstName: formData.firstName ? '' : 'First name is required',
      lastName: formData.lastName ? '' : 'Last name is required',
      email: formData.email ? '' : 'Email is required',
      password: formData.password ? '' : 'Password is required',
    };

    setErrors(newErrors);

    if (Object.values(newErrors).every((error) => error === '')) {
      try {
        const response = await signup(formData, setTheme);
        console.log('Form Submitted:', formData);
        router.push('/auth');
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

  const profilePictureOptions = ['Option1.png', 'Option2.png', 'Option3.png', 'Option4.png', 'Option5.png'];

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4 dark:bg-gray-900 dark:text-gray-100">
      <form onSubmit={handleSubmit} className="w-full max-w-2xl p-8 space-y-6 bg-white shadow-md rounded-lg md:max-w-lg lg:max-w-xl dark:bg-gray-700">
        <h2 className="text-2xl font-bold text-center text-gray-700 dark:text-gray-300">Sign Up</h2>

        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Username
          </label>
          <input
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className={`mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 dark:bg-gray-300 dark:text-black ${
              errors.username ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-blue-300'
            }`}
          />
          {errors.username && <p className="mt-1 text-sm text-red-500">{errors.username}</p>}
        </div>

        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            First Name
          </label>
          <input
            id="firstName"
            name="firstName"
            value={formData.firstName}
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
            value={formData.lastName}
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
            value={formData.email}
            onChange={handleChange}
            className={`mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 dark:bg-gray-300 dark:text-black ${
              errors.email ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-blue-300'
            }`}
          />
          {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            className={`mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 dark:bg-gray-300 dark:text-black ${
              errors.password ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-blue-300'
            }`}
          />
          {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
        </div>

        <div>
          <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Phone Number (Optional)
          </label>
          <input
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            className="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 border-gray-300 focus:ring-blue-300 dark:bg-gray-300 dark:text-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Profile Picture</label>
          <div className="flex flex-wrap items-center gap-4 mt-2">
            {profilePictureOptions.map((option) => (
              <div
                key={option}
                onClick={() => handleProfilePictureSelect(option)}
                className={`w-16 h-16 rounded-md border-2 cursor-pointer flex items-center justify-center text-sm font-medium ${
                  formData.pfpURL === option
                    ? 'border-blue-500 bg-blue-100'
                    : 'border-gray-300 bg-gray-200'
                }`}
              >
                <img
                  src={`../../${option}`}
                  className="w-full h-full object-cover rounded-md"
                />
              </div>
            ))}
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">
            Selected: <span className="font-bold">{formData.pfpURL.replace(/\.png$/, '').replace(/Option(\d+)/, 'Option $1')}</span>
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
                checked={formData.theme === 'LIGHT'}
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
                checked={formData.theme === 'DARK'}
                onChange={handleChange}
                className="mr-2"
              />
              Dark
            </label>
          </div>
        </div>

        {generalError && <p className="text-sm text-red-500">{generalError}</p>}
        <button
          type="submit"
          className="w-full px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          Sign Up
        </button>
      </form>
    </div>
  );
};

export default SignupPage;