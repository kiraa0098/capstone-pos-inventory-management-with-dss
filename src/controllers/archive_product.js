const supabase = require("../services/database");

// Function to log inventory details
const logInventoryDetails = async ({
  branchId,
  branchName,
  productName,
  productBrand,
  productCost,
  productPrice,
  productStock,
  stockAdded = null,
  productCategory, // Added category name field
  action = "Archive a product",
}) => {
  try {
    const { data, error } = await supabase.from("inventory_logs").insert([
      {
        inventory_log_branch_id: branchId,
        inventory_log_branch_name: branchName,
        inventory_log_product_name: productName,
        inventory_log_product_brand: productBrand,
        inventory_log_product_cost:
          typeof productCost === "number" ? productCost.toFixed(2) : "0.00",
        inventory_log_product_price:
          typeof productPrice === "number" ? productPrice.toFixed(2) : "0.00",
        inventory_log_product_stock: productStock,
        inventory_log_product_stock_added: stockAdded,
        inventory_log_product_category: productCategory, // Log the product category
        inventory_log_action: action,
      },
    ]);

    if (error) throw error;

    console.log("Inventory log added:", data);
  } catch (error) {
    console.error("Error adding inventory log:", error.message);
    throw error;
  }
};

// Function to archive a product
async function ARCHIVE_PRODUCT(productId) {
  try {
    // Step 1: Fetch the product details
    const { data: product, error: fetchError } = await supabase
      .from("product")
      .select("*")
      .eq("product_id", productId)
      .single();

    if (fetchError) {
      console.error("Error fetching product:", fetchError);
      throw new Error("Error fetching product.");
    }

    const productCost = parseFloat(product.product_cost);
    const productPrice = parseFloat(product.product_price);

    if (isNaN(productCost) || isNaN(productPrice)) {
      throw new Error("Invalid product cost or price.");
    }

    // Step 2: Insert the product into the archived_product table
    const { error: archiveError } = await supabase
      .from("archived_product")
      .insert([
        {
          archive_product_id: product.product_id,
          archive_product_branch_id: product.product_branch_id,
          archive_product_name: product.product_name,
          archive_product_brand: product.product_brand,
          archive_product_stock: product.product_stock,
          archive_product_price: productPrice.toFixed(2),
          archive_product_cost: productCost.toFixed(2),
          archive_product_branch_name: product.product_branch_name,
          archive_product_category: product.product_category, // Archive category name
          archive_product_category_id: product.product_category_id, // Archive category ID
        },
      ]);

    if (archiveError) {
      console.error("Error archiving product:", archiveError);
      throw new Error("Error archiving product.");
    }

    // Step 3: Log the inventory details
    await logInventoryDetails({
      branchId: product.product_branch_id,
      branchName: product.product_branch_name,
      productName: product.product_name,
      productBrand: product.product_brand,
      productCost: productCost,
      productPrice: productPrice,
      productStock: product.product_stock,
      stockAdded: null,
      productCategory: product.product_category, // Pass the category to the log function
      action: "Archive a product",
    });

    // Step 4: Delete the product from the product table
    const { error: deleteError } = await supabase
      .from("product")
      .delete()
      .eq("product_id", productId);

    if (deleteError) {
      console.error("Error deleting product:", deleteError);
      throw new Error("Error deleting product.");
    }

    return { success: true, message: "Product archived successfully." };
  } catch (error) {
    console.error("Error archiving product:", error.message);
    throw error;
  }
}

module.exports = ARCHIVE_PRODUCT;
