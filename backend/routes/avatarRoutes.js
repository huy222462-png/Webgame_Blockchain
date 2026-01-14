const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

const router = express.Router()

const uploadsDir = path.join(__dirname, '..', 'uploads')
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir)
  },
  filename: function (req, file, cb) {
    const address = req.params.address || 'anon'
    const ext = path.extname(file.originalname) || '.png'
    const name = `${address}-${Date.now()}${ext}`
    cb(null, name)
  }
})

const upload = multer({ storage })

// POST /api/avatar/:address  (multipart form-data, field name: avatar)
router.post('/:address', upload.single('avatar'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, error: 'No file uploaded' })
  const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
  return res.json({ success: true, url })
})

module.exports = router
