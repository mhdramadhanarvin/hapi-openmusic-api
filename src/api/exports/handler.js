const autoBind = require("auto-bind")

class ExportsHandler {
  constructor(producerService, playlistsService, validator) {
    this._producerService = producerService 
    this._playlistsService = playlistsService 
    this._validator = validator

    autoBind(this)
  }

  async postExportPlaylistByIdHandler(request, h) {
    this._validator.validateExportPlaylistByIdPayload(request.payload)
    const { playlistId } = request.params
    const { id: userId } = request.auth.credentials

    await this._playlistsService.verifyPlaylistOwner( playlistId, userId )

    const message = { 
      targetEmail: request.payload.targetEmail,
      playlistId
    }  
    
    await this._producerService.sendMessage("export:playlists", JSON.stringify(message))

    const response = h.response({
      status: "success",
      message: "Permintaan anda sedang kami proses",
    })
    response.code(201)
    return response
  }
}

module.exports = ExportsHandler
