const routes = (handler) => [
  {
    method: "POST",
    path: "/albums/{albumId}/likes",
    handler: (request, h) => handler.postAlbumLikesByIdHandler(request, h),
    options: {
      auth: "openmusiapi_jwt",
    },
  },
  {
    method: "GET",
    path: "/albums/{albumId}/likes", 
    handler: (request, h) => handler.getAlbumLikesByIdHandler(request, h)
  },
]

module.exports = routes