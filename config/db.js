const mongoose = require("mongoose");

//connect to database
const connectDB = async () => {
  mongoose.connect(process.env.MONGO_URI).then((connect) => {
    console.log("Database connected successfully");
  });
};

module.exports = connectDB;
