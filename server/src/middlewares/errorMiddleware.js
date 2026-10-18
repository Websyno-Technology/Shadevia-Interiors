const errorHandler = (error, req, res, next) => {
  console.error(error);
  if (error.name === 'MulterError') {
    const message = error.code === 'LIMIT_FILE_COUNT' ? 'A product can have a maximum of 10 images.' : 'Each image must be 5 MB or smaller.';
    return res.status(400).json({ message });
  }
  if (error.message === 'Only image files are allowed.') return res.status(400).json({ message: error.message });
  if (error.name === 'ValidationError') return res.status(400).json({ message: error.message });
  return res.status(500).json({ message: 'Something went wrong on the server.' });
};

module.exports = { errorHandler };
