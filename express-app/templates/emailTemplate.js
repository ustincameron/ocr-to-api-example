/**
 * @fileoverview A scalable HTML and plain-text email template generator.
 * This module generates both HTML and plain-text versions of an email for
 * maximum compatibility and deliverability.
 */

/**
 * Generates HTML and plain-text email bodies.
 * @param {string} title - The main title or heading of the email.
 * @param {string} preheader - A short summary text for the email client.
 * @param {string} message - The main introductory message.
 * @param {Object} data - A key-value object containing the data to display.
 * @returns {{html: string, text: string}} An object containing both email formats.
 */
function generateEmailTemplate({ title, preheader, message, data }) {
  const formattedData = Object.entries(data).map(([key, value]) => {
    const formattedKey = key.replace(/_/g, ' ').replace(/\w/g, l => l.toUpperCase());
    return { key: formattedKey, value };
  });

  // --- Generate HTML Body ---
  const htmlRows = formattedData
    .map(({ key, value }) => `
      <tr>
        <th style="text-align: left; padding: 8px; border-bottom: 1px solid #ddd; background-color: #f9f9f9;">${key}</th>
        <td style="text-align: left; padding: 8px; border-bottom: 1px solid #ddd;">${value}</td>
      </tr>
    `)
    .join('');

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; }
        .header { text-align: center; padding-bottom: 20px; }
        .footer { text-align: center; font-size: 0.8em; color: #888; padding-top: 20px; }
        .preheader { display: none; max-height: 0; max-width: 0; opacity: 0; overflow: hidden; mso-hide: all; visibility: hidden; }
        table { width: 100%; border-collapse: collapse; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="preheader">${preheader}</div>
        <div class="header">
          <h1>${title}</h1>
        </div>
        <p>${message}</p>
        <table>
          <tbody>
            ${htmlRows}
          </tbody>
        </table>
        <div class="footer">
          <p>This is an automated message. Please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  // --- Generate Plain Text Body ---
  const textRows = formattedData
    .map(({ key, value }) => `${key}: ${value}`)
    .join(`
`);
  
  const text = `
${title}

${message}

---
${textRows}
---

This is an automated message. Please do not reply.
  `;

  return { html, text: text.trim() };
}

module.exports = { generateEmailTemplate };
