const ErrorHander = require("./errorhander");
const catchAsyncErrors = require("../errors/catchAsyncErrors")
const { isTokenValid } = require("../utils");
const { verifyAccessToken } = require("../helpers/token");

const authenticateUser = catchAsyncErrors(async (req, res, next) => {
  const authorizationHeader = req.headers.authorization;
  if (!authorizationHeader) {
    return next(new ErrorHander("Please Login to access this resource"))
  }
  var bearer = authorizationHeader.split(" ");
  token = bearer[1];
  const { name, userId, role } = isTokenValid({ token });
  req.user = { name, userId, role };
  next()
})

const authorizePermission = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new ErrorHander(`${req.user.role} is note allowed to access this resouce`, 403));
    }
    next();
  };
};

const protectRoute = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ message: "Sorry you are not authorized" });
  const user = verifyAccessToken(token);

  const userId = user?.userId;
  if (!userId) return res.status(401).json({ message: "Sorry you are not authorized" });
  req.user = user;
  req.id = userId;
  next();
};

const allowAccess = (roles = []) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role))
      return res.status(401).json({ message: "Sorry you are not authorized" });
    next();
  };
};

module.exports = {
  authenticateUser,
  authorizePermission,
  protectRoute,
  allowAccess
}