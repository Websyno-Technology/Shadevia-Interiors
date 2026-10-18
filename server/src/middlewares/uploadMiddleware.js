const multer = require('multer');

const imageFilter = (req, file, callback) => {
  if (file.mimetype.startsWith('image/')) return callback(null, true);
  return callback(new Error('Only image files are allowed.'));
};

const upload = multer({ storage: multer.memoryStorage(), fileFilter: imageFilter, limits: { files: 10, fileSize: 5 * 1024 * 1024 } });

module.exports = { upload };
