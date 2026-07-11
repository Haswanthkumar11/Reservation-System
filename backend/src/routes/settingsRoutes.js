const express = require('express');
const settingsController = require('../controllers/settingsController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

const router = express.Router();

// Any authenticated user can read settings/slots (needed for the booking UI).
router.get('/', authMiddleware, settingsController.get);
router.get('/slots', authMiddleware, settingsController.slots);

// Only admins can change opening hours / slot duration.
router.patch('/', authMiddleware, roleMiddleware('admin'), settingsController.update);

module.exports = router;
