
/**
 * Application configuration
 */
const config = {
  // Pronunciation API URL (override with your deployed backend URL)
  // Example: 'https://your-pronunciation-api.example.com'
  PRONUNCIATION_API_URL: import.meta.env.VITE_PRONUNCIATION_API_URL || 'https://your-pronunciation-api.example.com',
};

export default config;
