import { Router } from "express";
import {RefreshAccessToken, changeAccountDetails, changeAvatar, changeCoverImage, changePassword, getCurrentUser, userLogOut, userLogin, userRegister} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { VerifyJWT } from "../middlewares/auth.middleware.js";

const userRouter = Router()

userRouter.post("/register", 
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ])
, userRegister)

userRouter.post("/login", userLogin)

//secured
userRouter.post("/logout", VerifyJWT, userLogOut)

userRouter.post("/refresh-access-token", VerifyJWT, RefreshAccessToken)

userRouter.post("/change-password", VerifyJWT, changePassword)

userRouter.get("/get-current-user", VerifyJWT, getCurrentUser)

userRouter.post("/change-avatar",upload.single("avatar"),VerifyJWT ,changeAvatar)

userRouter.post("/change-cover-image",upload.single("coverImage"), VerifyJWT ,changeCoverImage)

userRouter.post("/change-account-details", VerifyJWT, changeAccountDetails)

export default userRouter