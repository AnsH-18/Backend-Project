import ApiError from "../utils/ApiErrors.js";
import asyncHandler from "../utils/AsyncHandler.js";
import { Subscription } from "../models/subscription.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import mongoose from "mongoose";

const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.query
    const user = req.user

    if(!channelId){
        throw new ApiError(404, "Channel Not found")
    }

    const subscription = await Subscription.findOne({
        $and: [
            {channel: channelId},
            {subscriber: user?._id}
        ]
    })

    if(!subscription){
        const newSubscription = await Subscription.create({
            channel: channelId,
            subscriber: user?._id
        })

        if(!newSubscription){
            throw new ApiError(402, "Cannot Subscribe")
        }
    }
    else{
        const deletedSubscription = await Subscription.findOneAndDelete({
            $and: [
                {channel: channelId},
                {subscriber: user._id}
            ]
        })

        if(!deletedSubscription){
            throw new ApiError(403, "Cannot Unsubscribe")
        }
    }
    
    return res.status(200).json(
        new ApiResponse(200, {}, "Action Performed Successfully")
    )
})

const getChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.query
    if(!channelId){
        throw new ApiError(402, "Channel not found")
    }

    const subscriberList = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriberDetails",
                pipeline:[{
                    $project: {
                        userName: 1,
                        fullName: 1,
                        avatar: 1
                    }
                }]
            }
        },{
            $project: {
                channel: 1,
                subscriberDetails: 1
            }
        }
       
    ])

    if(!subscriberList){
        throw new ApiError(403, "Subscriber list cannot be fetched")
    }

    return res.status(200).json(
        new ApiResponse(200, subscriberList, "Subscriber List Fetched Successfully")
    )

})

const getSubscribedToList = asyncHandler(async (req, res) => {
    const {subscriberId} = req.query

    if(!subscriberId){
        throw new ApiError(402, "Cannot get user details")
    }
    const subscribedtoList = await Subscription.aggregate([
        {$match: {subscriber: new mongoose.Types.ObjectId(subscriberId)}},
        {$lookup: {
            from: "users",
            localField: "channel",
            foreignField: "_id",
            as: "subscribedTo",
            pipeline: [
                {$project: {
                    avatar: 1,
                    fullName: 1,
                    userName: 1
                }}
            ]
        }},
        {$group: {
            _id: "$subscriber",
            subscribedTo : {$push: "$subscribedTo"}
        }}
       
    ])
    if(!subscribedtoList){
        throw new ApiError(402, "Subscribed to list cannot be fetched")
    }

    return res.status(200).json(
        new ApiResponse(200, subscribedtoList, "Subscribed To list fetched successfully")
    )
})


export {
    getChannelSubscribers,
    toggleSubscription,
    getSubscribedToList
}