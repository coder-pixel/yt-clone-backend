import { Router } from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
  refreshAccessToken,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

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

router.post("/login", loginUser); // login route

router.post("/logout", verifyJWT, logoutUser); // logout route

router.post("/refresh-access-token", refreshAccessToken); // refresh access token route

export default router;
