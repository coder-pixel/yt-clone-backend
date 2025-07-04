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

export { uploadOnCloudinary };
