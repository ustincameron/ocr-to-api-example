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

router.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const filePath = req.file.path;
  const llmProvider = req.query.provider || 'ollama'; // Default to ollama

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

// ... (rest of the endpoints)
router.get('/', async (req, res) => {
    try {
      const orders = await Order.findAll();
      res.status(200).json(orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ message: 'Error fetching orders' });
    }
});

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
