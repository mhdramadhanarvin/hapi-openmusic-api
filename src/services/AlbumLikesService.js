const { nanoid } = require("nanoid")
const { Pool } = require("pg")
const InvariantError = require("../exceptions/InvariantError")

class AlbumLikesService {
  constructor(albumsService, cacheService) {
    this._pool = new Pool()
    this._tableName = "user_album_likes"
    this._albumsService = albumsService
    this._cacheService = cacheService
  }

  async getLikesAlbum(id) {
    try {
      const result = await this._cacheService.get(`album_likes:${id}`)
      return {result, cache: true}
    } catch (error) {
      const query = {
        text: `SELECT count(*) FROM ${this._tableName} WHERE album_id = $1`,
        values: [id],
      }
  
      const { rows } = await this._pool.query(query) 

      const result = rows[0].count

      await this._cacheService.set(`album_likes:${id}`, result)

      return {result, cache: false}     
    }
  }

  async hasAlbumLikeById(userId, albumId) {

    await this._albumsService.getAlbumById(albumId)

    const query = {
      text: `SELECT * FROM ${this._tableName} WHERE user_id = $1 AND album_id = $2`,
      values: [userId, albumId],
    }

    const result = await this._pool.query(query)

    if (result.rowCount == 0) {
      await this.likeAlbumById(userId, albumId)
      return "disukai"
    }

    await this.unlikeAlbumById(userId, albumId)
    return "batal disukai"
  }

  async likeAlbumById(userId, albumId) {
    const id = nanoid(16)
    const query = {
      text: `INSERT INTO ${this._tableName} VALUES ($1, $2, $3) RETURNING id`,
      values: [id, userId, albumId],
    }

    const result = await this._pool.query(query)

    if (!result.rows[0].id) {
      throw new InvariantError("Album gagal disukai")
    }

    await this._cacheService.delete(`album_likes:${albumId}`)
  }

  async unlikeAlbumById(userId, albumId) {
    const query = {
      text: `DELETE FROM ${this._tableName} WHERE user_id = $1 AND album_id = $2`,
      values: [userId, albumId],
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new InvariantError("Album gagal disukai")
    }

    await this._cacheService.delete(`album_likes:${albumId}`)
  }
}

module.exports = AlbumLikesService
