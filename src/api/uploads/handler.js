const autoBind = require("auto-bind")
const config = require("../../utils/config")

class UploadsHandler {
  constructor(uploadService, albumsService, validator) {
    this._uploadService = uploadService
    this._albumsService = albumsService
    this._validator = validator

    autoBind(this)
  }

  async uploadAlbumsCoverByIdHandler(request, h) {
    const { cover } = request.payload
    const { id } = request.params

    this._validator.validateCoverUploadPayload(cover.hapi.headers)
    const album = await this._albumsService.getAlbumById(id)
    const coverFileName = !album.coverUrl
      ? null
      : album.coverUrl.split("/").filter(Boolean).at(-1) 
    const newCoverFileName = await this._uploadService.writeFile(
      cover,
      cover.hapi,
      coverFileName
    )
    const newCoverUrl = `http://${config.app.host}:${config.app.port}/cover/${newCoverFileName}`
    await this._albumsService.editCoverAlbumById(id, newCoverUrl)

    const response = h.response({
      status: "success",
      message: "Sampul berhasil diunggah",
    })
    response.code(201)
    return response
  }
}

module.exports = UploadsHandler
