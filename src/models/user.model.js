import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true, // index is used to create an index on the field, it is used to speed up the search, indexing
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    avatar: {
      type: String, // url of the avatar uploaded to cloudinary
      required: true,
    },
    coverImage: {
      type: String, // url of the cover image uploaded to cloudinary
    },
    watchHistory: [
      {
        type: mongoose.Schema.Types.ObjectId, // id of the video in the watch history
        ref: "Video", // ref is used to create a reference to the Video model
      },
    ],
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true } // timestamps is used to create a createdAt and updatedAt field
);

// Pre-save hook for the User schema. This can be used to perform actions before saving a user document, such as hashing the password.
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // if the password is not modified, then skip the hashing
  this.password = await bcrypt.hash(this.password, 10); // hash the password
  next(); // call the next middleware
});

// Method to check if the password is correct
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password); // compare the password with the hashed password
};

// Method to generate an access token, when older access token is expired
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      id: this._id,
      email: this.email,
      username: this.username,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

// Method to generate a refresh token, when older refresh token is expired
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
};

export const User = mongoose.model("User", userSchema);
