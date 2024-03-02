const express = require('express');
const { getCars, getCar, createCar, updateCar, deleteCar, getCarRentals } = require('../controllers/bookings');

//Include other resource routers
const bookingRouter = require('./bookings');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

//Re-route into other resource routers
router.use('/:carId/bookings/', bookingRouter);

router.route('/carRental').get(getCarRentals);
router.route('/').get(getCars).post(protect, authorize('admin'), createCar);
router.route('/:id').get(getCar).put(protect, authorize('admin'), updateCar).delete(protect, authorize('admin'), deleteCar);

module.exports = router;
