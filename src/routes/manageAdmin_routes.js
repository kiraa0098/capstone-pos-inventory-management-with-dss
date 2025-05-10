const { Router } = require("express");
const { VERIFY_ADMIN_TOKEN } = require("../middleware/verify_webtoken");
const {
  renderManageAdminPage,
  updateAdmin, // Import editAdmin
  changePassword, //Import changepass
} = require("../controllers/manage_admin_controller");

const manageAdmin_routes = Router(); // Create a router instance for manage admin routes

// Route to render the manage admin page
manageAdmin_routes.get("/admin/manageAdmin", VERIFY_ADMIN_TOKEN, renderManageAdminPage);

// Route to edit an admin
manageAdmin_routes.put("/api/admins/:id", VERIFY_ADMIN_TOKEN, updateAdmin);

manageAdmin_routes.put("/api/admins/:id/change-password", VERIFY_ADMIN_TOKEN, changePassword);

// Export the router for use in the main Express app
module.exports = manageAdmin_routes;
