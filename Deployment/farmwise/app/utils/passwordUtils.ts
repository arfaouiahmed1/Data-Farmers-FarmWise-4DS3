export type PasswordStrength = 'weak' | 'medium' | 'strong' | 'very-strong';

export interface PasswordValidationResult {
  isValid: boolean;
  strength: PasswordStrength;
  score: number; // 0-100
  feedback: string[];
  color: string;
}

/**
 * Password validation rules:
 * - Minimum 8 characters
 * - At least one lowercase letter
 * - At least one uppercase letter
 * - At least one number
 * - At least one special character for strong passwords
 */
export function validatePassword(password: string): PasswordValidationResult {
  const feedback: string[] = [];
  let score = 0;
  
  // Basic length check
  if (!password || password.length < 8) {
    feedback.push('Password must be at least 8 characters');
    return {
      isValid: false,
      strength: 'weak',
      score: 0,
      feedback,
      color: 'red'
    };
  }
  
  // Check for lowercase letters
  const hasLowercase = /[a-z]/.test(password);
  if (!hasLowercase) {
    feedback.push('Include at least one lowercase letter');
  } else {
    score += 20;
  }
  
  // Check for uppercase letters
  const hasUppercase = /[A-Z]/.test(password);
  if (!hasUppercase) {
    feedback.push('Include at least one uppercase letter');
  } else {
    score += 20;
  }
  
  // Check for numbers
  const hasNumber = /\d/.test(password);
  if (!hasNumber) {
    feedback.push('Include at least one number');
  } else {
    score += 20;
  }
  
  // Check for special characters
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  if (!hasSpecial) {
    feedback.push('Include at least one special character for a stronger password');
  } else {
    score += 20;
  }
  
  // Check for password length bonus
  if (password.length >= 12) {
    score += 20;
  } else if (password.length >= 10) {
    score += 10;
  }
  
  // Cap the score at 100
  score = Math.min(score, 100);
  
  // Determine strength based on score
  let strength: PasswordStrength;
  let color: string;
  
  if (score < 40) {
    strength = 'weak';
    color = 'red';
  } else if (score < 70) {
    strength = 'medium';
    color = 'orange';
  } else if (score < 90) {
    strength = 'strong';
    color = 'green';
  } else {
    strength = 'very-strong';
    color = 'teal';
  }
  
  // Determine if password is valid (at least medium strength)
  const isValid = score >= 60;
  
  return {
    isValid,
    strength,
    score,
    feedback,
    color
  };
} 