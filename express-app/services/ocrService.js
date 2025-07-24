const { Poppler } = require("node-poppler");
const { recognize } = require("node-tesseract-ocr");
const path = require("path");
const fs = require("fs").promises;
const { execSync } = require("child_process");

/**
 * Finds the directory containing a system binary.
 * @param {string} name The name of the binary to find (e.g., 'pdftocairo').
 * @returns {string|null} The directory path or null if not found.
 */
function findBinaryDirectory(name) {
  try {
    const binaryPath = execSync(`which ${name}`, { encoding: 'utf8' }).trim();
    return path.dirname(binaryPath);
  } catch (e) {
    console.error(`Failed to find required system binary: ${name}. Please ensure it is installed and in your system's PATH.`);
    return null;
  }
}

/**
 * Extracts text from a PDF by first converting it to an image and then running OCR.
 * @param {string} pdfPath - The path to the PDF file.
 * @returns {Promise<string>} - The extracted text.
 */
async function extractTextFromPdf(pdfPath) {
  const popplerBinDir = findBinaryDirectory("pdftocairo");
  if (!popplerBinDir) {
    throw new Error("Poppler utilities not found. Cannot process PDF.");
  }
  
  const outputDir = path.dirname(pdfPath);
  const outputPrefix = path.join(outputDir, `ocr-image-${Date.now()}`);
  const imagePath = `${outputPrefix}-1.png`;

  try {
    const poppler = new Poppler(popplerBinDir);
    const options = {
      firstPageToConvert: 1,
      lastPageToConvert: 1,
      pngFile: true,
    };

    await poppler.pdfToCairo(pdfPath, outputPrefix, options);

    const text = await recognize(imagePath, {
      lang: "eng",
      oem: 1,
      psm: 3,
    });
    
    return text;

  } catch (error) {
    console.error(`Error during OCR process: ${error.message || error}`);
    throw error;
  } finally {
    // Clean up the temporary image file
    try {
      await fs.unlink(imagePath);
    } catch (e) {
      if (e.code !== 'ENOENT') {
        console.warn(`Could not delete temporary file: ${imagePath}`, e);
      }
    }
  }
}

module.exports = { extractTextFromPdf };