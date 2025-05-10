const supabase = require("../services/database");

const fetchLoginHistory = async (branchId) => {
  try {
    // Fetch login history for the branch
    const { data: loginHistory, error } = await supabase
      .from("login_history")
      .select("*")
      .eq("login_branch_id", branchId) // Filter by branchId
      .order("login_date", { ascending: false }); // Order by login date, most recent first

    if (error) {
      console.error("Error fetching login history:", error);
      throw new Error("Unable to fetch login history");
    }

    return loginHistory;
  } catch (error) {
    console.error("Error in fetchLoginHistory:", error.message);
    throw error;
  }
};

module.exports = fetchLoginHistory;
