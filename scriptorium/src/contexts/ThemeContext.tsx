import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'LIGHT' | 'DARK';

interface ThemeContextProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('LIGHT');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'DARK' : 'LIGHT');

    setTheme(initialTheme);
    document.documentElement.classList.toggle('dark', initialTheme === 'DARK');

    // const handleStorageChange = (event: StorageEvent) => {
    //   console.log("heee")
    //   if (event.key === 'theme') {
    //     const newTheme = event.newValue as 'LIGHT' | 'DARK';
    //     if (newTheme) {
    //       setTheme(newTheme);
    //       document.documentElement.classList.toggle('dark', newTheme === 'DARK');
    //     }
    //   }
    // };
  
    // window.addEventListener('storage', handleStorageChange);
  
    // return () => {
    //   window.removeEventListener('storage', handleStorageChange);
    // };

  }, []);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'DARK');
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'LIGHT' ? 'DARK' : 'LIGHT';
    setTheme(newTheme);

    document.documentElement.classList.toggle('dark', newTheme === 'DARK');
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      <div className={`flex flex-col min-h-screen ${theme === 'DARK' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextProps => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
