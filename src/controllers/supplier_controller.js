const supabase = require("../services/database");

// Get all suppliers
const getAllSuppliers = async (req, res) => {
  try {
    const { data: suppliers, error } = await supabase
      .from("suppliers")
      .select("*");
    if (error) throw error;
    res.render("admin_supplier", { suppliers });
  } catch (error) {
    console.error("[getAllSuppliers] Error fetching suppliers:", error);
    res.status(500).send("Internal Server Error");
  }
};

// Add a new supplier
const addSupplier = async (req, res) => {
  const { supplier_name, supplier_contact, supplier_address } = req.body;
  try {
    const { error } = await supabase
      .from("suppliers")
      .insert([{ supplier_name, supplier_contact, supplier_address }]);
    if (error) throw error;
    res.redirect("/admin/suppliers");
  } catch (error) {
    console.error("[addSupplier] Error adding supplier:", error);
    res.status(500).send("Internal Server Error");
  }
};

const editSupplier = async (req, res) => {
  // Log the supplier ID from the URL params
  const { supplier_id } = req.params;
  console.log("Supplier ID:", supplier_id);

  // Log the data received in the request body
  const { supplier_name, supplier_contact, supplier_address } = req.body;
  console.log("Supplier Name:", supplier_name);
  console.log("Supplier Contact:", supplier_contact);
  console.log("Supplier Address:", supplier_address);

  try {
    const { error, data } = await supabase
      .from("suppliers")
      .update({ supplier_name, supplier_contact, supplier_address })
      .eq("supplier_id", supplier_id);

    if (error) {
      console.error("[editSupplier] Supabase error:", error);
      throw error;
    }

    // Log a success message when the supplier is updated
    console.log("[editSupplier] Supplier updated successfully", data);
    res.redirect("/admin/suppliers");
  } catch (error) {
    console.error("[editSupplier] Error editing supplier:", error.message);
    res.status(500).send("Internal Server Error");
  }
};
 


// Delete a supplier
const deleteSupplier = async (req, res) => {
  const { supplier_id } = req.params;
  try {
    const { error } = await supabase
      .from("suppliers")
      .delete()
      .eq("supplier_id", supplier_id);
    if (error) throw error;
    res.redirect("/admin/suppliers");
  } catch (error) {
    console.error("[deleteSupplier] Error deleting supplier:", error);
    res.status(500).send("Internal Server Error");
  }
};

const getSupplierDetails = async (req, res) => {
  const { id } = req.params; // Get supplier ID from request params

  try {
    const { data, error } = await supabase
      .from('suppliers')
      .select('supplier_id, details')  // Columns to fetch
      .eq('supplier_id', id)
      .single(); // Use .single() to return only one record

    if (error) {
      return res.status(500).json({ message: 'Error fetching supplier details', error });
    }

    // Return supplier details
    if (data) {
      return res.status(200).json(data);
    } else {
      return res.status(404).json({ message: 'Supplier not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'An error occurred while fetching supplier details', error });
  }
};

const updateSupplierDetails = async (supplier_id, details, res) => {
  try {
    const { data, error } = await supabase
      .from("suppliers")
      .update({ details: details }) // Replace with the correct column name
      .eq("supplier_id", supplier_id);

    console.log("Received data:", { supplier_id, details });


    if (error) {
      console.error("Error updating supplier:", error);
      return res.status(400).json({ success: false, message: "Failed to update supplier details." });
    }

    return res.status(200).json({ success: true, message: "Supplier details updated successfully.", data });
  } catch (err) {
    console.error("Server error:", err);
    return { success: false, message: "Server error." };
  }
};


module.exports = {
  getAllSuppliers,
  addSupplier,
  editSupplier,
  deleteSupplier,
  getSupplierDetails,
  updateSupplierDetails,
};
