const { HumanMessage } = require('@langchain/core/messages');
const { JsonOutputParser } = require('@langchain/core/output_parsers');
const ocrService = require('./ocrService');
const llmService = require('./llmService');
const { z } = require('zod');

const patientDataSchema = z.object({
  first_name: z.string().describe("The patient's first name"),
  last_name: z.string().describe("The patient's last name"),
  date_of_birth: z.string().describe("The patient's date of birth in YYYY-MM-DD format"),
});

const extractPatientData = async (filePath, llmProvider) => {
  try {
    const text = await ocrService.extractTextFromPdf(filePath);
    const model = llmService.getProvider(llmProvider);

    const modelWithTool = model.withStructuredOutput(patientDataSchema, {
      name: 'patient_data_extractor',
    });
    
    const prompt = `Extract the patient data from the following text:

${text}`;
    const result = await modelWithTool.invoke(prompt);

    return result;

  } catch (error) {
    console.error('Failed to extract patient data:', error);
    return null;
  }
};

module.exports = {
  extractPatientData,
};
