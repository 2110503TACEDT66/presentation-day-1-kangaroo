const express = require ('express')
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const {xss} = require('express-xss-sanitizer');
const rateLimit = require('express-rate-limit');
const cors = require('cors')
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');
const cors = require('cors')

//Load env vars
dotenv.config({path:'./config/config.env' });

//Connect to database
connectDB();

//Route files
const cars = require('./routes/cars');
const auth = require('./routes/auth');
const bookings = require('./routes/bookings');
const reviews = require('./routes/reviews');

const app=express();

app.use(cors())

const PORT = process.env.PORT || 5050;
const server = app.listen(PORT,console.log(`Server running in ${process.env.NODE_ENV} mode on ${process.env.HOST}: ${PORT}`));

const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Library API',
            version: '1.0.0',
            description: 'A simple Express VacQ API',
        },
        servers: [
            {
                url: process.env.HOST+ ":" + PORT +'/api/v1',
            },
        ],
    },
    apis: ['./routes/*.js']
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));

// Rate limiting
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 mins
    max: 5000
  });
  
app.use(limiter);

// Set security headers
app.use(helmet());

// Body parser
app.use(express.json());

// Prevent XSS attacks
app.use(xss());

// Cookie parser
app.use(cookieParser());

// Sanitize data
app.use(mongoSanitize());

//Enable cors
app.use(cors);

//Mount routers
app.use('/api/v1/cars',cars);
app.use('/api/v1/auth',auth);
app.use('/api/v1/bookings',bookings);
app.use('/api/v1/reviews', reviews);



//Handle unhandled promise rejections
process.on('unhandledRejection',(err,promise)=>{
    console.log(`Error: ${err.message}`);
    //Close server & exit process
    server.close(()=>process.exit(1));
})