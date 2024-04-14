import asyncHandler from "../utils/AsyncHandler.js";
import ApiError from "../utils/ApiErrors.js";
import {User} from "../models/user.model.js"
import uploadToCloudinary from "../utils/cloudinary.js"
import ApiResponse from "../utils/ApiResponse.js";


const userRegister = asyncHandler(async (req, res) => {
    //Get user data
    //validate the data
    //check if user already registered
    //check form images, avatar
    //upload avatar, coverimage to cloudinary
    //create user object in MongoDB
    //remove password and refresh token for the response
    //return the response

    const {email, userName, password, fullName} = req.body
    console.log(email)
    
    if(!email || !userName || !password || !fullName){
        throw new ApiError(400, "Fields cannot be empty")
    }

    const existedUser = await User.findOne({
        userName
    })

    if(existedUser){
        throw new ApiError(400, "User already exists")
    }

    console.log(req.files)

    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverImageLocalPath = req.files?.coverImage[0]?.path

    if(!avatarLocalPath){
        throw new ApiError(400, "avatar image is required")
    }

    const avatarUpload = await uploadToCloudinary(avatarLocalPath)
    const coverImageUpload = await  uploadToCloudinary(coverImageLocalPath)

    if(!avatarUpload){
        throw new ApiError(400, "Avatar image is required")
    }

    const user = await User.create({
        email,
        userName: userName.toLowerCase(),
        fullName,
        avatar: avatarUpload.url,
        coverImage: coverImageUpload?.url || "",
        password
    })
    console.log(user)
    if(!user){
        throw new ApiError(400, "Something went wrong while registering user")
    }

    const createdUser = await  User.findById(user._id).select("-password -refreshToken")

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }
    
    return res.status(201).json(
        new ApiResponse(201, createdUser, "success")
    )

   
})

export default userRegister