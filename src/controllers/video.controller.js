import { Video } from "../models/video.model.js";
import ApiError from "../utils/ApiErrors.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/AsyncHandler.js";
import uploadToCloudinary from "../utils/cloudinary.js";
import { User } from "../models/user.model.js";
import mongoose, { Schema } from "mongoose";

const uploadVideo = asyncHandler(async (req, res) => {
    const {title, duration, description} = req.body

    if(!title || !duration || !description){
        throw new ApiError(404, "Video Fields are Required")
    }

    const owner = req.user._id
    if(!owner){
        throw new ApiError(404, "Something Went Wrong")
    }

    const videoFileLocalPath = req.files?.videoFile[0].path    
    const thumbNailLocalPath = req.files?.thumbnail[0].path    

    if(!videoFileLocalPath || !thumbNailLocalPath){
        throw new ApiError(401, "Thumbnail and VideoFile is Required")
    }

    const videoFile = await uploadToCloudinary(videoFileLocalPath)
    const thumbnail = await uploadToCloudinary(thumbNailLocalPath)

    if(!videoFile || !thumbnail){
        throw new ApiError(500, "Internal Server Error While uplaoding the files")
    }

    console.log(videoFile, thumbnail)
    const video = await Video.create({
        videoFile: videoFile.url,
        title,
        duration,
        thumbnail: thumbnail.url,
        owner,
        description
    })

    if(!video){
        throw new ApiError(404, "Error while Uploading video")
    }
    console.log(video)
    return res.status(200).json(
        new ApiResponse(200, video, "Video Uploaded Successfully")
    )
})

const getVideoById = asyncHandler(async (req, res) => {
    
    const {videoId} = req.query

    if(!videoId){
        throw new ApiError(404, "Video Does not found")
    }

    const video = await Video.findOne({_id: videoId})

    if(!video){
        throw new ApiError(402, "Video does not exists")
    }

    return res.status(200).json(
        new ApiResponse(200, video, "Video fetched successfully")
    )
})

const updateVideo = asyncHandler(async(req, res) => {
    const {videoId} = req.query

    if(!videoId){
        throw new ApiError(406,"Video does not found")
    }
    const {title,description} = req.body
    const thumbnailLocalPath = req.file?.path

    const thumbnail = await uploadToCloudinary(thumbnailLocalPath)

    if(!thumbnail){
        throw new ApiError(402, "Something went wrong while updating the thubnail")
    }

    if(!title ){
        throw new ApiError(402, "Fields title required to update")
    }

    const video = await Video.findByIdAndUpdate(videoId, {
        $set: {
            title,
            description,
            thumbnail: thumbnail.url
        }
    })

    if(!video){
        throw new ApiError(500, "Video cannot be updated")
    }

    return res.status(200).json(
        new ApiResponse(200, {}, "Video updated successfully")
    )

    
})

const deleteVideo = asyncHandler(async(req, res) => {
    const {videoId} = req.query

    if(!videoId){
        throw new ApiError(403, "Video does not found")
    }

    const video = await Video.findByIdAndDelete(videoId)

    if(!video){
        throw new ApiError(403, "Video cannot be deleted")
    }

    return res.status(200).json(
        new ApiResponse(200, {}, "Vdieo Deleted successfully")
    )
})

const togglePublishedStatus = asyncHandler(async(req, res) => {
    const {videoId} = req.query

    if(!videoId){
        throw new ApiError(403, "Video does not found")
    }

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(404, "Video action cannot be performed")
    }

    const prevVideoStatus = video.isPublished

    video.isPublished = !prevVideoStatus
    video.save()

    return res.status(200).json(
        new ApiResponse(200, video.isPublished, "Video Action performed Successfully")
    )
})

const getVideosofAUser = asyncHandler(async(req, res) => {
    const {userId} = req.query

    if(!userId){
        throw new ApiError(402, "Chnannel not found")
    }

    const user = await User.findById(userId)

    const allVideos = await Video.aggregate([
        {$match: {owner: new  mongoose.Types.ObjectId(userId)}},
        {$lookup: {
            from: "users",
            localField: "owner",
            foreignField: "_id",
            as: "author",
            pipeline: [{
                $project: {
                    fullName: 1,
                    userName: 1,
                    avatar: 1
                }
            }]
        }},{
            $group:{
                _id:"$owner" ,
                videoList: {
                    $push: {
                        _id : "$_id",
                        videoFile: "$videoFile",
                        thumbnail: "$thumbnail",
                        duration: "$duration",
                        views: "$views",
                        title: "$title",
                        description: "$description",
                        author: "$author"
                    }
                }
            }
        },
        
        
    ])
    if(!allVideos){
        throw new ApiError(402, "Error while fetching videos")
    }

    return res.status(200).json(
        new ApiResponse(200, allVideos, "Videos fetched successfully")
    )
})

const getAllVideos = asyncHandler(async (req, res) => {
    const allVideos = await Video.aggregate([
        {$lookup: {
            from: "users",
            localField: "owner",
            foreignField: "_id",
            as: "author",
            pipeline: [
                {$project: {
                    userName: 1,
                    fullName: 1,
                    avatar: 1
                }}
            ]
        }},{
            $project: {
                videoFile: 1,
                thumbnail: 1,
                title: 1,
                duration: 1,
                views: 1,
                createdAt: 1,
                author: 1
            }
        }
    ])

    if(!allVideos){
        throw new ApiError(500, "Videos cannot be fetched")
    }

    return res.status(200).json(
        new ApiResponse(200, allVideos, "Videos fetched successfully")
    )
})

export {
    uploadVideo,
    getVideosofAUser, 
    togglePublishedStatus, 
    updateVideo, 
    getVideoById,
    deleteVideo,
    getAllVideos
}