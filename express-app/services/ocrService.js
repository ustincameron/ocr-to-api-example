// express-app/services/ocrService.js
const Tesseract = require('tesseract.js');
const fs = require('fs');

async function extractTextFromPdf(pdfPath) {
  try {
    const { default: pdfToImg } = await import('pdf-to-img');
    const images = await pdfToImg(pdfPath, { dpi: 300 });
    let fullText = '';
    for (const img of images) {
      const { data: { text } } = await Tesseract.recognize(img, 'eng'); // Assuming English language
      fullText += `${text}
`;
    }
    return fullText;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw error;
  }
}

module.exports = {
  extractTextFromPdf,
};
