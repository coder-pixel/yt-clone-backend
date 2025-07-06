import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createTweet, getAllTweets } from "../controllers/tweet.controller.js";

const router = Router();

// route to create a tweet for a user
router.post("/create", verifyJWT, createTweet);

// route to get all tweets
router.get("/", verifyJWT, getAllTweets);

export default router;
