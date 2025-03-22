const mongoose = require("mongoose");

const url = process.env.MONGODB_URL;

const connectionParams = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};
const connectToDatabase = async () => {
  try {
    await mongoose.connect(url, connectionParams);
    console.log("Connected to the database");
  } catch (err) {
    console.error(`Error connecting to the database: ${err}`);
  }
};

module.exports = connectToDatabase;