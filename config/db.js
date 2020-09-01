const mongoose = require('mongoose');

const connectBD = async () => {
  const conn = await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  });
  console.log(`Mongodb connected: ${conn.connection.host}`.cyan.underline.bold);
};
module.exports = connectBD;