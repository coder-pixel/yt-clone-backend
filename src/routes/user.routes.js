import { Router } from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
  refreshAccessToken,
  getCurrentUser,
  updateProfile,
  updateUserAvatar,
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

router.get("/current-user", verifyJWT, getCurrentUser); // get current user route

router.put("/update-profile", verifyJWT, updateProfile); // update profile route

router.put(
  "/update-avatar",
  verifyJWT,
  upload.single("avatar"),
  updateUserAvatar
); // update avatar route

router.put(
  "/update-cover-image",
  verifyJWT,
  upload.single("coverImage"),
  updateUserCoverImage
); // update cover image route

export default router;
