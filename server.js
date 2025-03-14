const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const port = process.env.PORT;
const connectToDatabase = require("./db");
connectToDatabase();
app.use(cors());
app.use(express.json());
const userRoutes = require("./routes/userRoutes");

app.use("/api/users", userRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
