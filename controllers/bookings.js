const Booking = require('../models/Bookings');
const Car = require('../models/Car');

//@desc Get all bookings
//@route GET /api/v1/bookings
//@access Public
exports.getBookings = async(req,res,next)=>{
    let query;
    
    // General user can see only their bookings!
    if(req.user.role !== 'admin'){
        query = Booking.find({user: req.user.id}).populate({
            path: 'car',
            select: 'Brand Model Year Color FeePerDay LicensePlate'
        });
    } else { // Admin can see all Bookings
        
        if(req.params.carId){
            console.log(req.params.carId);
            query = Booking.find({car: req.params.carId}).populate({
                path: 'car',
                select: 'Brand Model Year Color FeePerDay LicensePlate'
            });
        } else {
            query = Booking.find().populate({
                path: 'car',
                select: 'Brand Model Year Color FeePerDay LicensePlate'
            });
        }
    }
    try {
        const bookings = await query;
        res.status(200).json({
            success:true, 
            count:bookings.length, 
            data:bookings
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({success:false, message : "Can not find Booking"})
    }
};

//@desc Get single booking
//@route GET /api/v1/bookings/:id
//@access Public
exports.getBooking = async(req,res,next)=>{
    try {
        const booking = await Booking.findById(req.params.id).populate({
            path: 'car',
            select: 'Brand Model Year Color FeePerDay LicensePlate'
        });
        if(!booking){
            return res.status(404).json({success:false, message : `No booking with the id of ${req.params.id}`})
        }
        res.status(200).json({
            success:true, 
            data:booking
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({success:false, message : "Cannot find a booking"})
    }
};

//@desc     Add booking
//@route    POST /api/v1/cars/:carId/bookings
//@access   Private
exports.addBooking = async (req, res, next) => {
    try {
        req.body.car = req.params.carId;

        const car = await Car.findById(req.params.carId);

        if (!car) {
            return res.status(404).json({
                success: false,
                message: `No car with the id of ${req.params.carId}`
            });
        }

        //add user Id to req.body
        req.body.user = req.user.id;
        
        //Check for existed booking
        const existedBookings = await Booking.find({user: req.user.id});
        
        //If the user is not an admin, they can only create 3 bookings
        if (existedBookings.length >= 3 && req.user.role !== 'admin') {
            return res.status(404).json({
                success: false,
                message: `The user with ID ${req.user.id} has already made 3 bookings`
            });
        }

        const booking = await Booking.create(req.body);

        res.status(200).json({
            success: true,
            data: booking
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Cannot create Booking"
        });
    }
}

//@desc     Update booking
//@route    PUT /api/v1/bookings/:id
//@access   Private
exports.updateBooking = async (req, res, next) => {
    try {
        let booking = await Booking.findById(req.params.id);

        //Make sure user is the booking owner
        if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({
                success: false,
                message: `User ${req.user.id} is not authorized to update this booking`
            });
        }

        booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: booking
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Cannot update Booking"
        });
    }
};

//@desc     Delete booking
//@route    DELETE /api/v1/bookings/:id
//@access   Private
exports.deleteBooking = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id);

        //Make sure user is the booking owner
        if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({
                success: false,
                message: `User ${req.user.id} is not authorized to delete this booking`
            });
        }

        await booking.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Cannot delete booking"
        });
    }
}