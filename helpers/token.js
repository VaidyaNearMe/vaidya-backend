const jwt = require("jsonwebtoken");

const generateAccessToken = (user) => {
  const secret = process.env.JWT_SECRET;
  const accessToken = jwt.sign(user, secret, { expiresIn: "365d" });
  return accessToken;
};

const verifyAccessToken = (accessToken) => {
  try {
    const secret = process.env.JWT_SECRET;
    const decoded = jwt.verify(accessToken.split(" ")[1], secret);
    return decoded;
  } catch (error) {
    return null;
  }
};

module.exports = { generateAccessToken, verifyAccessToken };
