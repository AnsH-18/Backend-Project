import jwt from "jsonwebtoken"
import ApiError from "../utils/ApiErrors.js"
import { User } from "../models/user.model.js"


const VerifyJWT = async (req, res, next) => {
    const accessToken = req.cookies?.accessToken

    if(!accessToken){
        throw new ApiError(400, "User is not logged in Or something went wrong")
    }

   const decodedToken =  await jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET)

   if(!decodedToken){
    throw new ApiError(401, "Something went wrong while verifying access token")
   }

   const user = await User.findById(decodedToken._id)

   req.user = user

   next()

}

export {VerifyJWT}