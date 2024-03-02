const mongoose = require('mongoose');

const CarSchema = new mongoose.Schema({
    Brand: {
        type: String,
        required: [true, 'Please specify a brand name'],
        unique: true,
        trim: true,
        maxlength: [50, 'Name can not be more than 50 characters']
    },
    Model: {
        type: String,
        required: [true, 'Please specify a car model'],
        unique: true,
        trim: true,
        maxlength: [50, 'Name can not be more than 50 characters']
    },
    Year: {
        type: String,
        required: [true, 'Please specify a year']
    },
    Color: {
        type: String,
        required: [true, 'Please specify a color']
    },
    FeePerDay: {
        type: String,
        required: [true, 'Please specify a fee per day']
    },
    LicensePlate: {
        type: String,
        required: [true, 'Please specify a license plate number']
    }
}, {
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
});

//Cascade delete bookings when a car is deleted
CarSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
    console.log(`Bookings being removed from car ${this._id}`);
    await this.model('Booking').deleteMany({car: this._id});
    next();
});

//Reverse populate with virtuals
CarSchema.virtual('bookings', {
    ref: 'Booking',
    localField: '_id',
    foreignField: 'car',
    justOne: false
});

module.exports = mongoose.model('Car', CarSchema);