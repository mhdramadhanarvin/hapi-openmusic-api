const autoBind = require("auto-bind")

class PlaylistsHandler {
  constructor(service, validator) {
    this._service = service
    this._validator = validator

    autoBind(this)
  }
  
  async postPlaylistHandler(request, h) {
    this._validator.validatePostPlaylistPayload(request.payload)
    const { name } = request.payload
    const { id: credentialId } = request.auth.credentials

    const playlistId = await this._service.addPlaylist({name, owner: credentialId})

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
    
    const playlists = await this._service.getPlaylists({owner: credentialId})

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

    await this._service.verifyPlaylistOwner(id, credentialId); 
    await this._service.deletePlaylistById(id)

    return {
      status: "success",
      message: "Playlist berhasil dihapus",
    }
  } 

  async postSongToPlaylistByIdHandler(request, h) {
    this._validator.validatePostSongIntoPlaylistPayload(request.payload)

    const { songId } = request.payload
    const { id: playlistId } = request.params
    const { id: credentialId } = request.auth.credentials                   

    await this._service.verifyPlaylistOwner(playlistId, credentialId)
    await this._service.addSongtoPlaylistByPlaylistIdAndSongId(playlistId, songId)

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

    await this._service.verifyPlaylistOwner(id, credentialId)
    const playlistSongs = await this._service.getSongsInPlaylistById(id)

    return {
      status: "success",
      data: {
        playlistSongs,
      },
    }
  }

}

module.exports = PlaylistsHandler