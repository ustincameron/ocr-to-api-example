jest.mock('fs');

const { Readable } = require('stream');
const fs = require('fs');
const fetch = require('node-fetch');
const { listOrders, createOrderFromPdf } = require('../mcp-tools');

describe('MCP Tools', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createOrderFromPdf', () => {
    it('should create an order from a PDF successfully', async () => {
      const mockOrder = { id: '1', first_name: 'John', last_name: 'Doe', date_of_birth: '1990-01-01' };
      fetch.mockResolvedValue({
        ok: true,
        status: 201,
        json: async () => mockOrder,
      });
      fs.existsSync.mockReturnValue(true);
      const mockStream = new Readable();
      mockStream.push('file content');
      mockStream.push(null);
      fs.createReadStream.mockReturnValue(mockStream);
      const result = await createOrderFromPdf({ filePath: '/fake/path/to/file.pdf' });
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/v1/orders/upload'), expect.any(Object));
      expect(result.content[0].text).toBe('Order created successfully. Order ID: 1, Name: John Doe, DOB: 1990-01-01');
    });

    it('should return an error if the file does not exist', async () => {
        fs.existsSync.mockReturnValue(false);
        const result = await createOrderFromPdf({ filePath: '/non/existent/file.pdf' });
        expect(result.content[0].text).toBe('Error: File not found at path: /non/existent/file.pdf');
        expect(fetch).not.toHaveBeenCalled();
      });
  });

  describe('listOrders', () => {
    it('should list orders successfully', async () => {
      const mockOrders = [
        { id: '1', first_name: 'John', last_name: 'Doe', date_of_birth: '1990-01-01' },
      ];
      fetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockOrders,
      });
      const result = await listOrders();
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/v1/orders'), expect.any(Object));
      expect(result.content[0].text).toContain('Order ID: 1, Name: John Doe, DOB: 1990-01-01');
    });

    it('should handle no orders found', async () => {
        fetch.mockResolvedValue({
          ok: true,
          status: 200,
          json: async () => [],
        });
        const result = await listOrders();
        expect(result.content[0].text).toBe('No orders found.');
      });
  });
});
