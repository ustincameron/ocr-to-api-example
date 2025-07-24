// express-app/config/index.js
require('dotenv').config();
const { z } = require('zod');
const logger = require('./logger');

const configSchema = z.object({
  databaseUrl: z.string().url(),
  port: z.coerce.number().default(3000),
  openaiApiKey: z.string().optional(),
  geminiApiKey: z.string().optional(),
  ollamaApiUrl: z.string().url().default('http://localhost:11434'),
  aws: z.object({
    region: z.string().optional(),
    accessKeyId: z.string().optional(),
    secretAccessKey: z.string().optional(),
  }),
  email: z.object({
    fromAddress: z.string().email().optional(),
  }),
  api: z.object({
    baseUrl: z.string().url().default('http://localhost'),
    port: z.coerce.number().default(3000),
  })
});

try {
  const config = configSchema.parse({
    databaseUrl: process.env.DATABASE_URL,
    port: process.env.PORT,
    openaiApiKey: process.env.OPENAI_API_KEY,
    geminiApiKey: process.env.GEMINI_API_KEY,
    ollamaApiUrl: process.env.OLLAMA_API_URL,
    aws: {
      region: process.env.AWS_REGION,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    email: {
      fromAddress: process.env.EMAIL_FROM_ADDRESS,
    },
    api: {
        baseUrl: process.env.API_BASE_URL,
        port: process.env.PORT
    }
  });

  module.exports = { ...config,  logging: (msg) => logger.debug(msg) };
} catch (error) {
  logger.error('Configuration validation failed:', error.errors);
  process.exit(1);
}
