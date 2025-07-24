const { ChatOpenAI } = require('@langchain/openai');
const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');
const { ChatOllama } = require('@langchain/community/chat_models/ollama');
const settings = require('../config');

const llmService = {
  getProvider: (provider) => {
    switch (provider) {
      case 'openai':
        return new ChatOpenAI({
          apiKey: settings.openaiApiKey,
          modelName: 'gpt-4o-mini',
        });
      case 'gemini':
        return new ChatGoogleGenerativeAI({
          apiKey: settings.geminiApiKey,
          modelName: 'gemini-1.5-flash-latest',
        });
      case 'ollama':
      default:
        return new ChatOllama({
          baseUrl: settings.ollamaApiUrl,
          model: 'phi',
        });
    }
  },
};

module.exports = llmService;
