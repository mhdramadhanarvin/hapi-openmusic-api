const autoBind = require("auto-bind")

class AlbumLikesHandler {
  constructor(albumLikesService) {
    this._albumLikesService = albumLikesService 

    autoBind(this)
  }

  async postAlbumLikesByIdHandler(request, h) {
    const { albumId } = request.params
    const { id: userId } = request.auth.credentials 

    const albumLikes = await this._albumLikesService.hasAlbumLikeById(
      userId,
      albumId
    )
    
    const response = h.response({
      status: "success",
      message: `Album ${albumLikes}`,
    })

    response.code(201)
    return response
  }

  async getAlbumLikesByIdHandler(request, h) {
    const { albumId } = request.params

    const albumLikes = await this._albumLikesService.getLikesAlbum(albumId)
    
    const response = h.response({
      status: "success",
      data: {
        likes: parseInt(albumLikes.result)
      }
    })

    if (albumLikes.cache) {
      response.header("X-Data-Source", "cache")
    }
     
    return response
  }
}

module.exports = AlbumLikesHandler
