const ocrService = require('./ocrService');
const ollamaService = require('./ollamaService');
const openaiService = require('./openaiService');

const extractPatientData = async (filePath, useOpenai = false) => {
  try {
    const text = await ocrService.extractTextFromPdf(filePath);
    
    let llmResponseJson;
    if (useOpenai) {
      // Assuming openaiService.generateText returns a JSON string
      const rawResponse = await openaiService.generateText(text);
      llmResponseJson = rawResponse;
    } else {
      const rawResponse = await ollamaService.generateText(text);
      // The Ollama service implementation already provides a JSON string
      llmResponseJson = rawResponse;
    }
    
    // Parse the JSON string to get the structured data
    const patientData = JSON.parse(llmResponseJson);
    return patientData;

  } catch (error) {
    console.error('Failed to extract patient data:', error);
    return null;
  }
};

module.exports = {
  extractPatientData,
};
