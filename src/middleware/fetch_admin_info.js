const supabase = require("../services/database");

async function FETCH_ADMIN_INFO() {
  try {
    const { data, error } = await supabase.from("admin").select("*"); // Select all columns

    // Check if there's an error returned by Supabase
    if (error) {
      console.error("Error fetching admin info:", error.message);
      // Throw a custom error to be handled by the caller
      throw new Error(
        "Failed to fetch admin information. Please try again later."
      );
    }

    return data; // Return all the admin info
  } catch (error) {
    console.error("Unexpected error in FETCH_ADMIN_INFO:", error.message);
    // Re-throw a custom error to be handled by the caller
    throw new Error(
      "An unexpected error occurred while fetching admin information."
    );
  }
}

module.exports = { FETCH_ADMIN_INFO };
