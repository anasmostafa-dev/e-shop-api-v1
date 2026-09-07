const jwt = require("jsonwebtoken");

const generateToken = (payload) => {
  return jwt.sign({ userId: payload }, process.env.SECRET_KEY, {
    expiresIn: process.env.EXPIRES_IN_TOKEN,
  });
};

module.exports = generateToken;
