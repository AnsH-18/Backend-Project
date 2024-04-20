import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"

const app = express()

const corsOptions = {
    origin: process.env.CORS_ORIGIN,
    credentials: true
}

app.use(cors(corsOptions))
app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({limit: "16kb", extended: true}))
app.use(express.static("public"))
app.use(cookieParser())

import userRouter from "./routes/user.routes.js"
import { videoRouter } from "./routes/video.routes.js"
import { subscriptionRouter } from "./routes/subscription.routes.js"
import { tweetRouter } from "./routes/tweet.routes.js"
import { commentRouter } from "./routes/comment.routes.js"
import { likesRouter } from "./routes/likes.routes.js"
import { playlistRouter } from "./routes/playlist.routes.js"

app.use("/api/v1/users", userRouter)
app.use("/api/v1/video", videoRouter)
app.use("/api/v1/subscriptions", subscriptionRouter)
app.use("/api/v1/tweet", tweetRouter)
app.use("/api/v1/comment", commentRouter)
app.use("/api/v1/like", likesRouter)
app.use("/api/v1/playlist", playlistRouter)

export default app