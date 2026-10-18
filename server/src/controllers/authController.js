const User = require('../models/User');
const { sendAuthResponse } = require('../utils/token');

const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email, and password are required.' });
    if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters.' });

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) return res.status(409).json({ message: 'An account with this email already exists.' });

    const user = await User.create({ name, email, password });
    return sendAuthResponse(res, 201, user);
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' });

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Incorrect email or password.' });
    }

    return sendAuthResponse(res, 200, user);
  } catch (error) {
    return next(error);
  }
};

const getCurrentUser = (req, res) => res.json({ user: req.user });

const logout = (req, res) => {
  res.clearCookie('shadevia_token', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
  res.status(204).send();
};

module.exports = { signup, login, getCurrentUser, logout };
