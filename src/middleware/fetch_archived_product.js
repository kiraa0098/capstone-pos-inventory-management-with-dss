const supabase = require("../services/database");

async function FETCH_ARCHIVED_PRODUCTS() {
  try {
    const { data, error } = await supabase
      .from("archived_product")
      .select("*")
      .order("archived_date", { ascending: false });

    if (error) {
      console.error("Error fetching archived products:", error.message);
      throw new Error(
        "Failed to fetch archived products. Please try again later."
      );
    }

    // Format each date to 'YYYY-MM-DD' format
    const formattedData = data.map((product) => ({
      ...product,
      archived_date: new Date(product.archived_date)
        .toISOString()
        .split("T")[0],
    }));

    return formattedData; // Return formatted data
  } catch (error) {
    console.error(
      "Unexpected error in FETCH_ARCHIVED_PRODUCTS:",
      error.message
    );
    return [];
  }
}

module.exports = { FETCH_ARCHIVED_PRODUCTS };
