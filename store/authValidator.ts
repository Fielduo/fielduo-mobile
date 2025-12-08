export const validateLogin = (email: string, password: string) => {
  if (!email.includes('@')) return 'Invalid email';
  if (password.length < 6) return 'Password must be at least 6 characters';
  return null;
};

