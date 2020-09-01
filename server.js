const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const path = require('path');
const fileupload = require('express-fileupload');

const errorHandler = require('./middlewares/error');
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');
const connectBD = require('./config/db');
// load env variables
dotenv.config({ path: './config/config.env' });

// connect to db
connectBD();
const app = express();
app.use(express.json());
//middlewares
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(fileupload());
// set static folder
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
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
