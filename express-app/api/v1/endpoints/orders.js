const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { Order } = require('../../../db');
const multer = require('multer');
const pdfParser = require('../../../services/pdfParser');
const path = require('path');
const fs = require('fs');
const authMiddleware = require('../../../middleware/authMiddleware');

const upload = multer({ dest: 'uploads/' });

const createOrderValidation = [
  body('first_name').notEmpty().withMessage('First name is required'),
  body('last_name').notEmpty().withMessage('Last name is required'),
  body('date_of_birth').notEmpty().isDate().withMessage('Valid date of birth is required'),
];

const updateOrderValidation = [
  body('first_name').optional().notEmpty().withMessage('First name must not be empty'),
  body('last_name').optional().notEmpty().withMessage('Last name must not be empty'),
  body('date_of_birth').optional().isDate().withMessage('Valid date of birth is required'),
];

router.use(authMiddleware);

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Retrieve a list of orders
 *     responses:
 *       200:
 *         description: A list of orders.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
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
 *     summary: Create a new order
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Order'
 *     responses:
 *       21:
 *         description: Created
 */
router.post('/', createOrderValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
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
  const useOpenai = req.query.use_openai === 'true';
  try {
    const extractedData = await pdfParser.extractPatientData(filePath, useOpenai);
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
router.put('/:order_id', updateOrderValidation, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
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
