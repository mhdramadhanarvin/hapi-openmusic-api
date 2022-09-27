require("dotenv").config()

const Hapi = require("@hapi/hapi")
const Jwt = require("@hapi/jwt")
const albums = require("./api/albums")
const songs = require("./api/songs")
const users = require("./api/users")
const authentications = require("./api/authentications")
const playlists = require("./api/playlists")
const collaborations = require("./api/collaborations")
const ClientError = require("./exceptions/ClientError")
const AlbumsService = require("./services/AlbumsService")
const SongsService = require("./services/SongsService")
const UsersService = require("./services/UsersService")
const AuthenticationsService = require("./services/AuthenticationsService")
const PlaylistsService = require("./services/PlaylistsService")
const CollaborationsService = require("./services/CollaborationsService")
const AlbumsValidator = require("./validator/albums")
const SongsValidator = require("./validator/songs")
const UsersValidator = require("./validator/users")
const AuthenticationsValidator = require("./validator/authentications")
const PlaylistsValidator = require("./validator/playlists")
const CollaborationssValidator = require("./validator/collaborations")

const TokenManager = require("./tokenize/TokenManager")

const init = async () => {
  const albumsService = new AlbumsService()
  const songsService = new SongsService()
  const usersService = new UsersService()
  const authenticationsService = new AuthenticationsService()
  const playlistsService = new PlaylistsService()
  const collaborationsService = new CollaborationsService()

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
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
  ])

  server.auth.strategy("openmusiapi_jwt", "jwt", {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
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
        service: playlistsService,
        validator: PlaylistsValidator,
      },
    },
    {
      plugin: collaborations,
      options: {
        service: collaborationsService,
        validator: CollaborationssValidator,
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
