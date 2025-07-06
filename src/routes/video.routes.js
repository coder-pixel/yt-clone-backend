import { Router } from "express";
import {
  publishAVideo,
  getAllUserVideos,
  getAllVideos,
} from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// route to publish a video
router.post(
  "/publish",
  verifyJWT,
  upload.fields([
    {
      name: "video",
      maxCount: 1,
    },
    {
      name: "thumbnail",
      maxCount: 1,
    },
  ]),
  publishAVideo
);

// route to get all the videos
router.get("/", getAllVideos);

// route to get all videos of the logged in user
router.get("/my-videos", verifyJWT, getAllUserVideos);

export default router;
