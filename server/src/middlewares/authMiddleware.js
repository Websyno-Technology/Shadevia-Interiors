const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    const token = req.cookies?.shadevia_token || req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Authentication is required.' });

    const { userId } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(userId).select('name email');
    if (!user) return res.status(401).json({ message: 'The user for this token no longer exists.' });

    req.user = { id: user._id, name: user.name, email: user.email };
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Your session is invalid or has expired. Please sign in again.' });
  }
};

module.exports = { protect };
