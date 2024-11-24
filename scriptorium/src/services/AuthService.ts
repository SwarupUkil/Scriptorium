// EXAMPLE BY GPT
export const login = async (email: string, password: string): Promise<any> => {
    const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
        throw new Error('Failed to log in');
    }
    return response.json();
};

export const signup = async (data: { email: string; password: string; username: string }): Promise<any> => {
    const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        throw new Error('Failed to sign up');
    }
    return response.json();
};