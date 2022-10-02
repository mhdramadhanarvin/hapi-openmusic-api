const routes = (handler) => [
  {
    method: "POST",
    path: "/export/playlists/{playlistId}",
    handler: (request, h) => handler.postExportPlaylistByIdHandler(request, h),
    options: {
      auth: "openmusiapi_jwt",
    },
  },
]

module.exports = routes
