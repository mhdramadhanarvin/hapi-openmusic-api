const InvariantError = require("../../exceptions/InvariantError")
const { PlaylistPayloadSchema, PlaylistSongPayloadSchema } = require("./schema")

const PlaylistsValidator = {
  validatePostPlaylistPayload: (payload) => {
    const validationResult = PlaylistPayloadSchema.validate(payload)

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message)
    }
  },
  validatePlaylistSongsPayload: (payload) => {
    const validationResult = PlaylistSongPayloadSchema.validate(payload)

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message)
    }
  }
}

module.exports = PlaylistsValidator
