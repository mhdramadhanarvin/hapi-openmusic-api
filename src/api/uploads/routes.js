const path = require("path")

const routes = (handler) => [
  {
    method: "POST",
    path: "/albums/{id}/covers",
    handler: (request, h) => handler.uploadAlbumsCoverByIdHandler(request, h),
    options: { 
      payload: {
        allow: "multipart/form-data",
        multipart: true,
        output: "stream",
        maxBytes: 512000
      },
    },
  },
  {
    method: "GET",
    path: "/cover/{param*}",
    handler: {
      directory: {
        path: path.resolve(__dirname, "file/images"),
      },
    },
  },
]

module.exports = routes