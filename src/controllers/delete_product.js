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
  productCategory, // Include category name in the log
  action = "Full delete a product", // Action message for deletion
}) => {
  try {
    const { data, error } = await supabase.from("inventory_logs").insert([
      {
        inventory_log_branch_id: branchId,
        inventory_log_branch_name: branchName,
        inventory_log_product_name: productName,
        inventory_log_product_brand: productBrand,
        inventory_log_product_cost: productCost,
        inventory_log_product_price: productPrice,
        inventory_log_product_stock: productStock,
        inventory_log_product_stock_added: stockAdded,
        inventory_log_product_category: productCategory, // Log the category name
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

// Function to delete a product (from archived product)
async function DELETE_PRODUCT(productId) {
  try {
    // Fetch the product details from the archived_product table
    const { data: archivedProduct, error: fetchError } = await supabase
      .from("archived_product")
      .select(
        "archive_product_branch_id, archive_product_branch_name, archive_product_name, archive_product_brand, archive_product_cost, archive_product_price, archive_product_stock, archive_product_category, archive_product_category_id"
      )
      .eq("archive_product_id", productId)
      .single();

    if (fetchError || !archivedProduct) {
      console.error("Error fetching archived product:", fetchError);
      throw new Error("Error fetching archived product.");
    }

    // Log inventory details including category
    await logInventoryDetails({
      branchId: archivedProduct.archive_product_branch_id,
      branchName: archivedProduct.archive_product_branch_name,
      productName: archivedProduct.archive_product_name,
      productBrand: archivedProduct.archive_product_brand,
      productCost: archivedProduct.archive_product_cost,
      productPrice: archivedProduct.archive_product_price,
      productStock: archivedProduct.archive_product_stock,
      stockAdded: null, // No stock added for deletion
      productCategory: archivedProduct.archive_product_category, // Category name
      action: "Full delete a product", // Updated log action message
    });

    // Delete the product from the archived_product table
    const { error: deleteError } = await supabase
      .from("archived_product")
      .delete()
      .eq("archive_product_id", productId);

    if (deleteError) {
      console.error("Error deleting product from archived table:", deleteError);
      throw new Error("Error deleting product from archived table.");
    }

    return {
      success: true,
      message: "Product deleted successfully from archived products.",
    };
  } catch (error) {
    console.error("Error deleting product:", error.message);
    return { success: false, message: error.message };
  }
}

module.exports = { DELETE_PRODUCT };
