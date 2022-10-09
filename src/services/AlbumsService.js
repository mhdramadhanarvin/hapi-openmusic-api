const { nanoid } = require("nanoid")
const { Pool } = require("pg")
const InvariantError = require("../exceptions/InvariantError")
const NotFoundError = require("../exceptions/NotFoundError") 
const { mapDBToModel } = require("../utils/mapping")
const SongsService = require("./SongsService")

class AlbumsService {
  constructor() {
    this._pool = new Pool()
    this._songService = new SongsService()
  }

  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`

    const query = {
      text: "INSERT INTO albums VALUES ($1, $2, $3) RETURNING id",
      values: [id, name, year],
    }

    const result = await this._pool.query(query)

    if (!result.rows[0].id) {
      throw new InvariantError("Album gagal ditambahkan")
    }

    return result.rows[0].id
  }

  async getAlbums() {
    const { rows } = await this._pool.query("SELECT id, name, year FROM albums")
    return rows
  }

  async getAlbumById(id) {
    const queryAlbum = {
      text: "SELECT id, name, year, cover FROM albums WHERE id = $1",
      values: [id],
    }
    const resultAlbum = await this._pool.query(queryAlbum)

    if (!resultAlbum.rowCount) {
      throw new NotFoundError("Album tidak ditemukan")
    }

    const resultRelatedSong = await this._songService.getSongsByAlbumId(id)

    const result = resultAlbum.rows.map(mapDBToModel)[0]

    if (resultRelatedSong.length) {
      result.songs = resultRelatedSong
    }

    return result
  }

  async editAlbumById(id, { name, year }) {
    const query = {
      text: "UPDATE albums SET name = $1, year = $2 WHERE id = $3",
      values: [name, year, id],
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError("Gagal memperbarui album. Id tidak ditemukan")
    }
  }

  async editCoverAlbumById(id, coverUrl) {
    const query = {
      text: "UPDATE albums SET cover = $1 WHERE id = $2",
      values: [coverUrl, id]
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError("Gagal memperbarui cover album. Id tidak ditemukan")
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: "DELETE FROM albums WHERE id = $1 RETURNING id",
      values: [id],
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError("Album gagal dihapus. Id tidak ditemukan")
    }
  }
}

module.exports = AlbumsService
