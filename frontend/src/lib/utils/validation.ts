/**
 * Client-side validation utilities
 */

/**
 * Validates an email string
 * @param email - email to validate
 * @returns error message or null if valid
 */
export function validateEmail(email: string): string | null {
  if (!email?.trim()) return 'Email is required';

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return 'Invalid email format';

  return null;
}

/**
 * Validates a password string
 * @param password - password to validate
 * @returns error message or null if valid
 */
export function validatePassword(password: string): string | null {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  return null;
}

/**
 * Validates a todo title
 * @param title - title to validate
 * @returns error message or null if valid
 */
export function validateTitle(title: string): string | null {
  if (!title?.trim()) return 'Title is required';
  if (title.trim().length > 200) return 'Title too long (max 200 characters)';
  return null;
}

/**
 * Validates a todo description
 * @param description - description to validate
 * @returns error message or null if valid
 */
export function validateDescription(description: string): string | null {
  if (description?.length > 1000) return 'Description too long (max 1000 characters)';
  return null;
}

/**
 * Validates a first name
 * @param firstName - first name to validate
 * @returns error message or null if valid
 */
export function validateFirstName(firstName: string): string | null {
  if (!firstName?.trim()) return 'First name is required';
  if (firstName.trim().length < 2) return 'First name must be at least 2 characters';
  if (firstName.trim().length > 50) return 'First name too long (max 50 characters)';
  if (!/^[a-zA-Z\s'-]+$/.test(firstName.trim())) {
    return 'First name can only contain letters, spaces, hyphens, and apostrophes';
  }
  return null;
}

/**
 * Validates a last name
 * @param lastName - last name to validate
 * @returns error message or null if valid
 */
export function validateLastName(lastName: string): string | null {
  if (!lastName?.trim()) return 'Last name is required';
  if (lastName.trim().length < 2) return 'Last name must be at least 2 characters';
  if (lastName.trim().length > 50) return 'Last name too long (max 50 characters)';
  if (!/^[a-zA-Z\s'-]+$/.test(lastName.trim())) {
    return 'Last name can only contain letters, spaces, hyphens, and apostrophes';
  }
  return null;
}

/**
 * Validates password confirmation
 * @param password - original password
 * @param confirmPassword - confirmation password
 * @returns error message or null if valid
 */
export function validateConfirmPassword(password: string, confirmPassword: string): string | null {
  if (!confirmPassword) return 'Please confirm your password';
  if (password !== confirmPassword) return 'Passwords do not match';
  return null;
}
