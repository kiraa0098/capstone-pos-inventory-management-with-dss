const bcrypt = require("bcrypt");
const supabase = require("../services/database");

async function ADD_BRANCH(
  branchName,
  province,
  city,
  baranggay,
  streetName,
  building,
  houseNumber,
  branchKey
) {
  try {
    // Check if the branch name already exists (case-insensitive)
    const { data: existingBranches, error: fetchError } = await supabase
      .from("branch")
      .select("branch_name")
      .ilike("branch_name", branchName); // Case-insensitive check

    if (fetchError) {
      throw new Error(
        `Supabase error fetching branch names: ${fetchError.message}`
      );
    }

    if (existingBranches.length > 0) {
      return { success: false, message: "Branch name already exists." }; // Return this message
    }

    // Retrieve all branch keys from the 'branch' table
    const { data: branches, error: fetchErrorKeys } = await supabase
      .from("branch")
      .select("branch_key");

    if (fetchErrorKeys) {
      throw new Error(
        `Supabase error fetching branch keys: ${fetchErrorKeys.message}`
      );
    }

    // Check if the branch key already exists
    /*for (let branch of branches) {
      const match = await bcrypt.compare(branchKey, branch.branch_key);
      if (match) {
        throw new Error("Branch key already exists.");
      }
    }*/

    // Hash the branchKey before inserting
    const hashedBranchKey = await bcrypt.hash(branchKey, 10);

    // Insert data into the 'branch' table
    const { data, error: insertError } = await supabase.from("branch").insert([
      {
        branch_name: branchName,
        loc_province: province,
        loc_city: city,
        loc_baranggay: baranggay,
        loc_street_name: streetName,
        loc_building: building,
        loc_house_number: houseNumber,
        branch_key: hashedBranchKey,
      },
    ]);

    if (insertError) {
      throw new Error(
        `Supabase error inserting branch: ${insertError.message}`
      );
    }

    console.log("Branch added:", data);
    return { success: true, data }; // Return success and data
  } catch (error) {
    console.error("Error adding branch:", error.message);
    throw error; // Re-throw the error to be caught by the endpoint
  }
}

module.exports = {
  ADD_BRANCH,
};
