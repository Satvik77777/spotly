/**
 * Safely escapes special regular expression characters in a user-supplied string.
 * Prevents ReDoS and regex syntax errors when executing case-insensitive substring searches.
 */
export function escapeRegex(text: string): string {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}
