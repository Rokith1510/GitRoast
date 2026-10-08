/**
 * Validator utility for GitHub usernames and user input sanitization.
 */

// GitHub username rules:
// - Max 39 characters
// - Alphanumeric characters or single hyphens
// - Cannot begin or end with a hyphen
// - Cannot contain consecutive hyphens
const GITHUB_USERNAME_REGEX = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;

/**
 * Validates a GitHub username.
 * @param {string} username
 * @returns {{ isValid: boolean, error?: string, sanitizedUsername?: string }}
 */
function validateGitHubUsername(username) {
  if (!username || typeof username !== 'string') {
    return {
      isValid: false,
      error: 'Please enter a GitHub username.'
    };
  }

  const trimmed = username.trim();

  if (trimmed.length === 0) {
    return {
      isValid: false,
      error: 'GitHub username cannot be blank.'
    };
  }

  if (trimmed.length > 39) {
    return {
      isValid: false,
      error: 'GitHub username cannot exceed 39 characters.'
    };
  }

  // Remove leading @ if user pasted @username
  const cleaned = trimmed.startsWith('@') ? trimmed.slice(1) : trimmed;

  if (!GITHUB_USERNAME_REGEX.test(cleaned)) {
    return {
      isValid: false,
      error: 'Invalid GitHub username format. Usernames can only contain letters, numbers, and single hyphens, and cannot start or end with a hyphen.'
    };
  }

  return {
    isValid: true,
    sanitizedUsername: cleaned
  };
}

/**
 * Sanitizes a string for safe display to prevent XSS.
 * @param {string} str
 * @returns {string}
 */
function sanitizeString(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

module.exports = {
  validateGitHubUsername,
  sanitizeString,
  GITHUB_USERNAME_REGEX
};

