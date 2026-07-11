const express = require('express');
const adminReservationController = require('../controllers/adminReservationController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

const router = express.Router();

router.use(authMiddleware, roleMiddleware('admin'));

router.get('/reservations', adminReservationController.listAll);
router.get('/reservations/date', adminReservationController.listByDate);
router.patch('/reservations/:id', adminReservationController.update);
router.delete('/reservations/:id', adminReservationController.cancel);

module.exports = router;
