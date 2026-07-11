const express = require('express');
const reservationController = require('../controllers/reservationController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

const router = express.Router();

router.post('/', authMiddleware, roleMiddleware('customer'), reservationController.create);
router.get('/preview', authMiddleware, roleMiddleware('customer'), reservationController.preview);
router.get('/my', authMiddleware, roleMiddleware('customer'), reservationController.myReservations);
router.delete('/:id', authMiddleware, roleMiddleware('customer'), reservationController.cancelOwn);

module.exports = router;
