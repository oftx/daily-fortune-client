// src/utils/timeUtils.js

/**
 * Formats a date string or Date object into a relative time string.
 * e.g., "5 minutes ago", "2 hours ago".
 * @param {string|Date} date The date to format.
 * @param {function} t The i18next t function for translations.
 * @returns {string} The formatted relative time string.
 */
export const formatRelativeTime = (date, t) => {
  if (!date) return '';
  
  const now = new Date();
  const past = new Date(date);
  const seconds = Math.floor((now - past) / 1000);

  if (seconds < 60) {
    return t('time.justNow');
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return t('time.minutesAgo', { count: minutes });
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return t('time.hoursAgo', { count: hours });
  }
  
  const days = Math.floor(hours / 24);
  if (days < 30) {
    return t('time.daysAgo', { count: days });
  }

  const months = Math.floor(days / 30);
  if (months < 12) {
      return t('time.monthsAgo', { count: months });
  }

  const years = Math.floor(days / 365);
  return t('time.yearsAgo', { count: years });
};