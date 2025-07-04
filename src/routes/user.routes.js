import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
const router = Router();

router.post(
  "/register",
  // upload.fields is used to upload multiple files at once
  upload.fields([
    {
      name: "avatar", // name of the field in the request body
      maxCount: 1, // maximum number of files allowed
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
); // register route

export default router;
