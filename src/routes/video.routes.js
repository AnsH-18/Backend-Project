import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { deleteVideo, getAllVideos, getVideoById, getVideosofAUser, togglePublishedStatus, updateVideo, uploadVideo } from "../controllers/video.controller.js";
import { VerifyJWT } from "../middlewares/auth.middleware.js";

const videoRouter = Router()
videoRouter.use(VerifyJWT)

videoRouter.post("/upload-video", 
upload.fields([
    {
        name: "videoFile",
        maxCount: 1
    },{
        name: "thumbnail",
        maxCount: 1
    }
]), uploadVideo)

videoRouter.get("/get/:userid",  getVideosofAUser)
videoRouter.post("/toggle-publish-status", togglePublishedStatus)
videoRouter.patch("/update-video",upload.single("thumbnail"), updateVideo)
videoRouter.get("/videos/:videoid", getVideoById)
videoRouter.delete("/delete/:videoId", deleteVideo)
videoRouter.get("/get-all", getAllVideos)

export {videoRouter}