// Note: fs is no longer globally mocked. We will use jest.spyOn for specific tests.
const { Readable } = require('stream');
const fs = require('fs');
const fetch = require('node-fetch');
const { listOrders, createOrderFromPdf } = require('../mcp-tools');

describe('MCP Tools', () => {

  afterEach(() => {
    // This is important to restore the original implementations of spies and clear mocks
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  describe('listOrders', () => {
    it('should list orders successfully', async () => {
      const mockOrders = [
        { id: '1', first_name: 'John', last_name: 'Doe', date_of_birth: '1990-01-01' },
        { id: '2', first_name: 'Jane', last_name: 'Doe', date_of_birth: '1992-02-02' },
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
  
        expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/v1/orders'), expect.any(Object));
        expect(result.content[0].text).toBe('No orders found.');
      });
  
      it('should handle API errors gracefully', async () => {
        fetch.mockResolvedValue({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
          text: async () => 'Error Body',
        });
  
        const result = await listOrders();
  
        expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/v1/orders'), expect.any(Object));
        expect(result.content[0].text).toContain('Error fetching orders: 500 Internal Server Error - Error Body');
      });
  });

  describe('createOrderFromPdf', () => {

    it('should create an order from a real PDF successfully', async () => {
      // This test now uses the real file system.
      const mockOrder = { id: '1', first_name: 'Marie', last_name: 'Curie', date_of_birth: '1900-12-05' };
      fetch.mockResolvedValue({
        ok: true,
        status: 201,
        json: async () => mockOrder,
      });

      // Use the actual test file.
      const filePath = 'tests/data/sample_valid.pdf';
      const result = await createOrderFromPdf({ filePath });

      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/v1/orders/upload'), expect.any(Object));
      // Assert against the data we expect from the successful API call.
      expect(result.content[0].text).toBe('Order created successfully. Order ID: 1, Name: Marie Curie, DOB: 1900-12-05');
    });
    
    it('should return an error if the file does not exist', async () => {
      // For this test, we *do* want to fake the fs.existsSync call.
      jest.spyOn(fs, 'existsSync').mockReturnValue(false);

      const result = await createOrderFromPdf({ filePath: '/non/existent/file.pdf' });

      expect(fs.existsSync).toHaveBeenCalledWith('/non/existent/file.pdf');
      expect(result.content[0].text).toBe('Error: File not found at path: /non/existent/file.pdf');
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should handle API errors during file upload', async () => {
      // We need the file to "exist" for this test, but we can fake it.
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      // We also need to fake the createReadStream to avoid a real file read.
      jest.spyOn(fs, 'createReadStream').mockReturnValue(new Readable());

      fetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: async () => 'Upload Failed',
      });
      
      const result = await createOrderFromPdf({ filePath: '/fake/path/to/file.pdf' });

      expect(fs.existsSync).toHaveBeenCalledWith('/fake/path/to/file.pdf');
      expect(fs.createReadStream).toHaveBeenCalledWith('/fake/path/to/file.pdf');
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/v1/orders/upload'), expect.any(Object));
      expect(result.content[0].text).toContain('Error creating order: 500 Internal Server Error - Upload Failed');
    });
  });
});
