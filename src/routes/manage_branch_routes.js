const { VERIFY_ADMIN_TOKEN } = require("../middleware/verify_webtoken");
const { FETCH_BRANCH_BY_ID } = require("../middleware/fetch_branches");
const { FETCH_ADMIN_INFO } = require("../middleware/fetch_admin_info");

const { UPDATE_BRANCH_STATUS } = require("../controllers/update_branch_status");
const { UPDATE_BRANCH_INFO } = require("../controllers/update_branch_info");
const {
  UPDATE_BRANCH_KEY,
  RESET_BRANCH_KEY,
} = require("../controllers/update_branch_key");

const { SEND_VERIFICATION_CODE } = require("../utils/send_email");
const fetchLoginHistory = require("../middleware/fetchLoginHistory");

const express = require("express");
const manage_branch_routes = express.Router();

// Example of handling the route with middleware
manage_branch_routes.get(
  "/admin/branch/:branchId",
  VERIFY_ADMIN_TOKEN,
  async (req, res) => {
    try {
      const branchId = req.params.branchId; // Get branchId from URL parameter

      // Fetch branch details (Assuming you have a function for this as well)
      const branch = await FETCH_BRANCH_BY_ID(branchId);

      // Fetch login history for the branch using the external function
      const loginHistory = await fetchLoginHistory(branchId);

      // Render the admin page with the specific branch data and login history
      res.render("admin_manage_branch", {
        branch,
        loginHistory,
      });
    } catch (error) {
      console.error(
        "[/admin/branch/:branchId] Error rendering admin page:",
        error
      );
      res.status(500).send("Internal Server Error"); // Handle server error if rendering fails
    }
  }
);

manage_branch_routes.post(
  "/admin/branch/update-branch-status",
  async (req, res) => {
    try {
      // Destructure branchId and branch_status from the request body
      const { id, branch_status } = req.body;

      // Call UPDATE_BRANCH_STATUS controller function
      const result = await UPDATE_BRANCH_STATUS(id, branch_status);

      // Return success message if operation succeeded
      res.status(200).json({
        success: true, // Send success status
        message: "Branch status updated successfully",
        data: result.data,
      });
    } catch (error) {
      console.error("[/update-branch-status]", error);
      res.status(500).json({
        success: false, // Indicate failure
        message: "Internal Server Error",
        error: error.message,
      });
    }
  }
);

manage_branch_routes.post(
  "/admin/branch/update-branch-info",
  async (req, res) => {
    try {
      const {
        id,
        branch_name,
        loc_province,
        loc_city,
        loc_baranggay,
        loc_street_name,
        loc_building,
        loc_house_number,
        personel_in_charge,
      } = req.body;

      const result = await UPDATE_BRANCH_INFO(
        id,
        branch_name,
        loc_province,
        loc_city,
        loc_baranggay,
        loc_street_name,
        loc_building,
        loc_house_number,
        personel_in_charge
      );

      if (result.success) {
        res.status(200).json({
          success: true,
          message: "Branch information updated successfully",
        });
      } else {
        res.status(400).json({ success: false, message: result.message });
      }
    } catch (error) {
      console.error("[/update-branch-info]", error);
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  }
);

manage_branch_routes.post(
  "/admin/branch/:branch_id/update-branch-key",
  async (req, res) => {
    // Extract branch_id from URL params
    const branchId = req.params.branch_id;

    // Extract old_branch_key and new_branch_key from request body
    const { old_branch_key, new_branch_key } = req.body;

    try {
      // Call the function to update the branch key
      const result = await UPDATE_BRANCH_KEY(
        branchId, // Pass the branchId
        old_branch_key,
        new_branch_key
      );

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

manage_branch_routes.get(
  "/admin/branch/:branch_id/forgot-branch-key",
  async (req, res) => {
    try {
      const adminInfo = await FETCH_ADMIN_INFO();

      res.render("admin_forgot_branch_key", { adminInfo });
    } catch (error) {
      console.error(
        "[/admin/branch/:branch_id/forgot-branch-key] Error rendering admin page:",
        error
      );
      res.status(500).send("Internal Server Error");
    }
  }
);

manage_branch_routes.post(
  "/admin/branch/:branch_id/forgot-branch-key/send-code",
  async (req, res) => {
    try {
      // Fetch admin info
      const adminInfoArray = await FETCH_ADMIN_INFO();
      const email = adminInfoArray[0]?.admin_email;

      // Send verification code and get the code
      const sendCode = await SEND_VERIFICATION_CODE(email);

      // Send the verification code as part of the response
      res.status(200).json({ success: true, verificationCode: sendCode });
    } catch (error) {
      console.error(
        "[/admin/branch/:branch_id/forgot-branch-key] Error sending verification code:",
        error
      );
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  }
);

manage_branch_routes.post(
  "/admin/branch/:branch_id/forgot-branch-key/update-branch-key",
  async (req, res) => {
    try {
      const { new_branch_key } = req.body;
      const branchId = req.params.branch_id;

      console.log(branchId);
      // Implement logic to update the branch key in the database
      const result = await RESET_BRANCH_KEY(branchId, new_branch_key);

      if (result.success) {
        res.status(200).json({ success: true, message: result.message });
      } else {
        res.status(400).json({ success: false, message: result.message });
      }
    } catch (error) {
      console.error(
        "[/admin/branch/:branch_id/forgot-branch-key/update-branch-key] Error updating branch key:",
        error
      );
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  }
);

module.exports = manage_branch_routes;
