const bcrypt = require("bcrypt"); // Ensure bcrypt is required
const supabase = require("../services/database");

async function UPDATE_BRANCH_KEY(branchId, oldBranchKey, newBranchKey) {
  try {
    // Hash the new branch key
    const hashedNewBranchKey = await bcrypt.hash(newBranchKey, 10);

    // Fetch the branch by ID
    const { data: branch, error: fetchError } = await supabase
      .from("branch")
      .select("*")
      .eq("branch_id", branchId)
      .single();

    if (fetchError) {
      throw new Error("Error fetching branch: " + fetchError.message);
    }

    if (!branch) {
      throw new Error("Branch not found");
    }

    // Verify old branch key
    const isMatch = await bcrypt.compare(oldBranchKey, branch.branch_key);

    if (!isMatch) {
      console.error("Old branch key is incorrect for branch ID:", branchId);
      return { success: false, message: "Old branch key is incorrect" };
    }

    // Update branch with new key
    const { error: updateError } = await supabase
      .from("branch")
      .update({ branch_key: hashedNewBranchKey })
      .eq("branch_id", branchId);

    if (updateError) {
      throw new Error("Error updating branch key: " + updateError.message);
    }

    return { success: true, message: "Branch key updated successfully" };
  } catch (error) {
    console.error("Error in UPDATE_BRANCH_KEY function:", error.message);
    return { success: false, message: error.message };
  }
}

async function RESET_BRANCH_KEY(branchId, newBranchKey) {
  try {
    // Hash the new branch key
    const hashedNewBranchKey = await bcrypt.hash(newBranchKey, 10);

    // Fetch the branch by ID
    const { data: branch, error: fetchError } = await supabase
      .from("branch")
      .select("branch_key")
      .eq("branch_id", branchId)
      .single();

    if (fetchError) {
      throw new Error("Error fetching branch: " + fetchError.message);
    }

    if (!branch) {
      throw new Error("Branch not found");
    }

    // Compare the new branch key with the old key
    const isSameAsOldKey = await bcrypt.compare(
      newBranchKey,
      branch.branch_key
    );

    if (isSameAsOldKey) {
      console.log(
        "Validation triggered: New branch key is the same as the old one."
      );
      return {
        success: false,
        message: "New branch key must be different from the old one.",
      };
    }

    // Update branch with new key
    const { error: updateError } = await supabase
      .from("branch")
      .update({ branch_key: hashedNewBranchKey })
      .eq("branch_id", branchId);

    if (updateError) {
      throw new Error("Error updating branch key: " + updateError.message);
    }

    console.log("Branch key updated successfully.");
    return { success: true, message: "Branch key updated successfully" };
  } catch (error) {
    console.error("Error in RESET_BRANCH_KEY function:", error.message);
    return { success: false, message: error.message };
  }
}

module.exports = {
  UPDATE_BRANCH_KEY,
  RESET_BRANCH_KEY,
};
