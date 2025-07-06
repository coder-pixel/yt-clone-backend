// routes middleware
import { Router } from "express";
import userRouter from "./user.routes.js";
import videoRouter from "./video.routes.js";
import tweetRouter from "./tweet.routes.js";

const router = Router();

router.use("/users", userRouter);
router.use("/videos", videoRouter);
router.use("/tweets", tweetRouter);

export default router;
