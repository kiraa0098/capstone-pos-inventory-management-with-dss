const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const supabase = require("../services/database");

async function LOGIN_ADMIN(email, password) {
  try {
    // Retrieve admin data from Supabase based on email
    const { data: admins, error } = await supabase
      .from("admin")
      .select("*")
      .eq("admin_email", email);

    // Handle database query errors
    if (error) {
      console.error("[LOGIN_ADMIN] Database error:", error.message);
      throw new Error("Failed to retrieve admin data");
    }

    // Check if admin with the provided email exists
    if (!admins || admins.length === 0) {
      console.error("[LOGIN_ADMIN] Admin not found for email:", email);
      throw new Error("Email not found");
    }

    // Retrieve the first admin (assuming unique emails)
    const admin = admins[0];

    // Compare the provided password with hashed password stored in the database
    const passwordMatch = await bcrypt.compare(password, admin.admin_password);

    // Handle incorrect password
    if (!passwordMatch) {
      console.error("[LOGIN_ADMIN] Incorrect password for email:", email);
      throw new Error("Incorrect password");
    }

    // Generate a JSON Web Token (JWT) for authenticated admin
    const ADMIN_SECRET_KEY = "ADMIN_SECRET_KEY"; // Replace with your actual secret key
    const token = jwt.sign(
      { id: admin.id, email: admin.admin_email, role: "admin" },
      ADMIN_SECRET_KEY,
      { expiresIn: "1h" } // Token expires in 1 hour
    );

    return token; // Return JWT token on successful authentication
  } catch (error) {
    // Propagate specific errors for "Email not found" or "Incorrect password"
    if (
      error.message === "Email not found" ||
      error.message === "Incorrect password"
    ) {
      throw error;
    }

    // Handle and log generic errors
    console.error("[LOGIN_ADMIN] Error:", error.message || error);
    throw new Error("Login failed. Please try again."); // Generic error message for other cases
  }
}

module.exports = {
  LOGIN_ADMIN,
};
