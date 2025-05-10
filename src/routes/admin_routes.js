const express = require("express");

const admin_routes = express.Router();

// Create a router instance for admin routes
const { LOGIN_ADMIN } = require("../controllers/login_admin");
const { ADD_BRANCH } = require("../controllers/add_branch"); // Import login handler function
const { VERIFY_ADMIN_TOKEN } = require("../middleware/verify_webtoken"); // Import middleware for verifying JWT token
const LOGIN_LIMITER = require("../middleware/login_limiter");
const { FETCH_BRANCHES } = require("../middleware/fetch_branches");
const {
  FETCH_TODAYS_SALES_PER_BRANCH,
} = require("../middleware/fetch_order_sale");

// Route to render admin page (protected by token verification middleware)
admin_routes.get(
  "/admin/branch",
  VERIFY_ADMIN_TOKEN,
  FETCH_BRANCHES,
  async (req, res) => {
    // Change the route handler to be async
    try {
      // Fetch today's sales for branches
      const todaysSales = await FETCH_TODAYS_SALES_PER_BRANCH();
      const today = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long", // Full month name
        day: "2-digit",
      }); // Format today's date
      // Pass the fetched data to the template, including today's sales
      res.render("admin_branches", {
        branches: req.branches,
        todaysSales,
        today, // Pass today's sales data to the template
      });

      console.log("todaysSales:", todaysSales);
    } catch (error) {
      console.error("[/admin/branch] Error rendering admin page:", error);
      res.status(500).send("Internal Server Error"); // Handle server error if rendering fails
    }
  }
);

admin_routes.get("/admin/branch/add-branch", VERIFY_ADMIN_TOKEN, (req, res) => {
  try {
    res.render("admin_add_branch"); // Pass the fetched data to the template
  } catch (error) {
    console.error(
      "[/admin/branch/add-branch] Error rendering admin page:",
      error
    );
    res.status(500).send("Internal Server Error"); // Handle server error if rendering fails
  }
});

// Route to handle admin login with rate limiter
admin_routes.post("/login/admin", LOGIN_LIMITER, async (req, res) => {
  const { email, password } = req.body;

  try {
    const token = await LOGIN_ADMIN(email, password); // Call controller function LOGIN_ADMIN to authenticate
    res.cookie("token", token, { httpOnly: true }); // Set HTTP-only cookie with token for authentication
    return res.status(200).json({ token }); // Send token in JSON response on successful login
  } catch (error) {
    console.error("[/login/admin] Error:", error.message || error);

    // Handle specific errors
    if (error.message === "Email not found") {
      res.status(404).json({ error: "Email not found" }); // JSON response for 404 (email not found)
    } else if (error.message === "Incorrect password") {
      res.status(401).json({ error: "Incorrect password" }); // JSON response for 401 (incorrect password)
    } else {
      res.status(500).json({ error: "Login failed. Please try again." }); // JSON response for other errors
    }
  }
});

// Route to handle admin logout
admin_routes.post("/logout/admin", (req, res) => {
  try {
    // Clear the token by setting an empty cookie with an expired date
    res.clearCookie("token"); // Clear the token cookie
    res.json({ message: "Logout successful" }); // Send JSON response indicating successful logout
  } catch (error) {
    console.error("[/logout/admin] Error: ", error);
    res.status(500).json({ error: "Logout failed" }); // Handle server error if logout fails
  }
});

admin_routes.post("/add-branch", async (req, res) => {
  try {
    const {
      branchName,
      province,
      city,
      baranggay,
      streetName,
      building,
      houseNumber,
      branchKey,
    } = req.body;

    const savedBranch = await ADD_BRANCH(
      branchName,
      province,
      city,
      baranggay,
      streetName,
      building,
      houseNumber,
      branchKey
    );

    // Check if the response indicates failure
    if (!savedBranch.success) {
      return res.status(400).json({ error: savedBranch.message }); // Return the message from ADD_BRANCH
    }

    res.status(200).json(savedBranch.data); // Respond with saved branch data if needed
  } catch (error) {
    console.error("[/add-branch] Error:", error.message);
    if (error.message.includes("Branch key already exists")) {
      res.status(400).json({ error: "Branch key already exists" });
    } else if (error.message.includes("Supabase error fetching branch keys")) {
      res.status(500).json({ error: "Error fetching branch keys" });
    } else if (error.message.includes("Supabase error inserting branch")) {
      res.status(500).json({ error: "Error inserting branch" });
    } else {
      res.status(500).json({ error: "Add branch error" });
    }
  }
});

module.exports = admin_routes; // Export the admin_routes router for use in main Express app
