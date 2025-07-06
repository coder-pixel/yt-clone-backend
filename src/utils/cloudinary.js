//when we use this util, it means a file is uploaded to our local server temporarily and we need to upload that same file to cloudinary and if error occurs retry it and after success delete the file from local server
// storing the file in local server temporarily, so that we can retry the upload if error occurs

import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// used to configure the cloudinary credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// method to upload the file to cloudinary
const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null; // if the file path is not provided, return null, can also throw an error

    // upload the file to cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto", // auto is used to detect the file type automatically
    });

    // file has been uploaded successfully, so we can delete the file from the local server
    console.log("File is uploaded on cloudinary", response?.url);

    // delete the file from the local server
    fs.unlinkSync(localFilePath);

    return response; // can also only send the url of the file
  } catch (error) {
    console.log(error);
    // delete the file from the local server if error occurs, as we don't want to clutter the local server
    fs.unlinkSync(localFilePath); // delete the file from the local server
    return null;
  }
};

// This will generate a thumbnail at 3s and store it as a JPEG image.
const generateThumbnail = async (videoFilePath) => {
  try {
    if (!videoFilePath) return null;

    // generate the thumbnail
    const response = await cloudinary.uploader.explicit(videoFilePath, {
      type: "upload",
      resource_type: "video",
      // eager is used to generate the thumbnail at 3s and store it as a JPEG image.
      eager: [
        {
          width: 300,
          height: 170,
          gravity: "auto",
          crop: "fill",
          start_offset: "3", // Optional: capture at 3s into the video
          format: "jpg", // Optional: specify the format as jpg
        },
      ],
    });

    // return the url of the thumbnail
    return response?.eager?.[0]?.url;
  } catch (error) {
    console.log(error);
    throw new ApiError(500, "Failed to generate thumbnail");
  }
};

export { uploadOnCloudinary, generateThumbnail };
