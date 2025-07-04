import mongoose from "mongoose";

const baseUri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME;

// Combine them into a full URI with options
const fullUri = `${baseUri}/${dbName}?retryWrites=true&w=majority&appName=Cluster0`;
console.log({ baseUri, dbName, fullUri });

export const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(fullUri);
    console.log(
      `MongoDB connected!! DB HOST: ${connectionInstance?.connection?.host}`
    );
  } catch (error) {
    console.log("Error connecting to MongoDB", error);
    process.exit(1); // 1 is for failure, process.exit means is a function provided by node js to exit the current process
  }
};
