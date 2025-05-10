const supabase = require("../services/database");

async function UPDATE_BRANCH_INFO(
  id,
  branch_name,
  loc_province,
  loc_city,
  loc_baranggay,
  loc_street_name,
  loc_building,
  loc_house_number,
  personel_in_charge
) {
  try {
    // Normalize branch name (lowercase and remove spaces)
    const normalizedBranchName = branch_name.toLowerCase().replace(/\s+/g, "");

    // Fetch all branch names and IDs
    const { data: allBranches, error: fetchError } = await supabase
      .from("branch")
      .select("branch_id, branch_name");

    if (fetchError) {
      throw new Error(`Error fetching branches: ${fetchError.message}`);
    }

    // Check if any existing branch has the same normalized name
    const isDuplicate = allBranches.some(
      (branch) =>
        branch.branch_id !== id &&
        branch.branch_name.toLowerCase().replace(/\s+/g, "") ===
          normalizedBranchName
    );

    if (isDuplicate) {
      return { success: false, message: "Branch name already exists" };
    }

    // Update branch information in the database
    const { data, error } = await supabase
      .from("branch")
      .update({
        branch_name,
        loc_province,
        loc_city,
        loc_baranggay,
        loc_street_name,
        loc_building,
        loc_house_number,
        personel_in_charge,
      })
      .eq("branch_id", id);

    if (error) {
      throw new Error(
        `Supabase error updating branch information: ${error.message}`
      );
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error updating branch information:", error.message);
    throw error; // Re-throw the error to be caught by the endpoint
  }
}

module.exports = {
  UPDATE_BRANCH_INFO,
};
