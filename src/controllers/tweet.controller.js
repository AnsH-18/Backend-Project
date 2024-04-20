import ApiError from "../utils/ApiErrors.js";
import asyncHandler from "../utils/AsyncHandler.js";
import { Tweet } from "../models/tweet.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import mongoose from "mongoose";

const createTweet = asyncHandler(async(req, res) => {
    const {content} = req.body
    const user = req.user


    if(!content){
        throw new ApiError(401, "Content of the tweet is required")
    }

    const newTweet = await Tweet.create({
        owner: user?._id,
        content
    })

    if(!newTweet){
        throw new ApiError(402, "Tweet cannot be created")
    }

    return res.status(200).json(
        new ApiResponse(200, newTweet, "Tweet Added Successfully")
    )
})


const getUserTweets = asyncHandler(async(req, res) => {
    const {userId} = req.query

    if(!userId){
        throw new ApiError(403, "User is not logged in")
    }

    const tweets = await Tweet.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        }
    ])

    if(!tweets){
        throw new ApiError(402, "Tweets cannot be fetched")
    }

    return res.status(200).json(
        new ApiResponse(200, tweets, "Tweets fetched Successfully")
    )

})

const updateTweet = asyncHandler(async (req, res) => {
    const {tweetId} = req.query
    const {content} = req.body

    const user = req.user
    if(!tweetId){
        throw new ApiError(402, "Cannot get the tweet details")
    }

    if(!content){
        throw new ApiError(402, "Content to update is required")
    }

    const toUpdateTweet = await Tweet.findByIdAndUpdate(tweetId, {
        $set:{
            content: content,

        }
    })

    if(!toUpdateTweet){
        throw new ApiError(402, "Tweet cannot be updated")
    }

    return res.status(200).json(
        new ApiResponse(200, toUpdateTweet, "Tweet updated successfully")
    )
})

const deleteTweet = asyncHandler(async (req, res) => {
    const {tweetId} = req.query
    const user = req.user

    if(!tweetId){
        throw new ApiError(403, "Tweet details cannot be fetched")
    }

    const deletedTweet = await Tweet.deleteOne({owner: user?._id, _id : tweetId})

    if(!deleteTweet){
        throw new ApiError(405, "You cannot delete this tweet")
    }

    return res.status(200).json(
        new ApiResponse(200, {}, "Tweet deleted successfully")
    )

})

export {
    createTweet,
    updateTweet,
    deleteTweet,
    getUserTweets
}