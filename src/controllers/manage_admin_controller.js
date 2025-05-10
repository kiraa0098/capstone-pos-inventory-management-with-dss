const supabase = require("../services/database");
const bcrypt = require("bcrypt");

// Render the Manage Admin page with admin data
exports.renderManageAdminPage = async (req, res) => {
  try {
    const { data: admins, error } = await supabase
      .from("admin")
      .select("admin_id, admin_email, admin_first_name, admin_last_name");
    if (error) throw error;
    res.render("manage_admin", { admins });
  } catch (error) {
    console.error("[renderManageAdminPage] Error fetching admins:", error);
    res.status(500).send("Internal Server Error");
  }
};

// Fetch all admins (GET /api/admins)
exports.getAdmins = async (req, res) => {
  try {
    const { data: admins, error } = await supabase
      .from("admin")
      .select("admin_id, admin_email, admin_first_name, admin_last_name");
    if (error) throw error;
    res.json({ admins });
  } catch (error) {
    console.error("[getAdmins] Error fetching admins:", error);
    res.status(500).send("Internal Server Error");
  }
};

exports.updateAdmin = async (req, res) => {
  const { id } = req.params; // Get the admin ID from the URL
  const { admin_email, admin_first_name, admin_last_name } = req.body;

  try {
    const { data, error } = await supabase
      .from("admin")
      .update({
        admin_email,
        admin_first_name,
        admin_last_name,
      })
      .eq("admin_id", id); // Assuming admin_id is the unique identifier

    if (error) throw error;
    res.json({ message: "Admin updated successfully", data });
  } catch (error) {
    console.error("[updateAdmin] Error updating admin:", error);
    res.status(500).send("Internal Server Error");
  }
};

// Change password for an admin (PUT /api/admins/:id/change-password)
exports.changePassword = async (req, res) => {
  const { id } = req.params; // Get the admin ID from the URL
  const { currentPassword, newPassword } = req.body; // Get passwords from the request body

  try {
    // Step 1: Fetch the admin's current password from the database
    const { data: adminData, error: fetchError } = await supabase
      .from("admin")
      .select("admin_password")
      .eq("admin_id", id)
      .single(); // Assuming `admin_id` is unique

    if (fetchError || !adminData) {
      throw new Error("Admin not found or error fetching data.");
    }

    // Step 2: Compare the provided current password with the stored password
    const isMatch = await bcrypt.compare(
      currentPassword,
      adminData.admin_password
    );

    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Current password is incorrect." });
    }

    // Step 3: Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Step 4: Update the password in the database
    const { error: updateError } = await supabase
      .from("admin")
      .update({ admin_password: hashedPassword })
      .eq("admin_id", id);

    if (updateError) throw updateError;

    res.json({ message: "Password updated successfully." });
  } catch (error) {
    console.error("[changePassword] Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
