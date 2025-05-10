const supabase = require("../services/database");

// Function to log inventory details
const logInventoryDetails = async ({
  branchId,
  branchName,
  productName,
  productBrand,
  productCost,
  productPrice,
  productStock = null, // Existing stock is null for restock
  stockAdded, // Amount of stock added
  productCategory, // Include category name
  action = "Restock a product", // Action string for restocking
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
        inventory_log_product_stock: productStock, // Existing stock
        inventory_log_product_stock_added: stockAdded, // Added stock
        inventory_log_product_category: productCategory, // Log the category name
        inventory_log_action: action, // Action string
      },
    ]);

    if (error) throw error;

    console.log("Inventory log added:", data);
  } catch (error) {
    console.error("Error adding inventory log:", error.message);
    throw error; // Re-throw the error if necessary
  }
};

// Function to restock a product
async function RESTOCK_PRODUCT(productId, restockAmount) {
  try {
    // Fetch the current product stock
    const { data: currentProduct, error: fetchError } = await supabase
      .from("product")
      .select(
        "product_stock, product_branch_id, product_name, product_brand, product_cost, product_price, product_branch_name, product_category, product_category_id"
      )
      .eq("product_id", productId)
      .single();

    if (fetchError || !currentProduct) {
      throw new Error("Product not found.");
    }

    // Convert product_stock to a number and calculate new stock
    const currentStock = Number(currentProduct.product_stock);
    const newStock = currentStock + Number(restockAmount);

    // Update product stock in the database
    const { data, error: updateError } = await supabase
      .from("product")
      .update({ product_stock: newStock })
      .eq("product_id", productId)
      .single();

    if (updateError) {
      throw updateError;
    }

    // Log inventory details, including category name
    await logInventoryDetails({
      branchId: currentProduct.product_branch_id,
      branchName: currentProduct.product_branch_name,
      productName: currentProduct.product_name,
      productBrand: currentProduct.product_brand,
      productCost: currentProduct.product_cost,
      productPrice: currentProduct.product_price,
      productStock: currentStock, // Existing stock before restock
      stockAdded: restockAmount, // Amount of stock added
      productCategory: currentProduct.product_category, // Log category name
      action: "Restock a product", // Action string
    });

    return data;
  } catch (error) {
    throw new Error(`Error restocking product: ${error.message}`);
  }
}

// Function to void (decrease) stock
async function VOID_STOCK(productId, voidAmount) {
  try {
    // Fetch the current product stock
    const { data: currentProduct, error: fetchError } = await supabase
      .from("product")
      .select(
        "product_stock, product_branch_id, product_name, product_brand, product_cost, product_price, product_branch_name, product_category, product_category_id"
      )
      .eq("product_id", productId)
      .single();

    if (fetchError || !currentProduct) {
      throw new Error("Product not found.");
    }

    // Convert product_stock to a number and calculate new stock
    const currentStock = Number(currentProduct.product_stock);
    const newStock = currentStock - Number(voidAmount);

    // Ensure stock doesn't go below zero
    if (newStock < 0) {
      throw new Error("Void amount exceeds current stock.");
    }

    // Update product stock in the database
    const { data, error: updateError } = await supabase
      .from("product")
      .update({ product_stock: newStock })
      .eq("product_id", productId)
      .single();

    if (updateError) {
      throw updateError;
    }

    // Log inventory details, including category name
    await logInventoryDetails({
      branchId: currentProduct.product_branch_id,
      branchName: currentProduct.product_branch_name,
      productName: currentProduct.product_name,
      productBrand: currentProduct.product_brand,
      productCost: currentProduct.product_cost,
      productPrice: currentProduct.product_price,
      productStock: currentStock, // Existing stock before void
      stockAdded: -voidAmount, // Negative for stock void
      productCategory: currentProduct.product_category, // Log category name
      action: "Destocked a product", // Action string
    });

    return data;
  } catch (error) {
    throw new Error(`Error voiding stock: ${error.message}`);
  }
}

module.exports = { RESTOCK_PRODUCT, VOID_STOCK };
