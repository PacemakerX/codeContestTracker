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
const contestRoutes = require("./routes/contestRoutes");
const bookmarkRoutes = require("./routes/bookmarkRoutes");

app.use("/api/users", userRoutes);
app.use("/api/contests", contestRoutes);
app.use("/api/bookmarks", bookmarkRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
