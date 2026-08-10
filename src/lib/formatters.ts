export function formatPrice(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '৳0';
  return `৳${amount.toLocaleString('en-US')}`;
}

export interface PasswordRequirements {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

export function checkPasswordRequirements(password: string): PasswordRequirements {
  return {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password),
  };
}

export function validateStrongPassword(password: string): { isValid: boolean; error?: string } {
  const reqs = checkPasswordRequirements(password);

  if (!reqs.minLength) {
    return { isValid: false, error: 'Password must be at least 8 characters long.' };
  }
  if (!reqs.hasUppercase) {
    return { isValid: false, error: 'Password must contain at least one uppercase letter (A-Z).' };
  }
  if (!reqs.hasLowercase) {
    return { isValid: false, error: 'Password must contain at least one lowercase letter (a-z).' };
  }
  if (!reqs.hasNumber) {
    return { isValid: false, error: 'Password must contain at least one number (0-9).' };
  }
  if (!reqs.hasSpecialChar) {
    return { isValid: false, error: 'Password must contain at least one special character (e.g. !@#$%^&*).' };
  }

  return { isValid: true };
}
