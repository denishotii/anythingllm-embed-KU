// Common greeting patterns to detect
const GREETING_PATTERNS = [
  // English greetings
  /^hi\b/i,
  /^hello\b/i,
  /^hey\b/i,
  /^good\s+(morning|afternoon|evening)\b/i,
  /^gm\b/i,
  /^gn\b/i,
  /^goodbye\b/i,
  /^bye\b/i,
  /^see\s+you\b/i,
  /^cya\b/i,
  /^good\s+night\b/i,
  /^good\s+day\b/i,
  
  // German greetings
  /^hallo\b/i,
  /^guten\s+(morgen|tag|abend)\b/i,
  /^servus\b/i,
  /^moin\b/i,
  /^tschüss\b/i,
  /^auf\s+wiedersehen\b/i,
  /^bis\s+später\b/i,
  /^gute\s+(nacht|tag)\b/i,
  /^grüß\s+(dich|gott)\b/i,
  
  // Informal greetings
  /^yo\b/i,
  /^sup\b/i,
  /^what's\s+up\b/i,
  /^wassup\b/i,
  /^howdy\b/i,
  /^cheers\b/i,
  
  // Very short greetings
  /^h\b/i,
  /^he\b/i,
  
  // Emoji greetings
  /^👋\s*$/,
  /^🙋‍♂️\s*$/,
  /^🙋‍♀️\s*$/,
];

export function isGreeting(message) {
  const trimmedMessage = message.trim();
  return GREETING_PATTERNS.some(pattern => pattern.test(trimmedMessage));
}

export function isFarewell(message) {
  const trimmedMessage = message.trim().toLowerCase();
  const farewellPatterns = [
    /^goodbye\b/i,
    /^bye\b/i,
    /^see\s+you\b/i,
    /^cya\b/i,
    /^tschüss\b/i,
    /^auf\s+wiedersehen\b/i,
    /^bis\s+später\b/i,
  ];
  return farewellPatterns.some(pattern => pattern.test(trimmedMessage));
}

export function getGreetingResponse(language = 'en', labels = null) {
  if (labels && labels.greetingResponse) {
    return labels.greetingResponse;
  }
  
  // Fallback responses if labels are not available
  const fallbackResponses = {
    en: "Hello! 👋 I'm KUala-Bot, your friendly assistant for all things KU! How can I help you today?",
    de: "Hallo! 👋 Ich bin KUala-Bot, dein freundlicher Assistent für alles rund um die KU! Wie kann ich dir heute helfen?"
  };
  
  return fallbackResponses[language] || fallbackResponses.en;
}

export function getFarewellResponse(language = 'en', labels = null) {
  if (labels && labels.farewellResponses && labels.farewellResponses.length > 0) {
    // Return a random farewell message from the available options
    const randomIndex = Math.floor(Math.random() * labels.farewellResponses.length);
    return labels.farewellResponses[randomIndex];
  }
  
  // Fallback responses if labels are not available
  const fallbackResponses = {
    en: "Goodbye! 👋 Feel free to come back anytime if you have more questions about KU!",
    de: "Auf Wiedersehen! 👋 Komm gerne wieder, wenn du weitere Fragen zur KU hast!"
  };
  
  return fallbackResponses[language] || fallbackResponses.en;
}

export function getResponseForMessage(message, language = 'en', labels = null) {
  if (isFarewell(message)) {
    console.log(`Farewell detected: "${message}" - providing instant response`);
    return getFarewellResponse(language, labels);
  }
  if (isGreeting(message)) {
    console.log(`Greeting detected: "${message}" - providing instant response`);
    return getGreetingResponse(language, labels);
  }
  return null; // No predefined response, should be sent to AnythingLLM
} 