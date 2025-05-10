const rateLimit = require("express-rate-limit");

const login_limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login requests per windowMs
  message: "Too many login attempts, please try again later.",
  handler: (req, res) => {
    res
      .status(429)
      .json({ error: "Too many login attempts, please try again later." });
  },
});

module.exports = login_limiter;
