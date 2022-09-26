require("dotenv").config()

const Hapi = require("@hapi/hapi")
const Jwt = require("@hapi/jwt")
const albums = require("./api/albums")
const songs = require("./api/songs")
const users = require("./api/users")
const authentications = require("./api/authentications")
const playlists = require("./api/playlists")
const ClientError = require("./exceptions/ClientError")
const AlbumsService = require("./services/AlbumsService")
const SongsService = require("./services/SongsService")
const UsersService = require("./services/UsersService")
const AuthenticationsService = require("./services/AuthenticationsService")
const PlaylistsService = require("./services/PlaylistsService")
const AlbumsValidator = require("./validator/albums")
const SongsValidator = require("./validator/songs")
const UsersValidator = require("./validator/users")
const AuthenticationsValidator = require("./validator/authentications")
const PlaylistsValidator = require("./validator/playlists")

const TokenManager = require("./tokenize/TokenManager")

const init = async () => {
  const albumsService = new AlbumsService()
  const songsService = new SongsService()
  const usersService = new UsersService()
  const authenticationsService = new AuthenticationsService()
  const playlistsService = new PlaylistsService()

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
  ])

  server.ext("onPreResponse", (request, h) => {
    // mendapatkan konteks response dari request
    const { response } = request
    if (response instanceof ClientError) {
      // membuat response baru dari response toolkit sesuai kebutuhan error handling
      const newResponse = h.response({
        status: "fail",
        message: response.message,
      })

      newResponse.code(response.statusCode)
      return newResponse
    }

    // jika bukan ClientError, lanjutkan dengan response sebelumnya (tanpa terintervensi)
    return response.continue || response
  })

  await server.start()
  console.log(`Server berjalan pada ${server.info.uri}`)
}

init()
