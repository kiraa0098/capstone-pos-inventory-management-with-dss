// Import the Supabase client instance from the database service module
const supabase = require("../services/database");

// Middleware function to fetch all products from Supabase
const FETCH_PRODUCTS = async (req, res, next) => {
  try {
    // Query the 'product' table in the Supabase database to select all rows
    const { data, error } = await supabase.from("product").select("*");

    // Check for errors returned by Supabase
    if (error) {
      console.error("Error fetching products:", error.message);
      // Send a 500 Internal Server Error response if there is an error
      return res.status(500).send("Error fetching products");
    }

    // Attach the fetched products data to the request object for use in subsequent middleware or route handlers
    req.products = data;
    // Call the next middleware function in the stack
    next();
  } catch (error) {
    // Log any unexpected errors that occur during the process
    console.error("Unexpected error:", error.message);
    // Send a 500 Internal Server Error response for unexpected errors
    res.status(500).send("Unexpected error");
  }
};

const FETCH_UPDATED_PRODUCTS = async () => {
  try {
    // Query the 'product' table in the Supabase database to select all rows
    const { data, error } = await supabase.from("product").select("*");

    // Check for errors returned by Supabase
    if (error) {
      console.error("Error fetching products:", error.message);
      return { error: "Error fetching products" };
    }
    ``;

    return { products: data };
  } catch (error) {
    console.error("Unexpected error:", error.message);
    return { error: "Unexpected error" };
  }
};

const FETCH_PRODUCT_BY_BRANCH = async (branchId) => {
  const { data: products, error } = await supabase
    .from("product")
    .select("*")
    .eq("product_branch_id", branchId);

  if (error) {
    throw new Error(error.message);
  }

  // Sort products alphabetically by product_name
  products.sort((a, b) => a.product_name.localeCompare(b.product_name));

  return products;
};

const FETCH_PRODUCT_ACTIVE_BRANCHES = async (activeBranchIds) => {
  try {
    // Query products where product_branch_id is in activeBranchIds
    const { data, error } = await supabase
      .from("product")
      .select("*")
      .in("product_branch_id", activeBranchIds);

    if (error) {
      throw new Error(`Error fetching products: ${error.message}`);
    }

    // Sort products alphabetically by product_name
    data.sort((a, b) => a.product_name.localeCompare(b.product_name));

    return data;
  } catch (error) {
    console.error("Error in FETCH_PRODUCT_ACTIVE_BRANCHES:", error.message);
    throw error;
  }
};

const GET_ALL_PRODUCT = async () => {
  try {
    // Fetch active products
    const { data: activeProducts, error: activeError } = await supabase
      .from("product") // Replace with your active products table name
      .select("*");

    if (activeError) {
      console.error("Error fetching active products:", activeError);
      throw activeError;
    }

    // Fetch archived products
    const { data: archivedProducts, error: archivedError } = await supabase
      .from("archived_product") // Replace with your archived products table name
      .select("*");

    if (archivedError) {
      console.error("Error fetching archived products:", archivedError);
      throw archivedError;
    }

    // Combine active and archived products
    const allProducts = [
      ...activeProducts.map((product) => ({
        id: product.product_id,
        branch_id: product.product_branch_id,
        product_name: product.product_name,
        product_brand: product.product_brand,
        product_category: product.product_category,
        branch_name: product.product_branch_name,
        status: "Active",
      })),
      ...archivedProducts.map((product) => ({
        id: product.archive_product_id,
        branch_id: product.archive_product_branch_id,
        product_name: product.archive_product_name,
        product_brand: product.archive_product_brand,
        product_category: product.archive_product_category,
        branch_name: product.archive_product_branch_name,
        status: "Archived",
      })),
    ];

    return allProducts;
  } catch (error) {
    console.error("Error in getAllProducts:", error.message);
    throw error;
  }
};

// Export the FETCH_PRODUCTS middleware function for use in other parts of the application
module.exports = {
  FETCH_PRODUCTS,
  FETCH_UPDATED_PRODUCTS,
  FETCH_PRODUCT_BY_BRANCH,
  FETCH_PRODUCT_ACTIVE_BRANCHES,
  GET_ALL_PRODUCT,
};
