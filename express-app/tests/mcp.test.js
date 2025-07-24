const path = require('path');
// Load environment variables for the test suite before any other code.
require('dotenv').config({ path: path.resolve(__dirname, '../../.env.test') });

const { spawn } = require('child_process');
const http = require('http');
const app = require(path.resolve(__dirname, '../app.js'));

// A helper function to manage stdio communication with the MCP server
function sendMcpRequest(mcpProcess, request) {
  return new Promise((resolve, reject) => {
    let responseData = '';
    const timeout = setTimeout(() => {
      reject(new Error(`MCP request timed out. Partial response: ${responseData}`));
    }, 20000);

    mcpProcess.stdout.on('data', (data) => {
      responseData += data.toString();
      const jsonStartIndex = responseData.indexOf('{');
      if (jsonStartIndex !== -1 && responseData.includes(`"id":"${request.id}"`)) {
        clearTimeout(timeout);
        try {
          const jsonResponse = responseData.substring(jsonStartIndex);
          const response = JSON.parse(jsonResponse);
          resolve(response);
        } catch (e) {
          reject(new Error(`Failed to parse MCP JSON response: ${responseData}`));
        }
      }
    });

    mcpProcess.stderr.on('data', (data) => {
      clearTimeout(timeout);
      reject(new Error(`MCP process emitted an error: ${data}`));
    });

    const requestString = JSON.stringify(request) + String.fromCharCode(10);
    mcpProcess.stdin.write(requestString);
  });
}

describe('MCP Server', () => {
  let apiServer;
  const serverPort = 3012; // Use a unique port for this test suite

  beforeAll(async () => {
    await new Promise(resolve => {
      apiServer = http.createServer(app);
      apiServer.listen(serverPort, () => {
        process.env.API_PORT = serverPort;
        resolve();
      });
    });
  });

  afterAll(async () => {
    await new Promise(resolve => apiServer.close(resolve));
  });

  test('should process a PDF and return extracted patient data', async () => {
    const mcpProcess = spawn('node', ['mcp-server.js'], {
      cwd: path.resolve(__dirname, '..'),
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    const request = {
      jsonrpc: '2.0',
      method: 'tool_code',
      params: {
        tool_name: 'createOrderFromPdf',
        parameters: {
          llm_provider: 'ollama',
          file_path: 'tests/data/sample_valid.pdf',
        },
      },
      id: 'mcp-final-test-v7',
    };

    try {
      const response = await sendMcpRequest(mcpProcess, request);
      
      expect(response.jsonrpc).toBe('2.0');
      expect(response.id).toBe('mcp-final-test-v7');
      expect(response.result).toBeDefined();
      expect(response.result.content[0].type).toBe('text');
      
      const responseText = response.result.content[0].text;
      
      expect(responseText).toContain('Order created successfully');
      expect(responseText).toContain('Marie');
      expect(responseText).toContain('Curie');
      expect(responseText).toContain('1900-12-05');

    } finally {
      mcpProcess.kill();
    }
  }, 30000);
});
