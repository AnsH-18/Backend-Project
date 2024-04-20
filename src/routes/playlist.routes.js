import { Router } from "express";
import { VerifyJWT } from "../middlewares/auth.middleware.js";
import { addVideoToPlaylist, createPlayList, deletePlaylist, getPlayListById, removeVideoFromPlaylist, updatePlaylist } from "../controllers/playlist.controller.js";

export const playlistRouter = Router()

playlistRouter.use(VerifyJWT)
playlistRouter.post("/create", createPlayList)
playlistRouter.patch("/add/:videoId", addVideoToPlaylist)
playlistRouter.patch("/update/:playlistId", updatePlaylist)
playlistRouter.get("/get/:playlistId", getPlayListById)
playlistRouter.patch("/remove/:playlistIdVideoId", removeVideoFromPlaylist)
playlistRouter.delete("/delete/:playlistid", deletePlaylist)
