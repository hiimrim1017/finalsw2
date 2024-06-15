const filesPayloadExists = (req, res, next) => {
    if (!req.files) return response.status(400).json({ status: "error", message: "Missing files"})

        next()
}

module.exports = filesPayloadExist
