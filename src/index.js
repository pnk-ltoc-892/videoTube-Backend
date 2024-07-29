// env configuration
// require('dotenv').config({path: './env'})    // Better way below

import dotenv from "dotenv";
import connectDB from "./db/index.js";

dotenv.config({path: './env'})

// Connect To DB
connectDB();



