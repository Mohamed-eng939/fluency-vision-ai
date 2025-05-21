
/**
 * Generate a secure random password
 * @returns A secure password string
 */
export function generateSecurePassword(length = 12): string {
  const lowerChars = 'abcdefghijklmnopqrstuvwxyz';
  const upperChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const specialChars = '!@#$%^&*()-_=+[]{}|;:,.<>?';
  const allChars = lowerChars + upperChars + numbers + specialChars;
  
  // Ensure at least one of each type
  let password = 
    getRandomChar(lowerChars) +
    getRandomChar(upperChars) +
    getRandomChar(numbers) +
    getRandomChar(specialChars);
  
  // Fill the rest with random characters
  for (let i = 4; i < length; i++) {
    password += getRandomChar(allChars);
  }
  
  // Shuffle the password characters
  return password.split('').sort(() => 0.5 - Math.random()).join('');
}

/**
 * Get a random character from a string
 * @param chars String of characters to choose from
 * @returns A single character
 */
function getRandomChar(chars: string): string {
  return chars.charAt(Math.floor(Math.random() * chars.length));
}

/**
 * Check if a string is a valid email address
 * @param email Email string to validate
 * @returns Boolean indicating if email is valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Format a timestamp for display
 * @param timestamp ISO timestamp string
 * @returns Formatted date string
 */
export function formatTimestamp(timestamp: string | null | undefined): string {
  if (!timestamp) return 'N/A';
  
  return new Date(timestamp).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  });
}
