const { HumanMessage } = require('langchain/schema');
const ocrService = require('./ocrService');
const llmService =require('./llmService');
const { z } = require('zod');

// 1. Define the schema for our "tool" using Zod. This is our structured output.
const patientDataSchema = z.object({
  first_name: z.string().describe("The patient's first name"),
  last_name: z.string().describe("The patient's last name"),
  date_of_birth: z.string().describe("The patient's date of birth in YYYY-MM-DD format"),
});

const extractPatientData = async (filePath, llmProvider) => {
  try {
    const text = await ocrService.extractTextFromPdf(filePath);
    const model = llmService.getProvider(llmProvider);

    // 2. Bind the tool to the model and force it to be called.
    // This is the implementation of the "ANY" mode from your documentation.
    const modelWithTool = model.withstructuredOutput(patientDataSchema, {
      name: 'patient_data_extractor',
    });
    
    // 3. Invoke the chain. The prompt is now much simpler.
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
