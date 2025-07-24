const express = require('express');
const router = express.Router();
const { UserLog } = require('../../../db');
const authMiddleware = require('../../../middleware/authMiddleware');

router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: User Logs
 *   description: API for viewing user activity logs
 */

/**
 * @swagger
 * /user_logs:
 *   get:
 *     tags: [User Logs]
 *     summary: Retrieve a list of user logs
 *     responses:
 *       200:
 *         description: A list of user logs.
 */
router.get('/', async (req, res) => {
  try {
    const userLogs = await UserLog.findAll({
        order: [['id', 'DESC']],
        limit: 100
    });
    
    const formattedLogs = userLogs.map(log => ({
        ...log.toJSON(),
        duration: parseFloat(log.duration.toFixed(3)),
        timestamp: log.timestamp.toISOString(),
    }));

    res.status(200).json(formattedLogs);
  } catch (error) {
    console.error('Error fetching user logs:', error);
    res.status(500).json({ message: 'Error fetching user logs' });
  }
});

/**
 * @swagger
 * /user_logs/{user_log_id}:
 *   get:
 *     tags: [User Logs]
 *     summary: Retrieve a single user log by ID
 *     parameters:
 *       - in: path
 *         name: user_log_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A single user log.
 */
router.get('/:user_log_id', async (req, res) => {
    const userLogId = req.params.user_log_id;
    try {
        const userLog = await UserLog.findByPk(userLogId);
        if (userLog) {
            res.status(200).json(userLog);
        } else {
            res.status(404).json({ message: 'User log not found' });
        }
    } catch (error) {
        console.error('Error fetching user log:', error);
        res.status(500).json({ message: 'Error fetching user log' });
    }
});

/**
 * @swagger
 * /user_logs:
 *   post:
 *     tags: [User Logs]
 *     summary: Create a new user log
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserLog'
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/', async (req, res) => {
    try {
        const newUserLog = req.body;
        const userLog = await UserLog.create(newUserLog);
        res.status(201).json(userLog);
    } catch (error) {
        console.error('Error creating user log:', error);
        res.status(500).json({ message: 'Error creating user log' });
    }
});

/**
 * @swagger
 * /user_logs/{user_log_id}:
 *   put:
 *     tags: [User Logs]
 *     summary: Update a user log by ID
 *     parameters:
 *       - in: path
 *         name: user_log_id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserLog'
 *     responses:
 *       200:
 *         description: OK
 */
router.put('/:user_log_id', async (req, res) => {
    const userLogId = req.params.user_log_id;
    const updatedUserLog = req.body;
    try {
        const userLog = await UserLog.findByPk(userLogId);
        if (userLog) {
            await userLog.update(updatedUserLog);
            res.status(200).json(userLog);
        } else {
            res.status(404).json({ message: 'User log not found' });
        }
    } catch (error) {
        console.error('Error updating user log:', error);
        res.status(500).json({ message: 'Error updating user log' });
    }
});

/**
 * @swagger
 * /user_logs/{user_log_id}:
 *   delete:
 *     tags: [User Logs]
 *     summary: Delete a user log by ID
 *     parameters:
 *       - in: path
 *         name: user_log_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: OK
 */
router.delete('/:user_log_id', async (req, res) => {
    const userLogId = req.params.user_log_id;
    try {
        const userLog = await UserLog.findByPk(userLogId);
        if (userLog) {
            await userLog.destroy();
            res.status(200).json({ message: `User log with ID ${userLogId} deleted` });
        } else {
            res.status(404).json({ message: 'User log not found' });
        }
    } catch (error) {
        console.error('Error deleting user log:', error);
        res.status(500).json({ message: 'Error deleting user log' });
    }
});

module.exports = router;
