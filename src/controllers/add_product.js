const supabase = require("../services/database"); // Import Supabase client

// Function to log inventory details
const logInventoryDetails = async ({
  branchId,
  branchName,
  productName,
  productBrand,
  productCost,
  productPrice,
  stockAdded,
  action = "Add a product", // Default action string
  productCategory,
  supplierId,
  supplierName, // New parameter for category name
}) => {
  try {
    const { data, error } = await supabase.from("inventory_logs").insert([
      {
        inventory_log_branch_id: branchId,
        inventory_log_branch_name: branchName,
        inventory_log_product_name: productName,
        inventory_log_product_brand: productBrand,
        inventory_log_product_cost: productCost.toFixed(2),
        inventory_log_product_price: productPrice.toFixed(2),
        inventory_log_product_stock_added: stockAdded,
        inventory_log_action: action, // Include the action string
        inventory_log_product_category: productCategory,
        supplier_id: supplierId,
        supplier_name: supplierName, // Add category to the log
      },
    ]);

    if (error) throw error;

    console.log("Inventory log added:", data);
  } catch (error) {
    console.error("Error adding inventory log:", error.message);
    throw error; // Re-throw the error if necessary
  }
};

// Function to add a product to selected branches
const ADD_PRODUCT = async ({
  productName,
  productBrand,
  productStock,
  productPrice,
  productCost,
  selectedBranchIds,
  selectedBranchNames,
  productCategoryId, // New parameter
  productCategoryName,
  supplierId,
  supplierName, // New parameter
}) => {
  const result = {
    success: true,
    data: [],
    failedBranches: [],
    successfulBranches: [],
  };

  try {
    const productEntries = []; // Array to store product entries to insert

    // Normalize product name and brand by removing spaces
    const normalizedProductName = productName.replace(/\s+/g, "").toLowerCase();
    const normalizedProductBrand = productBrand
      .replace(/\s+/g, "")
      .toLowerCase();

    // Check for existing products in selected branches and supplier concurrently
    await Promise.all(
      selectedBranchIds.map(async (branch_id, index) => {
        const branch_name = selectedBranchNames[index];

        // Query to check if the product already exists in the branch and supplier
        const { data: existingProducts, error } = await supabase
          .from("product")
          .select("*")
          .eq("product_name", productName)
          .eq("product_brand", productBrand)
          .eq("supplier_id", supplierId); // Check if the product exists for this supplier

        if (error) {
          console.error("Error checking existing product:", error);
          throw error;
        }

        // Filter existing products based on normalized names, brands, and supplier
        const filteredProducts = existingProducts.filter(
          (product) =>
            product.product_name.replace(/\s+/g, "").toLowerCase() ===
              normalizedProductName &&
            product.product_brand.replace(/\s+/g, "").toLowerCase() ===
              normalizedProductBrand &&
            product.supplier_id === supplierId
        );

        if (filteredProducts.length > 0) {
          console.log(
            `Product ${productName} by ${productBrand} already exists for supplier ${supplierName}. Skipping insertion.`
          );
          result.failedBranches.push(branch_name);
        } else {
          // If the product does not exist for this supplier, prepare it for insertion
          productEntries.push({
            product_branch_id: branch_id,
            product_name: productName,
            product_brand: productBrand,
            product_stock: productStock,
            product_price: productPrice.toFixed(2),
            product_cost: productCost.toFixed(2),
            product_branch_name: branch_name,
            product_category_id: productCategoryId, // Add category ID
            product_category: productCategoryName,
            supplier_id: supplierId,
            supplier_name: supplierName, // Add category name
          });
          result.successfulBranches.push(branch_name);
        }
      })
    );

    // Insert new product entries into Supabase if there are entries to insert
    if (productEntries.length > 0) {
      const { data, error } = await supabase
        .from("product")
        .insert(productEntries);

      if (error) throw error;

      result.data = data;

      // Log inventory details for each branch where the product was added
      await Promise.all(
        result.successfulBranches.map(async (branchName, index) => {
          const branchId =
            selectedBranchIds[result.successfulBranches.indexOf(branchName)];
          await logInventoryDetails({
            branchId,
            branchName,
            productName,
            productBrand,
            productCost,
            productPrice,
            stockAdded: productStock,
            action: "Add a product", // Pass the action string
            productCategory: productCategoryName,
            supplierId,
            supplierName, // Pass the category name
          });
        })
      );
    }

    return result;
  } catch (error) {
    console.error("Error adding product:", error);
    result.success = false;
    result.error = "Error adding product";
    return result;
  }
};

module.exports = ADD_PRODUCT; // Export ADD_PRODUCT function for use in other modules
