/**
 * Simple chatbot tracking utility for Matomo
 * Adds UTM parameters to all chatbot-generated links
 */

// UTM parameters to add to all chatbot links
const UTM_PARAMS = {
  utm_source: 'chatbot',
  utm_medium: 'llm',
  utm_campaign: 'chat_click'
};

/**
 * Add UTM parameters to a URL for chatbot tracking
 * @param {string} url - The original URL
 * @returns {string} - URL with UTM parameters
 */
export const addChatbotTracking = (url) => {
  try {
    // Handle relative URLs by adding origin
    const baseUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;
    
    // Create URL object
    const urlObj = new URL(baseUrl);
    
    // Add UTM parameters (this will override existing ones)
    Object.entries(UTM_PARAMS).forEach(([key, value]) => {
      urlObj.searchParams.set(key, value);
    });
    
    // Return the final URL
    return urlObj.toString();
  } catch (error) {
    // Fallback for invalid URLs - manually append parameters
    const separator = url.includes('?') ? '&' : '?';
    const utmString = Object.entries(UTM_PARAMS)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');
    
    return `${url}${separator}${utmString}`;
  }
};

/**
 * Process markdown text and add tracking to all links
 * @param {string} text - Markdown text containing links
 * @returns {string} - Processed markdown with tracked URLs
 */
export const processMarkdownLinks = (text) => {
  // Regex to find markdown links: [text](url)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  
  return text.replace(linkRegex, (match, linkText, url) => {
    const trackedUrl = addChatbotTracking(url);
    return `[${linkText}](${trackedUrl})`;
  });
}; 