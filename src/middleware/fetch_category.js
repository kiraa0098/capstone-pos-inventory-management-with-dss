// Import the Supabase client instance from the database service module
const supabase = require("../services/database"); // Adjust this path as necessary

// Function to fetch categories from Supabase
const FETCH_CATEGORY = async () => {
  try {
    // Query the 'product_category' table in Supabase
    const { data: categories, error } = await supabase
      .from("product_category")
      .select("product_category_id, product_category");

    // If there is an error with the query, throw it
    if (error) {
      console.error("Error fetching categories:", error.message);
      throw new Error("Error fetching categories");
    }

    // Return the fetched categories or an empty array if none are found
    return categories || [];
  } catch (unexpectedError) {
    // Log any unexpected errors that occur during the process
    console.error("Unexpected error:", unexpectedError.message);
    // Re-throw the error to be handled by the calling function
    throw new Error("Unexpected error while fetching categories");
  }
};

module.exports = {
  FETCH_CATEGORY,
};
