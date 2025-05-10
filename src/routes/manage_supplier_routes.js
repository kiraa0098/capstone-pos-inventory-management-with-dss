const { VERIFY_ADMIN_TOKEN } = require("../middleware/verify_webtoken");
const { Router } = require("express");
const {
  getAllSuppliers,
  addSupplier,
  editSupplier,
  deleteSupplier,
  updateSupplierDetails,
  getSupplierDetails,
} = require("../controllers/supplier_controller");
 
const supplier_routes = Router(); // Create a router instance for supplier routes

// Route to display all suppliers
supplier_routes.get("/admin/suppliers", VERIFY_ADMIN_TOKEN, getAllSuppliers);

// Route to add a new supplier
supplier_routes.post(
  "/admin/suppliers/add-supplier",
  VERIFY_ADMIN_TOKEN,
  addSupplier
);

// Route to edit a supplier - Use PUT here instead of POST
supplier_routes.put(
  "/admin/suppliers/:supplier_id",
  VERIFY_ADMIN_TOKEN,
  editSupplier
);

// Route to delete a supplier
supplier_routes.post(
  "/admin/suppliers/delete-supplier/:supplier_id",
  VERIFY_ADMIN_TOKEN,
  deleteSupplier
);

// Route to update supplier details
supplier_routes.put(
  "/api/update-supplier-details/:supplier_id",
  VERIFY_ADMIN_TOKEN,
  (req, res) => {
    const { supplier_id } = req.params;
    const { details } = req.body;
    // Call the controller method to update details
    updateSupplierDetails(supplier_id, details, res);
  }
);
supplier_routes.get('/api/supplier-details/:id', VERIFY_ADMIN_TOKEN, getSupplierDetails);


module.exports = supplier_routes; // Export the supplier_routes router for use in main Express app
