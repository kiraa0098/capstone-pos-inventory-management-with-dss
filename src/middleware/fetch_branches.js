// Import the Supabase client instance from the database service module
const supabase = require("../services/database");

// Middleware function to fetch branches from Supabase
const FETCH_BRANCHES = async (req, res, next) => {
  try {
    // Query the 'branch' table in the Supabase database to select all rows
    const { data, error } = await supabase.from("branch").select("*");

    // Check for errors returned by Supabase
    if (error) {
      console.error("Error fetching branches:", error.message);
      // Send a 500 Internal Server Error response if there is an error
      return res.status(500).json({ error: "Error fetching branches" });
    }

    // Attach the fetched branches data to the request object for use in subsequent middleware or route handlers
    req.branches = data;
    // Call the next middleware function in the stack
    next();
  } catch (error) {
    // Log any unexpected errors that occur during the process
    console.error("Unexpected error:", error.message);
    // Send a 500 Internal Server Error response for unexpected errors
    res.status(500).json({ error: "Unexpected error" });
  }
};

const FETCH_BRANCH_BY_ID = async (branchId) => {
  try {
    const { data, error } = await supabase
      .from("branch")
      .select("*")
      .eq("branch_id", branchId)
      .single(); // Use .single() to get a single object instead of an array

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error("Error fetching branch by ID:", error.message);
    throw new Error("Error fetching branch by ID: " + error.message);
  }
};

const FETCH_INACTIVE_BRANCH_IDs = async () => {
  try {
    const { data, error } = await supabase
      .from("branch")
      .select("branch_id")
      .eq("branch_status", true); // Fetch active branches

    if (error) {
      throw new Error(`Error fetching active branches: ${error.message}`);
    }

    // Return an array of active branch IDs
    return data.map((branch) => branch.branch_id);
  } catch (error) {
    console.error("Error in FETCH_INACTIVE_BRANCH_IDs:", error.message);
    throw new Error("Error fetching inactive branch IDs: " + error.message);
  }
};

const FETCH_ACTIVE_BRANCHES = async () => {
  try {
    const { data, error } = await supabase
      .from("branch")
      .select("branch_id, branch_name")
      .eq("branch_status", true); // Fetch only active branches

    if (error) {
      throw new Error(`Error fetching active branches: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error("Error in FETCH_ACTIVE_BRANCHES:", error.message);
    throw new Error("Error fetching active branches: " + error.message);
  }
};

const FETCH_BRANCH_STATUS = async (branchId) => {
  try {
    const { data, error } = await supabase
      .from("branch")
      .select("branch_status")
      .eq("branch_id", branchId)
      .single(); // Use .single() to get a single object instead of an array

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error("Error fetching branch status:", error.message);
    throw new Error("Error fetching branch status: " + error.message);
  }
};

const GET_BRANCH_ADDRESS = async (branchId) => {
  try {
    const { data, error } = await supabase
      .from("branch")
      .select(
        `
        loc_province,
        loc_city,
        loc_baranggay,
        loc_street_name,
        loc_building,
        loc_house_number
      `
      )
      .eq("branch_id", branchId)
      .single(); // Expecting a single result

    if (error) {
      throw new Error("Error fetching branch address: " + error.message);
    }

    return data;
  } catch (error) {
    console.error("Error fetching branch address:", error.message);
    throw new Error("Error fetching branch address: " + error.message);
  }
};

// Export the FETCH_BRANCHES middleware function for use in other parts of the application
module.exports = {
  FETCH_BRANCHES,
  FETCH_BRANCH_BY_ID,
  FETCH_INACTIVE_BRANCH_IDs,
  FETCH_BRANCH_STATUS,
  FETCH_ACTIVE_BRANCHES,
  GET_BRANCH_ADDRESS,
};
