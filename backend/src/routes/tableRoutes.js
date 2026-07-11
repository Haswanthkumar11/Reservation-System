const express = require('express');
const tableController = require('../controllers/tableController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

const router = express.Router();

// Any authenticated user can view tables (needed for booking UI)
router.get('/', authMiddleware, tableController.list);

// Only admins manage tables
router.post('/', authMiddleware, roleMiddleware('admin'), tableController.create);
router.patch('/:id', authMiddleware, roleMiddleware('admin'), tableController.update);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), tableController.remove);

module.exports = router;
