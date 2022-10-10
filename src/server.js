require("dotenv").config()

const Hapi = require("@hapi/hapi")
const Jwt = require("@hapi/jwt")
const Inert = require("@hapi/inert")
const path = require("path")

const albums = require("./api/albums")
const songs = require("./api/songs")
const users = require("./api/users")
const authentications = require("./api/authentications")
const playlists = require("./api/playlists")
const collaborations = require("./api/collaborations")
const _exports  = require("./api/exports")
const uploads = require("./api/uploads")
const albumLikes = require("./api/album_likes")

const ClientError = require("./exceptions/ClientError")

const AlbumsService = require("./services/AlbumsService")
const SongsService = require("./services/SongsService")
const UsersService = require("./services/UsersService")
const AuthenticationsService = require("./services/AuthenticationsService")
const PlaylistsService = require("./services/PlaylistsService")
const CollaborationsService = require("./services/CollaborationsService")  
const PlaylistSongActivitiesService = require("./services/PlaylistSongActivitiesService")
const StorageService = require("./services/StorageService")
const AlbumLikesService = require("./services/AlbumLikesService")

const AlbumsValidator = require("./validator/albums")
const SongsValidator = require("./validator/songs")
const UsersValidator = require("./validator/users")
const AuthenticationsValidator = require("./validator/authentications")
const PlaylistsValidator = require("./validator/playlists")
const CollaborationssValidator = require("./validator/collaborations")
const ExportsValidator = require("./validator/exports")
const UploadsValidator = require("./validator/uploads") 

const TokenManager = require("./tokenize/TokenManager") 
const CacheService = require("./services/CacheService")
const config = require("./utils/config")

const init = async () => {
  const songsService = new SongsService()
  const albumsService = new AlbumsService(songsService)
  const usersService = new UsersService()
  const authenticationsService = new AuthenticationsService()
  const collaborationsService = new CollaborationsService()
  const playlistSongActivitiesService = new PlaylistSongActivitiesService()
  const playlistsService = new PlaylistsService(songsService, collaborationsService, playlistSongActivitiesService)
  const ProducerService = require("./services/ProducerService")
  const storageService = new StorageService(path.resolve(__dirname, "api/uploads/file/images"))
  const cacheService = new CacheService() 
  const albumLikesService = new AlbumLikesService(albumsService, cacheService) 

  const server = Hapi.server({
    port: config.app.port,
    host: config.app.host,
    routes: {
      cors: {
        origin: ["*"],
      },
    },
  })

  await server.register([
    {
      plugin: Jwt,
    },
    {
      plugin: Inert,
    },
  ])

  server.auth.strategy("openmusiapi_jwt", "jwt", {
    keys: config.jwt.access_token_key,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: config.jwt.access_token_age,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.userId,
      },
    }),
  })

  await server.register([
    {
      plugin: albums,
      options: {
        service: albumsService,
        validator: AlbumsValidator,
      },
    },
    {
      plugin: songs,
      options: {
        service: songsService,
        validator: SongsValidator,
      },
    },
    {
      plugin: users,
      options: {
        service: usersService,
        validator: UsersValidator,
      },
    },
    {
      plugin: authentications,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
      },
    },
    {
      plugin: playlists,
      options: {
        playlistsService,
        playlistSongActivitiesService,
        validator: PlaylistsValidator,
      },
    },
    {
      plugin: collaborations,
      options: {
        collaborationsService,
        playlistsService,
        usersService,
        validator: CollaborationssValidator,
      },
    },
    {
      plugin: _exports,
      options: {
        ProducerService,  
        playlistsService,
        validator: ExportsValidator,
      },
    },
    {
      plugin: uploads,
      options: {
        storageService,
        albumsService,
        validator: UploadsValidator,
      },
    },
    {
      plugin: albumLikes,
      options: {
        albumLikesService,
        albumsService
      },
    },
  ]) 

  server.ext("onPreResponse", (request, h) => {
    // mendapatkan konteks response dari request
    const { response } = request
    if (response instanceof Error) {
 
      // penanganan client error secara internal.
      if (response instanceof ClientError) {
        const newResponse = h.response({
          status: "fail",
          message: response.message,
        })
        newResponse.code(response.statusCode)
        return newResponse
      }
      // mempertahankan penanganan client error oleh hapi secara native, seperti 404, etc.
      if (!response.isServer) {
        return h.continue
      }
      // penanganan server error sesuai kebutuhan 
      console.log(response)
      const newResponse = h.response({
        status: "error",
        message: "terjadi kegagalan pada server kami",
      })
      newResponse.code(500)
      return newResponse
    }
    // jika bukan error, lanjutkan dengan response sebelumnya (tanpa terintervensi)
    return h.continue
  })
 
  await server.start()
  console.log(`Server berjalan pada ${server.info.uri}`) 
}

init()
