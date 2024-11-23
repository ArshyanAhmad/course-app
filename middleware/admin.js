const jwt = require("jsonwebtoken");
const ApiError = require("../utils/ApiError");

// Middleware for handling auth
function adminMiddleware(req, res, next) {
  // Implement admin auth logic
  // You need to check the headers and validate the admin from the admin DB. Check readme for the exact headers to be expected

  const token = req.headers.authorization;
  const word = token.split(" ");
  const jwtToken = word[1];

  try {
    const decoded = jwt.verify(jwtToken, "secret-key");
    if (decoded.username) {
      next();
    } else {
      res.status(403).json({
        msg: "You are not authenticated",
      });
    }
  } catch (error) {
    next(new ApiError(400, "Incorrect Inputs"));
  }
}

module.exports = adminMiddleware;
