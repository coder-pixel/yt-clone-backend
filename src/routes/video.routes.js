import { Router } from "express";
import {
  publishAVideo,
  getAllUserVideos,
  getAllVideos,
  getVideoById,
  updateVideoById,
  deleteVideoById,
  updatePublishedStatus,
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

// // route to get all videos of the logged in user -- moved to user routes
// router.get("/my-videos", verifyJWT, getAllUserVideos);

// route to get a video by id
router.get("/:videoId", getVideoById);

// route to update a video by id
router.patch(
  "/:videoId",
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
  updateVideoById
);

// route to update the published status of a video by id
router.patch("/:videoId/publish", verifyJWT, updatePublishedStatus);

// route to delete a video by id
router.delete("/:videoId", verifyJWT, deleteVideoById);

export default router;
