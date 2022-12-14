const { nanoid } = require("nanoid")
const { Pool } = require("pg")
const InvariantError = require("../exceptions/InvariantError")
const NotFoundError = require("../exceptions/NotFoundError")
const AuthorizationError = require("../exceptions/AuthorizationError") 

class PlaylistsService {
  constructor(songsService, collaborationsService, playlistSongActivitiesService, cacheService) {
    this._pool = new Pool
    this._songsService = songsService
    this._collaborationService = collaborationsService
    this._playlistSongActivitiesService = playlistSongActivitiesService
    this._cacheService = cacheService
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

    await this._cacheService.delete(`playlists:${owner}`)

    return result.rows[0].id
  }

  async getPlaylists({owner}) {
    try {
      const jsonString = await this._cacheService.get(`playlists:${owner}`)
      const result = JSON.parse(jsonString)

      return { result, cache: true}
    } catch (error) {
      const queryPlaylistOwn = {
        text: "SELECT playlists.id, playlists.name, users.username FROM playlists LEFT JOIN users ON playlists.owner = users.id WHERE playlists.owner = $1",
        values: [owner],
      }
  
      const resultPlaylistOwn = await this._pool.query(queryPlaylistOwn)
  
      const queryPlaylistCollaborated = {
        text: "SELECT playlists.id, playlists.name, users.username FROM collaborations LEFT JOIN playlists ON collaborations.playlist_id = playlists.id LEFT JOIN users ON playlists.owner = users.id WHERE collaborations.user_id = $1",
        values: [owner],
      }
  
      const resultPlaylistCollaborated = await this._pool.query(queryPlaylistCollaborated) 

      const result = resultPlaylistOwn.rows.concat(resultPlaylistCollaborated.rows)
      
      await this._cacheService.set(`playlists:${owner}`, JSON.stringify(result))

      return { result, cache: false }
    }
  } 

  async deletePlaylistById(id) {
    const query = {
      text: "DELETE FROM playlists WHERE id = $1 RETURNING id, owner",
      values: [id],
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError("Playlist gagal dihapus. Id tidak ditemukan")
    }

    await this._cacheService.delete(`playlists:${result.rows[0].owner}`) 
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
