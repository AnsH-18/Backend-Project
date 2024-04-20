import mongoose from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import ApiError from "../utils/ApiErrors.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/AsyncHandler.js";

const createPlayList = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    const user = req.user

    if(!name){
        throw new ApiError(402, "Name is required for a playlist")
    }

    const playListNameAlreadyTakenBythisUser = await Playlist.findOne({name, owner: user?._id})
    if(playListNameAlreadyTakenBythisUser){
        throw new ApiError(402, "This user already have a playlist with this name choose another name")
    } 

    const newPlaylist = await Playlist.create({
        name,
        description: description || "",
        owner: user?._id,
        vides: []
    })

    if(!newPlaylist){
        throw new ApiError(402, "Playlist cannot be created")
    }

    return res.status(200).json(
        new ApiResponse(200, newPlaylist, "Playlist created Successfully")
    )

})

const getPlayListById = asyncHandler(async (req, res) => {
    const {playlistId} = req.query

    if(!playlistId){
        throw new ApiError(402, "Playlist details cannot be fetched")
    }


    const playlist = await Playlist.aggregate([
        {$match: {_id: new mongoose.Types.ObjectId(playlistId)}},
        {$unwind: "$videos"},
        {$lookup: {
            from: "videos",
            localField: "videos",
            foreignField: "_id",
            as: "videoInfo",
            pipeline: [{
                $lookup: {
                    from: "users",
                    localField: "owner",
                    foreignField: "_id",
                    as: "author",
                    pipeline: [{
                        $project:{
                            userName: 1,
                            avatar:1,
                            fullName: 1
                        }
                    }]
                },
                
               
            }, {
                $project: {
                    title: 1,
                    videoFile: 1,
                    thumbnail: 1,
                    author: 1
                }
            }]
        }},
        {$unwind: "$videoInfo"},
        {$group: {
            _id: "$_id",
            "name": { "$first": "$name" },
            "description": {"$first": "$description"},
            videos: {
                $push: "$videoInfo"
            },
           
        }}
       
    ])

    if(!playlist){
        throw new ApiError(500, "Cannot fetch Playlist")
    } 

    return res.status(200).json(
        new ApiResponse(200, playlist, "Playlist Fetched successfully")
    )
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.query
    
    if(!playlistId || !videoId){
        throw new ApiError(404, "Playlist or video fields cannot be fetched")
    }

    const user = req.user

    const addToPlaylist = await Playlist.updateOne(
        {_id: playlistId,owner: user?._id}, 
        {$push: {videos: videoId}}
    )

  
    if(!addToPlaylist){
        throw new ApiError(404, "Video cannot be added to the playlist")
    }

    return res.status(200).json(
        new ApiResponse(200, {}, "Video added successfully")
    )
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.query
    
    if(!playlistId || !videoId){
        throw new ApiError(404, "Playlist or video fields cannot be fetched")
    }

    const user = req.user

    const removeFromPlaylist = await Playlist.updateOne(
        {_id: playlistId,owner: user?._id}, 
        {$pull: {videos: videoId}}
    )

    if(!removeFromPlaylist){
        throw new ApiError(404, "Video cannot be removed from the playlist")
    }

    return res.status(200).json(
        new ApiResponse(200, {}, "Video removed successfully")
    )
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.query
    // TODO: delete playlist
    const user = req.user

    if(!playlistId){
        throw new ApiError(404, "Playlist properties cannot be fetched")
    }

    const deletePlaylist = await Playlist.deleteOne(
        {_id: playlistId, 
        owner: user?._id
    })

    if(!deletePlaylist){
        throw new ApiError(401, "Playlist cannot be deleted")
    }

    return res.status(200).json(
        new ApiResponse(200, {}, "Playlist Deleted successfully")
    )
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.query
    const {name, description} = req.body
    const user = req.user
    //TODO: update playlist

    if(!playlistId){
        throw new ApiError(404, "Playlist properties cannot be fetched")
    }

   const updatePlaylistProperties = await Playlist.findOneAndUpdate(
    {   
        _id: playlistId, 
        owner: user?._id
    }, 
    {
        $set: {
            name,
            description
        }
   })

    if(!updatePlaylistProperties){
        throw new ApiError(409, "Playlist cannot be updated")
    }

    return res.status(200).json(
        new ApiResponse(200, {}, "Playlist Updated Successfully")
    )
})


export {
    createPlayList,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    updatePlaylist,
    deletePlaylist,
    getPlayListById
}

