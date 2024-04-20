import { Router } from "express";
import {VerifyJWT} from "../middlewares/auth.middleware.js"
import { createTweet, deleteTweet, getUserTweets, updateTweet } from "../controllers/tweet.controller.js";

export const tweetRouter = Router()

tweetRouter.use(VerifyJWT)
tweetRouter.post("/create-tweet", createTweet)
tweetRouter.get("/user/:userId", getUserTweets)
tweetRouter.patch("/update/:tweetId", updateTweet)
tweetRouter.delete("/delete/:tweetId", deleteTweet)