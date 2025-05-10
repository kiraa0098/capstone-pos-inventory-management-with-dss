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
  action = "Unarchive a product",
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

// Function to unarchive a product
async function UNARCHIVE_PRODUCT(productId) {
  try {
    // Fetch the product details from the archived_product table
    const { data: archivedProduct, error: fetchError } = await supabase
      .from("archived_product")
      .select("*")
      .eq("archive_product_id", productId)
      .single();

    if (fetchError) {
      console.error("Error fetching archived product:", fetchError);
      throw new Error("Error fetching archived product.");
    }

    // Insert the product details into the product table, including category fields
    const { error: insertError } = await supabase.from("product").insert([
      {
        product_id: archivedProduct.archive_product_id,
        product_branch_id: archivedProduct.archive_product_branch_id,
        product_name: archivedProduct.archive_product_name,
        product_brand: archivedProduct.archive_product_brand,
        product_stock: archivedProduct.archive_product_stock,
        product_price: archivedProduct.archive_product_price,
        product_cost: archivedProduct.archive_product_cost,
        product_branch_name: archivedProduct.archive_product_branch_name,
        product_category_id: archivedProduct.archive_product_category_id, // Include category ID
        product_category: archivedProduct.archive_product_category, // Include category name
      },
    ]);

    if (insertError) {
      console.error("Error inserting product into active table:", insertError);
      throw new Error("Error inserting product into active table.");
    }

    // Log the unarchive action with category name
    await logInventoryDetails({
      branchId: archivedProduct.archive_product_branch_id,
      branchName: archivedProduct.archive_product_branch_name,
      productName: archivedProduct.archive_product_name,
      productBrand: archivedProduct.archive_product_brand,
      productCost: archivedProduct.archive_product_cost,
      productPrice: archivedProduct.archive_product_price,
      productStock: archivedProduct.archive_product_stock,
      stockAdded: null,
      productCategory: archivedProduct.archive_product_category, // Log the category name
      action: "Unarchive a product",
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

    return { success: true, message: "Product unarchived successfully." };
  } catch (error) {
    console.error("Error unarchiving product:", error.message);
    return { success: false, message: error.message };
  }
}

module.exports = { UNARCHIVE_PRODUCT };
