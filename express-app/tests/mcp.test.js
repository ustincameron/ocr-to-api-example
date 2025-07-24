// 1. Mock dependencies using Jest.
jest.mock('fs');
jest.mock('node-fetch');

// 2. Import modules needed for the test
const { Readable } = require('stream');
const fs = require('fs');
const { default: fetch } = require('node-fetch');

// 3. Import the functions to be tested *after* the mocks are defined
const { listOrders, createOrderFromPdf } = require('../mcp-tools');

describe('MCP Tools', () => {

  // 4. Reset mocks after each test to ensure test isolation
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('listOrders', () => {
    it('should list orders successfully', async () => {
      // Arrange
      const mockOrders = [
        { id: '1', first_name: 'John', last_name: 'Doe', date_of_birth: '1990-01-01' },
        { id: '2', first_name: 'Jane', last_name: 'Doe', date_of_birth: '1992-02-02' },
      ];
      fetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockOrders,
      });

      // Act
      const result = await listOrders();

      // Assert
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/v1/orders'), expect.any(Object));
      expect(result.content[0].text).toContain('Order ID: 1, Name: John Doe, DOB: 1990-01-01');
      expect(result.content[0].text).toContain('Order ID: 2, Name: Jane Doe, DOB: 1992-02-02');
    });

    it('should handle no orders found', async () => {
      // Arrange
      fetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => [],
      });

      // Act
      const result = await listOrders();

      // Assert
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/v1/orders'), expect.any(Object));
      expect(result.content[0].text).toBe('No orders found.');
    });

    it('should handle API errors gracefully', async () => {
      // Arrange
      fetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: async () => 'Error Body',
      });

      // Act
      const result = await listOrders();

      // Assert
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/v1/orders'), expect.any(Object));
      expect(result.content[0].text).toContain('Error fetching orders: 500 Internal Server Error - Error Body');
    });
  });

  describe('createOrderFromPdf', () => {
    it('should create an order from a PDF successfully', async () => {
      // Arrange
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

      // Act
      const result = await createOrderFromPdf({ filePath: '/fake/path/to/file.pdf' });

      // Assert
      expect(fs.existsSync).toHaveBeenCalledWith('/fake/path/to/file.pdf');
      expect(fs.createReadStream).toHaveBeenCalledWith('/fake/path/to/file.pdf');
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/v1/orders/upload'), expect.any(Object));
      expect(result.content[0].text).toBe('Order created successfully. Order ID: 1, Name: John Doe, DOB: 1990-01-01');
    });
    
    it('should return an error if the file does not exist', async () => {
      // Arrange
      fs.existsSync.mockReturnValue(false);

      // Act
      const result = await createOrderFromPdf({ filePath: '/non/existent/file.pdf' });

      // Assert
      expect(fs.existsSync).toHaveBeenCalledWith('/non/existent/file.pdf');
      expect(result.content[0].text).toBe('Error: File not found at path: /non/existent/file.pdf');
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should handle API errors during file upload', async () => {
      // Arrange
      fetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: async () => 'Upload Failed',
      });
      fs.existsSync.mockReturnValue(true);
      const mockStream = new Readable();
      mockStream.push('file content');
      mockStream.push(null);
      fs.createReadStream.mockReturnValue(mockStream);

      // Act
      const result = await createOrderFromPdf({ filePath: '/fake/path/to/file.pdf' });

      // Assert
      expect(fs.existsSync).toHaveBeenCalledWith('/fake/path/to/file.pdf');
      expect(fs.createReadStream).toHaveBeenCalledWith('/fake/path/to/file.pdf');
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/v1/orders/upload'), expect.any(Object));
      expect(result.content[0].text).toContain('Error creating order: 500 Internal Server Error - Upload Failed');
    });
  });
});