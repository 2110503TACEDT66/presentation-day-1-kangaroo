const Booking = require('../models/Booking');
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