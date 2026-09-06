export const MAX_PROMPT_LENGTH = 500; // characters

export function sanitizePrompt(prompt) {
  if (typeof prompt !== 'string') {
    return '';
  }
  
  // Strip null bytes and non-printable characters that might crash C++ bridge
  let sanitized = prompt.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  // Truncate to maximum length to prevent buffer overflows or extreme RAM usage
  if (sanitized.length > MAX_PROMPT_LENGTH) {
    sanitized = sanitized.substring(0, MAX_PROMPT_LENGTH);
  }
  
  return sanitized.trim();
}
