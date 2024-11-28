import { useState } from 'react';
import { useRouter } from 'next/router';
import { loginAPI } from '@/services/UserService';
import { LoginFormData } from '@/types/UserTypes';
import { useTheme } from "@/contexts/ThemeContext";

const LoginPage = () => {
  const router = useRouter();
  const { setTheme } = useTheme();

  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    password: '',
  });

  const [errors, setErrors] = useState({
    username: false,
    password: false,
  });

  const [generalError, setGeneralError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    setErrors({ ...errors, [name]: false });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newErrors = {
      username: !formData.username,
      password: !formData.password,
    };
    setErrors(newErrors);

    if (newErrors.username || newErrors.password) {
      setGeneralError('Please fill in all required fields.');
      return;
    }

    try {
      await loginAPI(formData, setTheme);
      console.log('Login successful, tokens stored');
      router.push('/');
    } catch (err) {
      if (err instanceof Error) {
        setGeneralError(err.message);
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4 dark:bg-gray-900 dark:text-gray-100">
      <form onSubmit={handleSubmit} className="w-full max-w-sm p-6 space-y-4 bg-white shadow-md rounded-lg dark:bg-gray-700">
        <h2 className="text-2xl font-bold text-center text-gray-700 dark:text-gray-300">Login</h2>

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
          {errors.username && <p className="text-sm text-red-500">Username is required</p>}
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
          {errors.password && <p className="text-sm text-red-500">Password is required</p>}
        </div>

        {generalError && <p className="text-sm text-red-500">{generalError}</p>}

        <button
          type="submit"
          className="w-full px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          Submit
        </button>
        <div className="text-center">
          <p className="text-sm">
            Don’t have an account?{' '}
            <button
              type="button"
              onClick={() => router.push('/auth/signup')}
              className="text-blue-500 hover:underline"
            >
              Sign Up
            </button>
          </p>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;