const Review = require('../models/Review');
const Car = require('../models/Car');

//@desc Get all reviews for a car
//@route GET /api/v1/cars/:carId/reviews
//@access Public
exports.getReviews = async (req, res, next) => {
    
        let query;
        // General user can see only their reviews
        if (req.user.role !== 'admin') {
            query = Review.find({ user: req.user.id }).populate({
                path: 'user',
                select: 'username'
            });
        } else { // Admin can see all reviews

            
            query = Review.find().populate({
                path: 'user',
                select: 'username' 
            });
        }
        try {
            const reviews = await query;
        res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Cannot get reviews" });
    }
};
//@desc Get single review
//@route GET /api/v1/reviews/:id
//@access Public
exports.getReview = async (req, res, next) => {
    try {
        const review = await Review.findById(req.params.id).populate({
            path: 'user',
            select: 'username' 
        });

        if (!review) {
            return res.status(404).json({
                success: false,
                message: `No review with the id of ${req.params.id}`
            });
        }

        res.status(200).json({
            success: true,
            data: review
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Cannot find a review"
        });
    }
};

//@desc Add review
//@route POST /api/v1/cars/:carId/reviews
//@access Private
exports.addReview = async (req, res, next) => {
    try {
        req.body.car = req.params.carId;
        req.body.user = req.user.id;

        const car = await Car.findById(req.params.carId);

        if (!car) {
            return res.status(404).json({
                success: false,
                message: `No car with the id of ${req.params.carId}`
            });
        }
        //Check for existed review
        const existedReviews = await Review.find({user: req.user.id});

        //If the user is not an admin, they can only create 3 bookings
        if (existedReviews.length >= 3 && req.user.role !== 'admin') {
            return res.status(404).json({
                success: false,
                message: `The user with ID ${req.user.id} has already made 3 reviews`
            });
        }

        const review = await Review.create(req.body);

        // // Add the review to the car's reviews array
        // car.reviews.push(review._id);
        // await car.save();

        res.status(200).json({
            success: true,
            data: review
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Cannot create review"
        });
    }
};

//@desc Update review
//@route PUT /api/v1/reviews/:id
//@access Private
exports.updateReview = async (req, res, next) => {
    try {
        let review = await Review.findById(req.params.id);

        // Check if the review exists
        if (!review) {
            return res.status(404).json({
                success: false,
                message: `No review with the id of ${req.params.id}`
            });
        }

        // Make sure user is the review owner
        if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({
                success: false,
                message: `User ${req.user.id} is not authorized to update this review`
            });
        }

        review = await Review.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: review
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Cannot update review"
        });
    }
};

//@desc Delete review
//@route DELETE /api/v1/reviews/:id
//@access Private
exports.deleteReview = async (req, res, next) => {
    try {
        const review = await Review.findById(req.params.id);

        // Check if the review exists
        if (!review) {
            return res.status(404).json({
                success: false,
                message: `No review with the id of ${req.params.id}`
            });
        }

        // Make sure user is the review owner
        if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({
                success: false,
                message: `User ${req.user.id} is not authorized to delete this review`
            });
        }

        // // Remove the review from the associated car's reviews array
        // const car = await Car.findById(review.car);
        // car.reviews = car.reviews.filter(reviewId => reviewId.toString() !== req.params.id);
        // await car.save();

        await review.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Cannot delete review"
        });
    }
};
