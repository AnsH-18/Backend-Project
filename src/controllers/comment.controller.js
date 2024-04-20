import ApiError from "../utils/ApiErrors.js";
import asyncHandler from "../utils/AsyncHandler.js";
import { Comment } from "../models/comment.model.js";
import mongoose from "mongoose";
import ApiResponse from "../utils/ApiResponse.js";

const getVideoComments = asyncHandler(async (req, res) => {
    const {videoId} = req.query
    const {page = 1, limit = 10} = req.query

    if(!videoId){
        throw new ApiError(404, "Details about Video cannot be fetched")
    }

    const skipCount = (page - 1) * limit

    const comments = await Comment.aggregate([
        {$match: {video: new mongoose.Types.ObjectId(videoId)}},
        {$lookup: {
            from : "users",
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
        }},
        {$skip: skipCount},
        {$limit: limit},
        {$project: {
            video: 1,
            content: 1,
            author: 1
        }}
    ])

    if(!comments){
        throw new ApiError(402, "Comments cannot be fetched")
    }

    return res.status(200).json(
        new ApiResponse(200, comments, "Commnents fetched successfully")
    )
})

const addComment = asyncHandler(async (req, res) => {
    const {videoId} = req.query
    const user = req.user
    const {content} = req.body

    if(!videoId || !content){
        throw new ApiError(402, "Video and Commnet Fields are required")
    }

    const newCommnet = await Comment.create({
        content,
        video: videoId,
        owner: user?._id
    })

    if(!newCommnet){
        throw new ApiError(402, "Comment cannot be added")
    }

    return res.status(200).json(
        new ApiResponse(200, {}, "New comment added successfully")
    )
})

const updateComment = asyncHandler(async (req, res) => {
    const {videoId, commentId} = req.query
    const {content} = req.body
    const user = req.user

    if(!videoId || !content || !commentId){
        throw new ApiError(402, "Video and comment field are required")
    }

    const updatedComment = await Comment.findOneAndUpdate({video : videoId, _id : commentId, owner: user?._id}, {
        $set: {
            content
        }
    })
    if(!updateComment){
        throw new ApiError(402, "You cannot update this comment")
    }

    return res.status(200).json(
        new ApiResponse(200, {}, "Comment updated successfully")
    )
})


const deleteComment = asyncHandler(async(req, res) => {
    const {videoId, commentId} = req.query
    const user = req.user

    if(!videoId || !commentId){
        throw new ApiError(402, "Video and comment field are required")
    }

    const deletedComment = await Comment.findOneAndDelete({video: videoId, _id: commentId, owner: user?._id})

    if(!deletedComment){
        throw new ApiError(402, "You cannot delete this tweet")
    }

    return res.status(200).json(
        new ApiResponse(200, {}, "Comment deleted successfully")
    )
})


export {
    addComment,
    updateComment,
    getVideoComments,
    deleteComment
}