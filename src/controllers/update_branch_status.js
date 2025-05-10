const supabase = require("../services/database");

async function UPDATE_BRANCH_STATUS(branchId, branchStatus) {
  try {
    // Update the branch status in the database
    const { data, error } = await supabase
      .from("branch")
      .update({ branch_status: branchStatus })
      .eq("branch_id", branchId); // Ensure branchId is used as a UUID

    if (error) {
      throw new Error(
        `Supabase error updating branch status: ${error.message}`
      );
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error updating branch status:", error.message);
    throw error; // Re-throw the error to be caught by the endpoint
  }
}

module.exports = {
  UPDATE_BRANCH_STATUS,
};
