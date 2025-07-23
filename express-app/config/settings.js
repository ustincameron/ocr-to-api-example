// Load environment variables from a .env file
require('dotenv').config();

const settings = {
  databaseUrl: process.env.DATABASE_URL || 'postgresql://user:password@host:port/database',
  port: process.env.PORT || 3000, // Default port
  openaiApiKey: process.env.OPENAI_API_KEY, // OpenAI API Key
  ollamaApiUrl: process.env.OLLAMA_API_URL || 'http://localhost:11434', // Ollama API URL
  // Add other settings here as needed
};

module.exports = settings;