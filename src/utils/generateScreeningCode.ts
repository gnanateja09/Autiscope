/**
 * Generates a unique 6-digit screening code
 * Format: XXXXXX (6 alphanumeric characters)
 */
export function generateScreeningCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

/**
 * Validates if a screening code has the correct format
 */
export function isValidScreeningCode(code: string): boolean {
  return /^[A-Z0-9]{6}$/.test(code);
}

/**
 * Formats a screening code for display
 */
export function formatScreeningCode(code: string): string {
  return code.toUpperCase();
}