import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new mongoose.Schema(
  {
    videoFile: {
      type: String, // url of the video uploaded to cloudinary
      required: [true, "Video file is required"], // message is used to set the message of the error
    },
    thumbnail: {
      type: String, // url of the thumbnail uploaded to cloudinary
      required: [true, "Thumbnail is required"], // message is used to set the message of the error
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    duration: {
      type: Number, // duration of the video in seconds
      required: true,
    },
    views: {
      type: Number, // number of views of the video
      default: 0,
    },
    isPublished: {
      type: Boolean, // if the video is published or not
      default: true, // default is true, that is the video is published by default
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId, // id of the owner of the video
      ref: "User", // ref is used to create a reference to the User model
    },
  },
  { timestamps: true } // timestamps is used to create a createdAt and updatedAt field
);

videoSchema.plugin(mongooseAggregatePaginate); // it is done, so that we can use aggregation piplines in this model

export const Video = mongoose.model("Video", videoSchema);
