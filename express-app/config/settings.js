// Load environment variables from a .env file
require('dotenv').config();

const settings = {
  databaseUrl: process.env.DATABASE_URL || 'postgresql://user:password@host:port/database',
  port: process.env.PORT || 3000, // Default port
  openaiApiKey: process.env.OPENAI_API_KEY, // OpenAI API Key
  geminiApiKey: process.env.GEMINI_API_KEY,   // Gemini API Key
  ollamaApiUrl: process.env.OLLAMA_API_URL || 'http://localhost:11434', // Ollama API URL
  
  // AWS SES Configuration
  aws: {
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  
  // Email Configuration
  email: {
    fromAddress: process.env.EMAIL_FROM_ADDRESS,
    // Add other email settings like a 'reply-to' address if needed
  },
};

module.exports = settings;
