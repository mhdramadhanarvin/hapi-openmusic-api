const { nanoid } = require("nanoid")
const { Pool } = require("pg")
const InvariantError = require("../exceptions/InvariantError")
const NotFoundError = require("../exceptions/NotFoundError")
const AuthorizationError = require("../exceptions/AuthorizationError")
const SongsService = require("./SongsService")
const CollaborationsService = require("./CollaborationsService")
const PlaylistSongActivitiesService = require("./PlaylistSongActivitiesService")

class PlaylistsService {
  constructor() {
    this._pool = new Pool
    this._songsService = new SongsService
    this._collaborationService = new CollaborationsService
    this._playlistSongActivitiesService = new PlaylistSongActivitiesService
  }
  
  async addPlaylist({name, owner}) {
    const id = `playlist-${nanoid(16)}`

    const query = {
      text: "INSERT INTO playlists VALUES ($1, $2, $3) RETURNING id",
      values: [id, name, owner],
    }

    const result = await this._pool.query(query)

    if (!result.rows[0].id) {
      throw new InvariantError("Playlist gagal ditambahkan")
    }

    return result.rows[0].id
  }

  async getPlaylists({owner}) {
    const query = {
      text: "SELECT playlists.id, playlists.name, users.username FROM playlists LEFT JOIN users ON playlists.owner = users.id WHERE playlists.owner = $1",
      values: [owner],
    }

    const result = await this._pool.query(query)
    return result.rows
  }

  async deletePlaylistById(id) {
    const query = {
      text: "DELETE FROM playlists WHERE id = $1 RETURNING id",
      values: [id],
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError("Playlist gagal dihapus. Id tidak ditemukan")
    }
  }

  async addSongtoPlaylistByPlaylistIdAndSongId({playlistId, songId, userId}) {
    const id = nanoid(16)
    
    await this._songsService.getSongById(songId)

    const query = {
      text: "INSERT INTO playlist_songs VALUES ($1, $2, $3) RETURNING id",
      values: [id, playlistId, songId],
    }

    const result = await this._pool.query(query)

    if (!result.rows[0].id) {
      throw new InvariantError("Lagu gagal ditambahkan ke playlist")
    } 
    
    await this._playlistSongActivitiesService.addActivity({ playlistId, songId, userId}) 
  }

  async getSongsInPlaylistById(id) {
    const queryPlaylist = {
      text: "SELECT playlists.id, playlists.name, users.username FROM playlists LEFT JOIN users ON playlists.owner = users.id WHERE playlists.id = $1",
      values: [id],
    }

    const resultPlayist = await this._pool.query(queryPlaylist)

    if (!resultPlayist.rowCount) {
      throw new NotFoundError("Playlist tidak ditemukan")
    }

    const querySongInPlaylist = {
      text: "SELECT songs.id, songs.title, songs.performer FROM playlist_songs LEFT JOIN songs ON playlist_songs.song_id = songs.id WHERE playlist_songs.playlist_id = $1",
      values: [id]
    }

    const resultSongInPlaylist = await this._pool.query(querySongInPlaylist)

    const result = resultPlayist.rows[0]

    result.songs = resultSongInPlaylist.rows

    return result  
  }

  async deleteSongInPlaylist(playlistId, songId, userId) {
    await this._songsService.getSongById(songId)
    
    const query = {
      text: "DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id",
      values: [playlistId, songId],
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError("Lagu gagal dihapus dari playlist. Id tidak ditemukan")
    }

    // await this._playlistSongActivitiesService.addActivity({ playlist_id, song_id, user_id, action: "delete"})
    await this._playlistSongActivitiesService.addActivity({ playlistId, songId, userId, action: "delete"}) 
  }


  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: "SELECT * FROM playlists WHERE id = $1",
      values: [id],
    }

    const result = await this._pool.query(query)
    if (!result.rowCount) {
      throw new NotFoundError("Playlist tidak ditemukan")
    }
    
    const playlist = result.rows[0]
    if (playlist.owner !== owner) {
      throw new AuthorizationError("Anda tidak berhak mengakses resource ini")
    }
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId)
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error
      }
      try {
        await this._collaborationService.verifyCollaborator(playlistId, userId)
      } catch {
        throw error
      }
    }
  } 
}

module.exports = PlaylistsService
