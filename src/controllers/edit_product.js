// Import supabase instance
const supabase = require("../services/database");

// Function to log inventory details
const logInventoryDetails = async ({
  branchId,
  branchName,
  oldProductName,
  newProductName,
  oldProductBrand,
  newProductBrand,
  oldProductCost, // Include old product cost
  newProductCost, // New product cost
  oldProductPrice, // Include old product price
  newProductPrice, // New product price
  oldProductCategory, // Old product category
  newProductCategory, // New product category
  action = "Edit a product",
}) => {
  try {
    const logEntry = {};

    // Handle product name change log
    logEntry.inventory_log_product_name =
      oldProductName === newProductName
        ? oldProductName
        : `${oldProductName} -> ${newProductName}`;

    // Handle product brand change log
    logEntry.inventory_log_product_brand =
      oldProductBrand === newProductBrand
        ? oldProductBrand
        : `${oldProductBrand} -> ${newProductBrand}`;

    // Log cost and price changes
    logEntry.inventory_log_product_cost =
      oldProductCost === newProductCost
        ? oldProductCost
        : `${oldProductCost} -> ${newProductCost}`;

    logEntry.inventory_log_product_price =
      oldProductPrice === newProductPrice
        ? oldProductPrice
        : `${oldProductPrice} -> ${newProductPrice}`;

    // Handle category change log
    logEntry.inventory_log_product_category =
      oldProductCategory === newProductCategory
        ? oldProductCategory
        : `${oldProductCategory} -> ${newProductCategory}`;

    // Additional log details
    logEntry.inventory_log_branch_id = branchId;
    logEntry.inventory_log_branch_name = branchName;
    logEntry.inventory_log_action = action;

    if (Object.keys(logEntry).length > 0) {
      const { data, error } = await supabase
        .from("inventory_logs")
        .insert([logEntry]);

      if (error) throw error;

      console.log("Inventory log added:", data);
    }
  } catch (error) {
    console.error("Error adding inventory log:", error.message);
    throw error;
  }
};

// Controller function for editing a product
async function EDIT_PRODUCT(
  product_id,
  product_name,
  product_brand,
  product_cost,
  product_price,
  product_category_id, // Add category ID parameter
  product_category // Add category name parameter
) {
  try {
    // Fetch the current product details
    const { data: currentProduct, error: fetchError } = await supabase
      .from("product")
      .select(
        "product_branch_id, product_name, product_brand, product_cost, product_price, product_branch_name, product_category, product_category_id"
      )
      .eq("product_id", product_id)
      .single();

    if (fetchError || !currentProduct) {
      throw new Error("Product not found.");
    }

    // Check if the product name is being changed
    if (product_name !== currentProduct.product_name) {
      const { data: existingProduct, error: checkError } = await supabase
        .from("product")
        .select("*")
        .eq("product_name", product_name)
        .eq("product_branch_id", currentProduct.product_branch_id) // Ensure we check in the same branch
        .neq("product_id", product_id); // Exclude the current product by ID

      if (checkError) {
        console.error("Error checking existing product:", checkError.message);
        throw new Error("Failed to check existing product");
      }

      if (existingProduct.length > 0) {
        throw new Error("Product name already exists in this branch.");
      }
    }

    // Proceed with the product update, including category ID and name
    const { data: updatedProduct, error: updateError } = await supabase
      .from("product")
      .update({
        product_name,
        product_brand,
        product_cost,
        product_price,
        product_category, // Update the category name
        product_category_id, // Update the category ID
      })
      .eq("product_id", product_id)
      .single();

    if (updateError) {
      console.error("Error updating product:", updateError.message);
      throw new Error("Failed to update product");
    }

    // Log the changes
    await logInventoryDetails({
      branchId: currentProduct.product_branch_id,
      branchName: currentProduct.product_branch_name,
      oldProductName: currentProduct.product_name,
      newProductName: product_name,
      oldProductBrand: currentProduct.product_brand,
      newProductBrand: product_brand,
      oldProductCost: currentProduct.product_cost,
      newProductCost: product_cost,
      oldProductPrice: currentProduct.product_price,
      newProductPrice: product_price,
      oldProductCategory: currentProduct.product_category,
      newProductCategory: product_category,
      action: "Edit a product",
    });

    // Return updated product data
    return { message: "Product updated successfully", data: updatedProduct };
  } catch (error) {
    console.error("Error updating product:", error.message);
    throw error; // Propagate the error to be caught by the caller
  }
}

module.exports = EDIT_PRODUCT;
