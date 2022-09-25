const routes = (handler) => [
  {
    method: "POST",
    path: "/playlists",
    handler: (request, h) => handler.postPlaylistHandler(request, h),
    options: {
      auth: "openmusiapi_jwt",
    },
  },
  // {
  //   method: "GET",
  //   path: "playlists",
  //   handler: () => handler.getPlaylistsHandler(),
  // },
  // {
  //   method: "DELETE",
  //   path: "playlists/{id}",
  //   handler: (request, h) => handler.deletePlaylistByIdHandler(request, h),
  // },
  // {
  //   method: "POST",
  //   path: "playlists/{id}/songs",
  //   handler: (request, h) => handler.postSongToPlaylistByIdHandler(request, h),
  // },
  // {
  //   method: "GET",
  //   path: "playlists/{id}/songs",
  //   handler: (request, h) => handler.getSongInPlaylistByIdHandler(request, h),
  // },
  // {
  //   method: "DELETE",
  //   path: "playlists/{id}/songs",
  //   handler: (request, h) => handler.deleteSongFromPlaylistByIdHandler(request, h),
  // },
]

module.exports = routes
