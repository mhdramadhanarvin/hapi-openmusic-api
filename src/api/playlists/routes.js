const routes = (handler) => [
  {
    method: "POST",
    path: "/playlists",
    handler: (request, h) => handler.postPlaylistHandler(request, h),
    options: {
      auth: "openmusiapi_jwt",
    },
  },
  {
    method: "GET",
    path: "/playlists",
    handler: (request) => handler.getPlaylistsHandler(request),
    options: {
      auth: "openmusiapi_jwt",
    },
  },
  {
    method: "DELETE",
    path: "/playlists/{id}",
    handler: (request) => handler.deletePlaylistByIdHandler(request),
    options: {
      auth: "openmusiapi_jwt",
    },
  },
  {
    method: "POST",
    path: "/playlists/{id}/songs",
    handler: (request, h) => handler.postSongToPlaylistByIdHandler(request, h),
    options: {
      auth: "openmusiapi_jwt",
    },
  },
  {
    method: "GET",
    path: "/playlists/{id}/songs",
    handler: (request) => handler.getSongInPlaylistByIdHandler(request),
    options: {
      auth: "openmusiapi_jwt",
    },
  },
  {
    method: "DELETE",
    path: "/playlists/{id}/songs",
    handler: (request) => handler.deleteSongFromPlaylistByIdHandler(request),
    options: {
      auth: "openmusiapi_jwt",
    },
  },
]

module.exports = routes
