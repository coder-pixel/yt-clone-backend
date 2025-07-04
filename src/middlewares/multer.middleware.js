import multer from "multer";

// multer is a middleware that is used to upload files to the server, here we are using the diskStorage to store the files in the local server and we will use the cloudinary utility to upload the files to the cloudinary server
const storage = multer.diskStorage({
  // destination is the folder where the files will be stored
  destination: function (req, file, cb) {
    cb(null, "./public/temp"); // cb is the callback function, null is the error, "./public/temp" is the folder where the files will be stored
  },
  // filename is the name of the file that will be stored in the local server
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9); // generate a unique suffix for the file name
    cb(null, file?.fieldname + "-" + uniqueSuffix); // cb is the callback function, null is the error, file?.fieldname is the name of the file, uniqueSuffix is the unique suffix for the file name
  },
});

export const upload = multer({ storage });
