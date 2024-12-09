import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    if (!name || name.trim() === '') {
        throw new ApiError(400,"Playlist name is required")
    }


  

    const owner = req.user?._id

    const playlist = await Playlist.create({
        name,
        description: description || ""
        owner
    })

    if (!playlist) {
        throw new ApiError(400,"Failed to create playlist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,{playlist},"Playlist created successfully")
    )
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists

    if (!isValidObjectId(userId)) {
        throw new ApiError(400,"Invalid user id")
    }

    const userPlaylists = await Playlist.find({owner:userId})

    if (!userPlaylists) {
        throw new ApiError(400,"Playlists is not available of this user ")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,{userPlaylists}, "User playlists got successfully")
    )
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist id")
    }

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(400,"Playlist is not available ")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,playlist, "playlist got successfully")
    )
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if (!(playlistId || videoId)) {
        throw new ApiError(400, "Both playlistid and videoId are required")
    }

    if (!(isValidObjectId(playlistId) || isValidObjectId(videoId))) {
        throw new ApiError(400, "Invalid playlistid or videoId")
    }

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(400, "Playlist is not available")
    }

    const videoExists = playlist.videos.includes(videoId)

    if (videoExists) {
        throw new ApiError(400, "Video already exists in playlist")
    }

    playlist.videos.push(videoId)
    await playlist.save()

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            { playlist },
            'Video added to playlist successfully'
        )
    )
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist

    if (!(playlistId || videoId)) {
        throw new ApiError(400, "Both playlistid and videoId are required")
    }

    if (!(isValidObjectId(playlistId) || isValidObjectId(videoId))) {
        throw new ApiError(400, "Invalid playlistid or videoId")
    }

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(400, "Playlist is not available")
    }

    if (playlist.videos.length == 0) {
        throw new ApiError(400, "Videos are not available in playlist")
    }

    if (!(playlist.videos.includes(videoId))) {
        throw new ApiError(400, "video is not available in playlist")
    }

    const videoIndex = playlist.videos.indexof(videoId)

    playlist.videos.splice(videoIndex,1)
    await playlist.save()

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            { playlist },
            'Video removed from playlist successfully'
        )
    )

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    
    if (!playlistId) {
        throw new ApiError(400,"invalid playlist id")
    }

    const playlist = await Playlist.findById(playlist)

    if (!playlist) {
        throw new ApiError(400, "playlist is not avaliable")
    }

    playlist.deleteOne(playlistId)

    return res
    .status(200)
    .json(
        new ApiResponse(200,,"Playlist deleted succussfully")
    )

})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    
    if (isValidObjectId(playlistId)) {
        throw new ApiError(400, "invalid playlist id")
    }

    if (!(name || description)) {
        throw new ApiError(400, "Both name and playlist is required")
    }

    const playlist = awiat Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set:{
                name,
                description
            }
        },
        {new:true}
    )


})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
