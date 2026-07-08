const jwt = require("jsonwebtoken");

// Checks the Authorization header for a valid JWT and attaches the user id to req
function protect(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Not authorized, no token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ message: "Not authorized, token invalid or expired" });
  }
}

module.exports = protect;
