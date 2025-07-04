// require("dotenv").config(); // This is a function that loads environment variables from a .env file into process.env
import dotenv from "dotenv";
dotenv.config({
  path: ".env",
});

import { connectDB } from "./db/index.js";

connectDB();
