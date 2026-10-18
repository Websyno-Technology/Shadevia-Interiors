const jwt = require('jsonwebtoken');

const tokenExpiresIn = '3d';
const cookieMaxAge = 3 * 24 * 60 * 60 * 1000;

const signToken = (userId) => jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: tokenExpiresIn });

const sendAuthResponse = (res, statusCode, user) => {
  const token = signToken(user._id.toString());
  res
    .status(statusCode)
    .cookie('shadevia_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: cookieMaxAge
    })
    .json({
      user: { id: user._id, name: user.name, email: user.email },
      expiresIn: tokenExpiresIn
    });
};

module.exports = { sendAuthResponse };
