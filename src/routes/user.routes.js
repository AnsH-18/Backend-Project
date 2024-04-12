import { Router } from "express";
import userRegister from "../controllers/user.controller.js";

const userRouter = Router()

userRouter.post("/register", userRegister)

export default userRouter