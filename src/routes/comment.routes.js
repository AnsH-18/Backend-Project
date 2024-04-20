import { Router } from "express";
import { VerifyJWT } from "../middlewares/auth.middleware.js";
import { addComment, deleteComment, getVideoComments, updateComment } from "../controllers/comment.controller.js";

export const commentRouter = Router()

commentRouter.use(VerifyJWT)
commentRouter.post("/add/:videoId", addComment)
commentRouter.get("/get-all/:videoId", getVideoComments)
commentRouter.patch("/update/:commentId", updateComment)
commentRouter.delete("/delete/:videoId", deleteComment)