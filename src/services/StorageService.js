const fs = require("fs")

class StorageService {
  constructor(folder) {
    this._folder = folder

    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true })
    }
  }

  writeFile(file, meta, oldNameFile) {
    const extension = meta.filename
      .split(".")
      .filter(Boolean)
      .slice(1)
      .join(".")
    const filename = oldNameFile ?? +new Date() + "." + extension
    console.log({ filename, __filename })

    const path = `${this._folder}/${filename}`

    const fileStream = fs.createWriteStream(path)

    return new Promise((resolve, reject) => {
      fileStream.on("error", (error) => reject(error))
      file.pipe(fileStream)
      file.on("end", () => resolve(filename))
    })
  }
}

module.exports = StorageService
