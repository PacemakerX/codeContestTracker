const mongoose = require("mongoose");

const url = process.env.MONGODB_URL;

const connectionParams = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};
/**
 * Establishes a connection to the MongoDB database using Mongoose.
 * 
 * @async
 * @function connectToDatabase
 * @description Attempts to connect to MongoDB using the configured URL and connection parameters.
 * On successful connection, logs a success message. On failure, logs the error details.
 * 
 * @throws {Error} If connection fails, error details will be logged to console
 * @returns {Promise<void>} A promise that resolves when connection is successful
 * 
 * @example
 * try {
 *   await connectToDatabase();
 *   // Database operations can proceed
 * } catch (error) {
 *   // Handle connection error
 * }
 * 
 * @requires mongoose - MongoDB object modeling tool
 * @see {@link https://mongoosejs.com/docs/connections.html Mongoose Connections}
 */
const connectToDatabase = async () => {
  try {
    await mongoose.connect(url, connectionParams);
    console.log("Connected to the database");
  } catch (err) {
    console.error(`Error connecting to the database: ${err}`);
  }
};

module.exports = connectToDatabase;