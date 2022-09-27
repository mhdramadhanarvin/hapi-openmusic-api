const autoBind = require("auto-bind") 

class CollaborationsHandler {
  constructor(collaborationsService, playlistsService, validator) {
    this._collaborationsService = collaborationsService
    this._playlistsService = playlistsService
    this._validator = validator

    autoBind(this)
  }

  async postCollaborationHandler(request, h) {
    this._validator.validateCollaborationPayload(request.payload)
    const { id: credentialId } = request.auth.credentials
    const { playlistId, userId } = request.payload

    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId)
    const collaborationId = await this._collaborationsService.addCollaboration(
      playlistId,
      userId
    )

    const response = h.response({
      status: "success",
      message: "Kolaborasi berhasil ditambahkan",
      data: {
        collaborationId,
      },
    })
    response.code(201)
    return response
  }

  async deleteCollaborationHandler(request) {
    this._validator.validateCollaborationPayload(request.payload)
    const { id: credentialId } = request.auth.credentials
    const { noteId, userId } = request.payload

    await this._playlistsService.verifyPlaylistOwner(noteId, credentialId)
    await this._collaborationsService.deleteCollaboration(noteId, userId)

    return {
      status: "success",
      message: "Kolaborasi berhasil dihapus",
    }
  }
}

module.exports = CollaborationsHandler
