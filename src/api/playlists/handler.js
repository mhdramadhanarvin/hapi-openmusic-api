const autoBind = require("auto-bind")

class PlaylistsHandler {
  constructor(playlistsService, playlistSongActivitiesService, validator) {
    this._playlistsService = playlistsService
    this._playlistSongActivitiesService = playlistSongActivitiesService
    this._validator = validator

    autoBind(this)
  }
  
  async postPlaylistHandler(request, h) {
    this._validator.validatePostPlaylistPayload(request.payload)
    const { name } = request.payload
    const { id: credentialId } = request.auth.credentials

    const playlistId = await this._playlistsService.addPlaylist({name, owner: credentialId})

    const response = h.response({
      status: "success",
      message: "Playlist berhasil ditambahkan",
      data: {
        playlistId,
      },
    })

    response.code(201)
    return response
  }

  async getPlaylistsHandler(request) {
    const { id: credentialId } = request.auth.credentials
    
    const playlists = await this._playlistsService.getPlaylists({owner: credentialId})

    return {
      status: "success",
      data: {
        playlists,
      },
    }
  }

  async deletePlaylistByIdHandler(request) {
    const { id } = request.params
    const { id: credentialId } = request.auth.credentials

    await this._playlistsService.verifyPlaylistOwner(id, credentialId) 
    await this._playlistsService.deletePlaylistById(id)

    return {
      status: "success",
      message: "Playlist berhasil dihapus",
    }
  } 

  async postSongToPlaylistByIdHandler(request, h) {
    this._validator.validatePlaylistSongsPayload(request.payload)

    const { songId } = request.payload
    const { id: playlistId } = request.params
    const { id: credentialId } = request.auth.credentials

    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId)
    await this._playlistsService.addSongtoPlaylistByPlaylistIdAndSongId({playlistId, songId, userId: credentialId})

    const response = h.response({
      status: "success",
      message: "Lagu berhasil ditambahkan ke playlist", 
    })

    response.code(201)
    return response
  }

  async getSongInPlaylistByIdHandler(request) {
    const { id: credentialId } = request.auth.credentials
    const { id } = request.params

    await this._playlistsService.verifyPlaylistAccess(id, credentialId)
    const playlist = await this._playlistsService.getSongsInPlaylistById(id)

    return {
      status: "success",
      data: {
        playlist,
      },
    }
  }

  async deleteSongFromPlaylistByIdHandler(request) {
    this._validator.validatePlaylistSongsPayload(request.payload)
    const { id: credentialId } = request.auth.credentials
    const { id: playlistId } = request.params
    const { songId } = request.payload

    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId)
    await this._playlistsService.deleteSongInPlaylist(playlistId, songId, credentialId)

    return {
      status: "success",
      message: "Musik berhasil dihapus dari playlist",
    }
  }

  async getPlaylistActivitiesByIdHandler(request) {
    const { id: playlistId } = request.params
    const { id: credentialId } = request.auth.credentials

    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId)
    const activities = await this._playlistSongActivitiesService.getActivitiesById(playlistId)

    return {
      status: "success",
      data: {
        playlistId,
        activities
      }
    }
  }

}

module.exports = PlaylistsHandler