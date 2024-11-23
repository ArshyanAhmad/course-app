const ApiError = require("../utils/ApiError");
const jwt = require("jsonwebtoken");

function userMiddleware(req, res, next) {
  // Implement user auth logic
  // You need to check the headers and validate the user from the user DB. Check readme for the exact headers to be expected

  const token = req.headers.authorization;
  const word = token.split(" ");
  const jwtToken = word[1];

  try {
    if (!jwtToken) {
      next(new ApiError(400, "Invalid Token"));
    }

    const decoded = jwt.verify(jwtToken, "secret-key");
    if (decoded.username) {
      req.user = decoded.username;
      next();
    } else {
      next(new ApiError(400, "user not authenticated"));
    }
  } catch (error) {
    next(new ApiError(400, "Invalid Input"));
  }
}

module.exports = userMiddleware;
