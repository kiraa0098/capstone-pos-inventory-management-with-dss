const supabase = require("../services/database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Function to log login history into the login_history table
const logLoginHistory = async (branchId, branchName, personnelName, action) => {
  try {
    const { data, error } = await supabase.from("login_history").insert([
      {
        login_date: new Date().toISOString(), // Current timestamp
        login_branch_id: branchId, // Branch ID
        login_branch_name: branchName, // Branch Name
        login_branch_personel_name: personnelName, // Personnel Name
        Action: action,
      },
    ]);

    if (error) {
      console.error("Error logging login history:", error);
      throw new Error("Unable to log login history.");
    }

    console.log("Login history logged successfully:", data);
  } catch (err) {
    console.error("Error logging login history:", err.message);
    throw err;
  }
};

const LOGIN_BRANCH = async (branch_name, branch_key) => {
  try {
    console.log("Received Branch Name:", branch_name);

    // Fetch branch details
    const { data: branch, error } = await supabase
      .from("branch")
      .select("*")
      .eq("branch_name", branch_name)
      .single();

    if (error || !branch) {
      console.error("Branch fetch error:", error);
      throw new Error("Unable to login. Please check your connection.");
    }

    // Compare the branch key
    const branchKeyMatch = await bcrypt.compare(branch_key, branch.branch_key);

    if (!branchKeyMatch) {
      console.log("Invalid branch key for branch:", branch_name);
      throw new Error("Invalid branch key.");
    }

    // Generate JWT token for the branch
    const BRANCH_SECRET_KEY = "BRANCH_SECRET_KEY"; // Use an environment variable for production
    const token = jwt.sign(
      { branch_id: branch.id, branch_name: branch_name, role: "branch" },
      BRANCH_SECRET_KEY,
      { expiresIn: "2h" }
    );

    // Fetch the personnel name (personel_in_charge field in branch table)
    const personnelName = branch.personel_in_charge;
    const action = "logged in"; // Adjust if personnel info is stored elsewhere
    // Log the login event in the login_history table
    await logLoginHistory(branch.branch_id, branch_name, personnelName, action);

    console.log(token);
    return {
      success: true,
      token,
      branch_id: branch.branch_id,
      branch_name: branch.branch_name,
      personnelName,
    }; // Return success, token, and branch_id
  } catch (err) {
    console.error("Error during login process:", err.message);
    throw err; // Re-throw the original error
  }
};

module.exports = { LOGIN_BRANCH, logLoginHistory };
