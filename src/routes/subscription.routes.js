import { Router } from "express";
import { VerifyJWT } from "../middlewares/auth.middleware.js";
import { getChannelSubscribers, getSubscribedToList, toggleSubscription } from "../controllers/subscription.controller.js";

export const subscriptionRouter = Router()

subscriptionRouter.use(VerifyJWT)

subscriptionRouter.get("/channel-subscribers/:channelId", getChannelSubscribers)

subscriptionRouter.patch("/toggle-subscription/:videoId", toggleSubscription)

subscriptionRouter.get("/subscribed-to-list/:subscriberId", getSubscribedToList)