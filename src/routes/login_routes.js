const supabase = require("../services/database");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { SEND_VERIFICATION_CODE } = require("../utils/send_email");
const { SIGNUP_ADMIN } = require("../controllers/signup_admin");
const {
  CHECK_IF_ADMIN_ALREADY_SETUP,
} = require("../middleware/if_admin_setup");
const { FETCH_ADMIN_INFO } = require("../middleware/fetch_admin_info");
const {
  LOGIN_BRANCH,
  logLoginHistory,
} = require("../controllers/login_branch");
const {
  FETCH_ACTIVE_BRANCHES,
  FETCH_BRANCH_BY_ID,
} = require("../middleware/fetch_branches");

const { Router } = require("express");
const login_routes = Router(); // Create a router instance for login routes

const resetRequests = {};

// Route to render login page with check if admin setup middleware
login_routes.get("/login", CHECK_IF_ADMIN_ALREADY_SETUP, async (req, res) => {
  try {
    const adminExists = req.adminExists;

    console.log("Admin Exists: ", adminExists);

    const activeBranches = await FETCH_ACTIVE_BRANCHES();

    res.render("login", { adminExists, branches: activeBranches }); // Render login page if admin exists
    res.status(200); // Set response status to 200 (OK)
  } catch (error) {
    console.error("[/login] Error rendering login page: ", error);
    res.status(500); // Handle server error with status code 500 (Internal Server Error)
  }
});

login_routes.get("/admin/forgot-password", (req, res) => {
  try {
    res.render("admin_forgot_password"); // Render forgot password page
  } catch (error) {
    console.error(
      "[/admin/forgot-password] Error rendering forgot password page: ",
      error
    );
    res.status(500); // Handle server error with status code 500 (Internal Server Error)
  }
});

login_routes.post("/admin/send-confirmation-link", async (req, res) => {
  try {
    const adminInfo = await FETCH_ADMIN_INFO();

    if (Array.isArray(adminInfo) && adminInfo.length > 0) {
      const { admin_email } = adminInfo[0];

      console.log("Admin Email:", admin_email);

      // Send the verification code
      const verificationCode = await SEND_VERIFICATION_CODE(admin_email);

      // Respond with success
      res.status(200).json({
        message: "Verification code sent successfully.",
        verificationCode,
      });
    } else {
      console.error("No admin info found.");
      res.status(404).json({ error: "Admin email not found." });
    }
  } catch (error) {
    console.error("[/admin/send-confirmation-link] Error:", error);
    res.status(500).json({ error: "Failed to send the verification code." });
  }
});

login_routes.post("/admin/reset-password", async (req, res) => {
  const { newPassword } = req.body;

  const getEmail = async () => {
    const adminInfo = await FETCH_ADMIN_INFO();

    if (Array.isArray(adminInfo) && adminInfo.length > 0) {
      // Destructure to extract email
      const { admin_email } = adminInfo[0];
      console.log("Admin Email:", admin_email);
      return admin_email;
    } else {
      console.error("No admin info found.");
      return null; // Handle empty or invalid response
    }
  };

  const email = await getEmail();

  try {
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const { data, error } = await supabase
      .from("admin")
      .update({ admin_password: hashedPassword })
      .eq("admin_email", email);

    res.redirect("/admin/password-reset");
    return true; // Password updated successfully
  } catch (error) {
    console.error("[/admin/reset-password] Error:", error);
    res.status(500).json({ message: "Failed to reset password." });
  }
});

login_routes.get("/admin/password-reset", (req, res) => {
  try {
    res.render("password_is_reset_page"); // Render password reset page
  } catch (error) {
    console.error(
      "[/admin/password-reset] Error rendering password reset page: ",
      error
    );
    res.status(500); // Handle server error with status code 500 (Internal Server Error)
  }
});

// Route to send verification code to email
login_routes.post("/send-verification-code", async (req, res) => {
  const { email } = req.body;
  console.log("Received Email: ", email);

  try {
    // Send verification code to the email using SEND_VERIFICATION_CODE function
    const verificationCode = await SEND_VERIFICATION_CODE(email);

    // Respond with success and the verification code in JSON format
    res.status(200).json({ verificationCode });
  } catch (error) {
    console.error(
      "[/send-verification-code] Error sending verification code: ",
      error
    );
    res.status(401); // Handle unauthorized or other errors with status code 401 (Unauthorized)
  }
});

// Route to handle admin setup
login_routes.post("/setup-admin", async (req, res) => {
  const { email, firstName, lastName, password } = req.body;
  console.log("Received Email: ", email);
  console.log("Received First Name: ", firstName);
  console.log("Received Last Name: ", lastName);
  console.log("Received Password: ", password);

  try {
    // Call SIGNUP_ADMIN function to register new admin
    const result = await SIGNUP_ADMIN(email, firstName, lastName, password);

    // Redirect to login page with status code 303 (See Other)
    res.redirect(303, "/login");
  } catch (error) {
    console.error("[/setup-admin] Error in setup admin route:", error);
    res.status(401); // Handle unauthorized or other errors with status code 401 (Unauthorized)
  }
});

login_routes.post("/login/branch", async (req, res) => {
  const { branch_name, branch_key } = req.body;

  try {
    const result = await LOGIN_BRANCH(branch_name, branch_key);

    console.log("Login result:", result);

    // Store token and branchId in cookies
    res.cookie("token", result.token, { httpOnly: true });
    res.cookie("branchId", result.branch_id, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    return res.status(200).json(result); // Successful login
  } catch (error) {
    console.error("Error during login:", error.message);
    return res.status(401).json({ error: error.message });
  }
});

login_routes.post("/logout/branch", async (req, res) => {
  try {
    // Retrieve branch ID from cookies
    const branchId = req.cookies.branchId;

    const branch = await FETCH_BRANCH_BY_ID(branchId);

    const action = "logged out";

    await logLoginHistory(
      branch.branch_id,
      branch.branch_name,
      branch.personel_in_charge,
      action
    );

    if (!branchId) {
      return res.status(400).json({ error: "Branch ID not found in cookies." });
    }

    // Clear the token and branch ID cookies upon logout
    res.clearCookie("token");
    res.clearCookie("branchId");

    // Send a success response
    res.json({ message: "Logout successful", branchId });
  } catch (error) {
    console.error("[/logout/branch] Error: ", error);
    res.status(500).json({ error: "Logout failed" });
  }
});

module.exports = login_routes; // Export the login_routes router for use in main Express app
