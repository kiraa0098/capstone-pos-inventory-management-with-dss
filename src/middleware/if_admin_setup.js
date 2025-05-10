const supabase = require("../services/database");

// Check if admin exists in the database
async function CHECK_IF_ADMIN_ALREADY_SETUP(req, res, next) {
  try {
    // Query the admin table
    const { data: admins, error } = await supabase.from("admin").select("*");

    if (error) {
      console.error("[CHECK_IF_ADMIN_ALREADY_SETUP] Database error:", error);
      // Return an error response instead of throwing an error
      return res.status(500).json({
        error: "Network error. Please try again later.",
      });
    }

    // If admins exist, set a property on the request object to indicate admin existence
    req.adminExists = admins && admins.length > 0;

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.error("[CHECK_IF_ADMIN_ALREADY_SETUP] Error:", error);
    // Return a generic error response
    return res
      .status(500)
      .json({ error: "An unexpected error occurred. Please try again later." });
  }
}

module.exports = {
  CHECK_IF_ADMIN_ALREADY_SETUP,
};
