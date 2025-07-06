import { Router } from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
  refreshAccessToken,
  getCurrentUser,
  updateProfile,
  updateUserAvatar,
  updateUserCoverImage,
  changePassword,
  getWatchHistory,
  getUserChannleProfile,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getAllUserVideos } from "../controllers/video.controller.js";
import { getAllTweetsForAUser } from "../controllers/tweet.controller.js";
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

router.post("/change-password", verifyJWT, changePassword);

router.get("/current-user", verifyJWT, getCurrentUser); // get current user route

router.patch("/update-profile", verifyJWT, updateProfile); // update profile route

router.patch(
  "/update-avatar",
  verifyJWT,
  upload.single("avatar"),
  updateUserAvatar
); // update avatar route

router.patch(
  "/update-cover-image",
  verifyJWT,
  upload.single("coverImage"),
  updateUserCoverImage
); // update cover image route

router.get("/channel/:username", verifyJWT, getUserChannleProfile); // get user channel profile route

router.get("/watch-history", verifyJWT, getWatchHistory); // get watch history route

// route to get all videos uploaded by a user
router.get("/:userId/videos", verifyJWT, getAllUserVideos);

// route to get all tweets for a user
router.get("/:userId/tweets", verifyJWT, getAllTweetsForAUser);

export default router;
