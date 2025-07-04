// require("dotenv").config(); // This is a function that loads environment variables from a .env file into process.env
import dotenv from "dotenv";
dotenv.config({
  path: ".env",
});

import { connectDB } from "./db/index.js";
import app from "./app.js";

const PORT = process.env.PORT || 3000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("Error connecting to MongoDB", err);
  });
