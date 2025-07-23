const { spawn } = require('child_process');

const ollamaService = {
  generateText: (text) => {
    return new Promise((resolve, reject) => {
      // This detailed prompt is based on the Python service's prompt.
      const prompt = `
You are an extraction-only engine.

Return a single-line JSON with the following fields:
- first_name
- last_name
- date_of_birth (in YYYY-MM-DD format)

Example:
{"first_name":"John","last_name":"Doe","date_of_birth":"1904-05-12"}

Only return the JSON. Do not explain. Do not greet. Do not say anything else.

Text:
---
${text}
---
`;

      const ollamaProcess = spawn('ollama', ['run', 'phi']);
      let stdoutData = '';
      let stderrData = '';

      ollamaProcess.stdout.on('data', (data) => {
        stdoutData += data.toString();
      });

      ollamaProcess.stderr.on('data', (data) => {
        stderrData += data.toString();
      });

      ollamaProcess.on('close', (code) => {
        if (code !== 0) {
          console.error(`Ollama process exited with code ${code}`);
          console.error(`stderr: ${stderrData}`);
          return reject(new Error(`Ollama process exited with code ${code}: ${stderrData}`));
        }
        if (stderrData) {
            console.warn(`Ollama process stderr: ${stderrData}`);
        }
        resolve(stdoutData.trim());
      });

      ollamaProcess.on('error', (err) => {
        console.error('Failed to start Ollama process.', err);
        reject(err);
      });

      // Write the prompt to the process's stdin
      ollamaProcess.stdin.write(prompt);
      ollamaProcess.stdin.end();
    });
  },
};

module.exports = ollamaService;
