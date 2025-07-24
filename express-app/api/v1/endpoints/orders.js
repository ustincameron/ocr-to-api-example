const express = require('express');
const router = express.Router();
const { Order } = require('../../../db');
const multer = require('multer');
const pdfParser = require('../../../services/pdfParser');
const path = require('path');
const fs = require('fs');
const authMiddleware = require('../../../middleware/authMiddleware');
const validate = require('../../../middleware/validate');
const { orderSchema } = require('../../../schemas/order');

const upload = multer({ dest: 'uploads/' });

router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: API for managing orders
 */

/**
 * @swagger
 * /orders:
 *   get:
 *     tags: [Orders]
 *     summary: Retrieve a list of orders
 *     responses:
 *       200:
 *         description: A list of orders.
 */
router.get('/', async (req, res) => {
    try {
      const orders = await Order.findAll();
      res.status(200).json(orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ message: 'Error fetching orders' });
    }
});

/**
 * @swagger
 * /orders/{order_id}:
 *   get:
 *     tags: [Orders]
 *     summary: Retrieve a single order by ID
 *     parameters:
 *       - in: path
 *         name: order_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A single order.
 */
router.get('/:order_id', async (req, res) => {
    const orderId = req.params.order_id;
    try {
        const order = await Order.findByPk(orderId);
        if (order) {
            res.status(200).json(order);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ message: 'Error fetching order' });
    }
});

/**
 * @swagger
 * /orders:
 *   post:
 *     tags: [Orders]
 *     summary: Create a new order
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Order'
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/', validate(orderSchema), async (req, res) => {
    try {
        const newOrder = req.body;
        const order = await Order.create(newOrder);
        res.status(201).json(order);
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ message: 'Error creating order' });
    }
});

/**
 * @swagger
 * /orders/upload:
 *   post:
 *     tags: [Orders]
 *     summary: Upload a PDF to create an order
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  const filePath = req.file.path;
  const llmProvider = req.query.provider || 'ollama';
  try {
    const extractedData = await pdfParser.extractPatientData(filePath, llmProvider);
    if (!extractedData) {
      return res.status(400).json({ message: 'Failed to extract patient data from document' });
    }
    const order = await Order.create({
      first_name: extractedData.first_name,
      last_name: extractedData.last_name,
      date_of_birth: extractedData.date_of_birth,
      document_path: filePath,
    });
    res.status(201).json(order);
  } catch (error) {
    console.error('Error processing uploaded file:', error);
    res.status(500).json({ message: 'Error processing file' });
  } finally {
    fs.unlink(filePath, (err) => {
      if (err) console.error('Error deleting uploaded file:', err);
    });
  }
});

/**
 * @swagger
 * /orders/{order_id}:
 *   put:
 *     tags: [Orders]
 *     summary: Update an order by ID
 *     parameters:
 *       - in: path
 *         name: order_id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Order'
 *     responses:
 *       200:
 *         description: OK
 */
router.put('/:order_id', validate(orderSchema), async (req, res) => {
    const orderId = req.params.order_id;
    const updatedOrder = req.body;
    try {
        const order = await Order.findByPk(orderId);
        if (order) {
            await order.update(updatedOrder);
            res.status(200).json(order);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        console.error('Error updating order:', error);
        res.status(500).json({ message: 'Error updating order' });
    }
});

/**
 * @swagger
 * /orders/{order_id}:
 *   delete:
 *     tags: [Orders]
 *     summary: Delete an order by ID
 *     parameters:
 *       - in: path
 *         name: order_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: No Content
 */
router.delete('/:order_id', async (req, res) => {
    const orderId = req.params.order_id;
    try {
        const order = await Order.findByPk(orderId);
        if (order) {
            await order.destroy();
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        console.error('Error deleting order:', error);
        res.status(500).json({ message: 'Error deleting order' });
    }
});

module.exports = router;
