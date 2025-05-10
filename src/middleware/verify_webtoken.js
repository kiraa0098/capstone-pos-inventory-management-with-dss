const jwt = require("jsonwebtoken");
const ADMIN_SECRET_KEY = "ADMIN_SECRET_KEY"; // Should match the one used during token generation
const BRANCH_SECRET_KEY = "BRANCH_SECRET_KEY";
function VERIFY_ADMIN_TOKEN(req, res, next) {
  const token = req.cookies.token || ""; // Read token from cookies
  if (!token) {
    // No token provided, redirect to login
    return res.redirect("/login");
  }

  try {
    const decoded = jwt.verify(token, ADMIN_SECRET_KEY);
    req.user = decoded; // Attach user data to request
    next();
  } catch (error) {
    console.error("[VERIFY_ADMIN_TOKEN] Error:", error.message);
    // Invalid token, redirect to login
    return res.redirect("/login");
  }
}

function VERIFY_BRANCH_TOKEN(req, res, next) {
  const token = req.cookies.token || ""; // Read token from cookies
  if (!token) {
    // No token provided, redirect to login
    return res.redirect("/login");
  }

  try {
    const decoded = jwt.verify(token, BRANCH_SECRET_KEY);
    req.user = decoded; // Attach user data to request
    next();
  } catch (error) {
    console.error("[BRANCH_SECRET_KEY] Error:", error.message);
    // Invalid token, redirect to login
    return res.redirect("/login");
  }
}

module.exports = { VERIFY_ADMIN_TOKEN, VERIFY_BRANCH_TOKEN };
