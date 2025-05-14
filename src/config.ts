
/**
 * Application configuration
 */
const config = {
  // Pronunciation API URL (override with your deployed backend URL)
  PRONUNCIATION_API_URL: import.meta.env.VITE_PRONUNCIATION_API_URL || 'https://mfa-backend-gwdb.onrender.com/aligned',
};

export default config;
