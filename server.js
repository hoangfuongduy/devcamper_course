const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const path = require('path');
const cookieParser = require('cookie-parser');
const fileupload = require('express-fileupload');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xssClean = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');

const errorHandler = require('./middlewares/error');
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');
const auth = require('./routes/auth');
const users = require('./routes/user');
const reviews = require('./routes/reviews');
const connectBD = require('./config/db');
// load env variables
dotenv.config({ path: './config/config.env' });

// connect to db
connectBD();
const app = express();
app.use(express.json());
app.use(cookieParser());
//middlewares
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(fileupload());

// sanitize data sent from client
app.use(mongoSanitize());
// set security headers
app.use(helmet());
// prevent cross site scripting tags (xss)
app.use(xssClean());
// rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100,
});
app.use(limiter);
// prevent http params pollution
app.use(hpp());
// cors - allows other site to access the api
app.use(cors());
// set static folder
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.use('/api/v1/reviews', reviews);

app.use(errorHandler);
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () =>
  console.log(
    `Server runing in ${process.env.NODE_ENV} on port ${PORT}`.yellow.bold
  )
);

// handle unhandled promise rejection
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // Close server
  server.close(() => process.exit(1));
});
