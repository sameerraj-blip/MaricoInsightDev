/**
 * Utility functions for formatting session data for display
 */

/**
 * Formats a timestamp into a human-readable date string
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Formatted date string (e.g., "15 January 2024")
 */
export const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  const day = date.getDate();
  const month = date.toLocaleDateString('en-US', { month: 'long' });
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};

/**
 * Truncates a file name if it exceeds the maximum length
 * @param fileName - The file name to format
 * @param maxLength - Maximum length before truncation (default: 50)
 * @returns Truncated file name with ellipsis if needed
 */
export const formatFileName = (fileName: string, maxLength: number = 50): string => {
  if (fileName.length > maxLength) {
    return fileName.substring(0, maxLength - 3) + '...';
  }
  return fileName;
};

