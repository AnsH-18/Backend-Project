import asyncHandler from "../utils/AsyncHandler.js";
import ApiError from "../utils/ApiErrors.js";
import {User} from "../models/user.model.js"
import uploadToCloudinary from "../utils/cloudinary.js"
import ApiResponse from "../utils/ApiResponse.js";

const options = {
    HTTPOnly: true,
    Secured: true
}

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
    
        const accessToken = await  user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()
    
        // console.log("Access Token", accessToken)
        // console.log("\nRefresh Token", refreshToken)


        if(!accessToken){
            throw new ApiError(402, "Error while generating Acess and Refresh Tokens")
        }
    
        user.refreshToken = refreshToken
        await user.save()
    
        return {accessToken, refreshToken}
    } catch (error) {
        throw new ApiError(500, error?.message)
    }
}


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
    let coverImageLocalPath

    if(req.files.coverImage){
        coverImageLocalPath = req.files?.coverImage[0]?.path
    }

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

const userLogin = asyncHandler (async (req, res) => {
    //get the user data from req.body
    //check if the user exist in the databse
    //check the password
    //generate access and refresh token
    //send access and referesh token back to the user using cookies

    const {userName, password} = req.body
    const user = await User.findOne({userName})


    if(!user){
        throw new ApiError(400, "User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401, "Password is incorrect")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)

    if(!accessToken){
        throw new ApiError(401, "Error while generating Access Token")
    }

    const loggedUser = await User.findById(user._id).select("-password -refreshToken")

    return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json({
        data: loggedUser,accessToken,
        refreshToken
        
    })


})

const userLogOut = asyncHandler (async (req, res) => {
    const user = req.user

    await User.findByIdAndUpdate(user._id, {
        $set: {
            refreshToken : undefined
        }
    })

    

    res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new ApiResponse(200, {}, "User Successfully Logged Out")
    )
})

const RefreshAccessToken = asyncHandler(async (req, res) => {
   
    const user = req.user

    if(!user){
        throw new ApiError(400, "Invalid Request")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)
    console.log(refreshToken)

    if(!refreshToken){
        throw new ApiError(400, "Error while generating new Access Token")
    }

    res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken)
    .json(
        new ApiResponse(200, {
            refreshToken, accessToken
        },"New Access Token Generated Successfully")
    )
})

const changePassword = asyncHandler(async(req, res) => {
    const {newPassword, oldPassword} = req.body

    if(!newPassword || !oldPassword){
        throw new ApiError(400, "Password fields cannot be empty")
    }

    const user = req.user

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){
        throw new ApiError(400, "Old password is wrong")
    }
    console.log(isPasswordCorrect)
    user.password = newPassword
    await user.save()

    return res.status(200).json(
        new ApiResponse(200, {}, "Password changed sucessfully")
    )

})

const changeAccountDetails = asyncHandler(async(req, res) => {
    const {fullName, email} = req.body

    if(!fullName || !email){
        throw new ApiError(400, "Account fields cannot be empty")
    }

    const user = await  User.findByIdAndUpdate(req.user._id,{
        $set: {
            fullName, email
        },
        
    } , {new: true})
    if(!user){
        throw new ApiError(401, "Something went wrong while changing the account details")
    }

    return res.status(200).json(
        new ApiResponse(200, {}, "Details changed Successfully")
    )
    
})

const getCurrentUser = asyncHandler(async(req, res) => {
    const user = await User.findById(req.user._id).select("-password -refreshToken")
    if(!user){
        throw new ApiError(400, "Something went wrong while getting the current user")
    }

    return res.status(200).json(
        new ApiResponse(200, user, "Current User fetched successfully")
    )
})

const changeAvatar = asyncHandler(async(req, res) => {
    const avatarLocalPath = req.file?.path

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required")
    }

    const UploadedAvatarFile = await uploadToCloudinary(avatarLocalPath)

    if(!UploadedAvatarFile){
        throw new ApiError(400, "Somthing went wrong while uploading the file")
    }
    const user = await User.findByIdAndUpdate(req.user._id, {
        $set: {
            avatar: UploadedAvatarFile.url
        }
    },{
        new: true
    }).select("-password -refreshToken")

    return res.status(200).json(
        new ApiResponse(200, {}, "Avatar changed Successfully")
    )
})

const changeCoverImage = asyncHandler(async(req, res) => {
    const coverImageLocalPath = req.file?.path

    if(!coverImageLocalPath){
        throw new ApiError(400, "Avatar file is required")
    }

    const UploadedCoverImageFile = await uploadToCloudinary(coverImageLocalPath)

    if(!UploadedCoverImageFile){
        throw new ApiError(400, "Somthing went wrong while uploading the file")
    }
    const user = await User.findByIdAndUpdate(req.user._id, {
        $set: {
            coverImage: UploadedCoverImageFile.url
        }
    },{
        new: true
    }).select("-password -refreshToken")

    return res.status(200).json(
        new ApiResponse(200, {}, "Cover Image changed Successfully")
    )
})

const getChannelDetails = asyncHandler(async(req, res) => {
    const {userName} = req.query

    if(!userName.trim()){
        throw new ApiError(404, "Channel Not Found")
    }
   
    const user = await User.findOne({userName: userName.toLowerCase()})
    console.log(userName.toLowerCase().trim() === user.userName);

    const channelDetails = await User.aggregate([
        {
            $match: {
                userName : userName.toLowerCase().trim()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscriberCount: {
                    $size: "$subscribers"
                },
                subscriberToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: {$in : [req.user?._id, "$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
            }
        },{
            $project: {
                fullName: 1,
                userName: 1,
                email: 1,
                avatar: 1,
                coverImage: 1,
                subscriberCount: 1,
                subscriberToCount: 1,
                subscribers: 1,
                subscribedTo: 1,
                isSubscribed: 1
            }
        }
    ])

   if(!channelDetails){
    throw new ApiError(404, "Channel Not Found")
   }
   return res.status(200).json(
    new ApiResponse(200, channelDetails, "Channel Details Fetched Successfully")
   )
})

const getWatchHistory = asyncHandler(async(req, res) => {
    const {user} = req

    if(!user){
        throw new ApiError(400, "Problem While Fetching Watch history for This user")
    }
    
    const watchHistory = await User.aggregate([
        {
            $match: {
                _id: user._id
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "UserWatchHistory",
                pipeline: [{
                    $lookup: {
                        from: "users",
                        localField: "owner",
                        foreignField: "_id",
                        as: "owner"
                    }
                }]
            }
        },{
            $addFields: {
                UserwatchHistory: "$UserWatchHistory"
            }
        },{
            $project: {
                fullName: 1,
                userName: 1,
                UserwatchHistory: 1,
                avatar: 1,     
                coverImage: 1
            }
        }
    ])

    if(!watchHistory){
        throw new ApiError(404, "Error While fetching Watch History")
    }

    return res.status(200).json(
        new ApiResponse(200, watchHistory, "Watch History fetched Successfully")
    )
})

export {

userRegister, 
userLogin, 
userLogOut, 
RefreshAccessToken,
changePassword,
changeAccountDetails,
getCurrentUser,
changeAvatar,
changeCoverImage,
getChannelDetails,
getWatchHistory

}