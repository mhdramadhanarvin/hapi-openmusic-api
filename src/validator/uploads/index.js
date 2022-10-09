const InvariantError = require("../../exceptions/InvariantError")
const { ImageHeadersSchema } = require("./schema")

const UploadsValidator = {
  validateCoverUploadPayload: (headers) => {
    const validationResult = ImageHeadersSchema.validate(headers) 

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message)
    }  
  },
}

module.exports = UploadsValidator
