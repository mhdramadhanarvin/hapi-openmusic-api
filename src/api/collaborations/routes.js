const routes = (handler) => [
  {
    method: "POST",
    path: "/collaborations",
    handler: (request, h) => handler.postCollaborationHandler(request, h),
    options: {
      auth: "openmusiapi_jwt",
    },
  },
  {
    method: "DELETE",
    path: "/collaborations",
    handler: (request) => handler.deleteCollaborationHandler(request),
    options: {
      auth: "openmusiapi_jwt",
    },
  },
]

module.exports = routes
