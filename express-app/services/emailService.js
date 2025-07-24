const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");
const settings = require("../config/settings");
const { generateEmailTemplate } = require("../templates/emailTemplate");

// Initialize the SES client
const sesClient = new SESClient({
  region: settings.aws.region,
  credentials: {
    accessKeyId: settings.aws.accessKeyId,
    secretAccessKey: settings.aws.secretAccessKey,
  },
});

/**
 * Sends a multipart (HTML and plain text) email using AWS SES.
 * @param {string} toAddress - The recipient's email address.
 * @param {string} subject - The subject of the email.
 * @param {Object} templateData - The data for the email template.
 * @returns {Promise<void>}
 */
async function sendEmail(toAddress, subject, templateData) {
  if (!settings.email.fromAddress || !toAddress) {
    console.warn("Email 'from' or 'to' address is not configured. Skipping email send.");
    return;
  }
  
  // Generate both HTML and plain-text versions of the email
  const { html, text } = generateEmailTemplate(templateData);

  const params = {
    Source: settings.email.fromAddress,
    Destination: {
      ToAddresses: [toAddress],
    },
    Message: {
      Subject: {
        Data: subject,
        Charset: 'UTF-8',
      },
      Body: {
        Html: {
          Data: html,
          Charset: 'UTF-8',
        },
        Text: {
          Data: text,
          Charset: 'UTF-8',
        }
      },
    },
  };

  try {
    const command = new SendEmailCommand(params);
    const data = await sesClient.send(command);
    console.log(`Email sent successfully to ${toAddress}. Message ID: ${data.MessageId}`);
  } catch (error) {
    console.error("Error sending email via SES:", error);
    // In a production app, you might add more robust error handling here,
    // like sending the failed email to a dead-letter queue.
    throw new Error("Failed to send email.");
  }
}

module.exports = { sendEmail };
