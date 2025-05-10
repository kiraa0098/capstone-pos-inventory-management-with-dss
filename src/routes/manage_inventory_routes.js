const express = require("express"); // Import Express framework
const moment = require("moment");

const manage_inventory = express.Router(); // Create a router instance for managing inventory

const ADD_PRODUCT = require("../controllers/add_product"); // Import controller for adding products
const EDIT_PRODUCT = require("../controllers/edit_product");
const {
  RESTOCK_PRODUCT,
  VOID_STOCK,
} = require("../controllers/restock_product");
const ARCHIVE_PRODUCT = require("../controllers/archive_product");
const { UNARCHIVE_PRODUCT } = require("../controllers/unarchive_product");
const { DELETE_PRODUCT } = require("../controllers/delete_product");
const {
  saveCategory,
  editCategory,
  deleteCategory,
  removeCategoryFromProducts,
  categoryExists,
} = require("../controllers/manage_category");
const COMPUTE_REVENUE_GENERATED = require("../controllers/compute_revenue_generated");
const { VERIFY_ADMIN_TOKEN } = require("../middleware/verify_webtoken");
const {
  FETCH_BRANCHES,
  FETCH_INACTIVE_BRANCH_IDs,
  FETCH_ACTIVE_BRANCHES,
} = require("../middleware/fetch_branches"); // Import middleware to fetch branches
const {
  FETCH_PRODUCTS,
  FETCH_UPDATED_PRODUCTS,
  FETCH_PRODUCT_ACTIVE_BRANCHES,
  GET_ALL_PRODUCT,
} = require("../middleware/fetch_products");
const {
  FETCH_ARCHIVED_PRODUCTS,
} = require("../middleware/fetch_archived_product");
const {
  FETCH_PRODUCTS_RECORDS,
  FETCH_YEAR_SALES,
} = require("../middleware/fetch_order_sale"); // Import middleware to fetch products
const {
  FETCH_ALL_INVENTORY_LOGS,
} = require("../middleware/fetch_inventory_logs");
const { FETCH_CATEGORY } = require("../middleware/fetch_category");
const calculateSMAForecast = require("../controllers/getForecast");
const supabase = require("../services/database");

// GET request handler for rendering inventory management page
manage_inventory.get(
  "/admin/inventory",
  FETCH_BRANCHES, // Middleware to fetch branches
  VERIFY_ADMIN_TOKEN, // Middleware to verify web token (assuming)
  async (req, res) => {
    try {
      // Fetch active branch IDs
      const activeBranchIds = await FETCH_INACTIVE_BRANCH_IDs();
      const activeBranches = await FETCH_ACTIVE_BRANCHES();
      const categories = await FETCH_CATEGORY();
      // Fetch products with active branches
      const products = await FETCH_PRODUCT_ACTIVE_BRANCHES(activeBranchIds);

      console.log("products", products);

      const fetchedSuppliers = await fetchSuppliers();

      // Render admin_manage_inventory view with fetched branches and products
      res.render("admin_manage_inventory", {
        categories,
        branches: activeBranches,
        products,
        suppliers: fetchedSuppliers, // Pass fetched products data to the view
      });
    } catch (error) {
      console.error("[/admin/inventory]", error);
      res.status(500).send("Internal Server Error"); // Handle server error if any
    }
  }
);

const fetchSuppliers = async () => {
  try {
    const { data: suppliers, error } = await supabase
      .from("suppliers")
      .select("*");

    if (error) throw error;

    return suppliers;
  } catch (error) {
    console.error("Error fetching suppliers:", error.message);
    throw new Error("Failed to fetch suppliers");
  }
};

manage_inventory.get(
  "/admin/inventory/archived-products",
  VERIFY_ADMIN_TOKEN,
  FETCH_BRANCHES, // Middleware to verify web token (assuming)
  async (req, res) => {
    try {
      const archivedProducts = await FETCH_ARCHIVED_PRODUCTS();
      // Render admin_manage_inventory view with fetched branches and products
      res.render("admin_archives", {
        archivedProducts,
        branches: req.branches,
      });
    } catch (error) {
      console.error("[/admin/inventory/archive-products]", error);
      res.status(500).send("Internal Server Error"); // Handle server error if any
    }
  }
);

manage_inventory.get(
  "/admin/inventory/logs",
  VERIFY_ADMIN_TOKEN,
  FETCH_BRANCHES,
  // Middleware to verify web token (assuming)
  async (req, res) => {
    try {
      // Fetch all inventory logs
      const logs = await FETCH_ALL_INVENTORY_LOGS();

      // Determine visibility for columns
      const showProductStock =
        logs.length > 0 && logs[0].inventory_log_action !== "RESTOCK";
      const showAddedStock =
        logs.length > 0 &&
        logs[0].inventory_log_action !== "ARCHIVE" &&
        logs[0].inventory_log_action !== "UNARCHIVE";
      const showStock =
        logs.length > 0 && logs[0].inventory_log_action !== "EDIT";
      const showOldValues =
        logs.length > 0 && logs[0].inventory_log_action === "EDIT";

      // Render admin_manage_inventory view with fetched logs and visibility options
      res.render("admin_inventory_logs", {
        logs,
        showProductStock,
        showAddedStock,
        showStock,
        showOldValues,
        branches: req.branches,
      });
    } catch (error) {
      console.error("[/admin/inventory/logs]", error);
      res.status(500).send("Internal Server Error"); // Handle server error if any
    }
  }
);

manage_inventory.get(
  "/admin/inventory/product-performance",
  VERIFY_ADMIN_TOKEN,
  FETCH_BRANCHES,
  FETCH_YEAR_SALES,
  async (req, res) => {
    try {
      const month = parseInt(req.query.month) || new Date().getMonth() + 1;
      const year = parseInt(req.query.year) || new Date().getFullYear();
      const branchFilter = req.query.branch || "";
      const categoryFilter = req.query.category || "";
      const searchQuery = req.query.query ? req.query.query.toLowerCase() : "";
      const categories = await FETCH_CATEGORY();

      // Fetch all products
      const allProducts = await GET_ALL_PRODUCT();

      // Compute revenue for the specified month and year
      const revenueByProduct = await COMPUTE_REVENUE_GENERATED(month, year);

      // Combine product data with revenue data
      let productsWithRevenue = allProducts.map((product) => {
        const revenueData = revenueByProduct[product.id] || {
          revenue_generated: 0,
          units_sold: 0,
        };

        return {
          ...product,
          revenue_generated: revenueData.revenue_generated,
          units_sold: revenueData.units_sold,
        };
      });

      // Filter products by branch if specified
      if (branchFilter) {
        productsWithRevenue = productsWithRevenue.filter((product) =>
          product.branch_name.toLowerCase().includes(branchFilter.toLowerCase())
        );
      }

      // Filter by category if a specific category is selected
      if (categoryFilter && categoryFilter !== "all") {
        productsWithRevenue = productsWithRevenue.filter(
          (product) => product.product_category === categoryFilter
        );
      }

      // Filter by search query if provided
      if (searchQuery) {
        productsWithRevenue = productsWithRevenue.filter((product) =>
          product.product_name.toLowerCase().includes(searchQuery)
        );
      }

      console.log("productsWithRevenue", productsWithRevenue);

      // Render the view with filtered product data, branches, and the month/year
      res.render("admin_product_performance", {
        products: productsWithRevenue,
        month,
        year,
        branchFilter,
        categoryFilter,
        searchQuery,
        branches: req.branches,
        years: req.years,
        categories,
      });
    } catch (error) {
      console.error(
        "[/admin/inventory/product-performance] Error:",
        error.message
      );
      console.error("Stack Trace:", error.stack);
      res.status(500).send("Internal Server Error");
    }
  }
);

manage_inventory.get(
  "/admin/inventory/forecast",
  VERIFY_ADMIN_TOKEN,
  FETCH_BRANCHES,
  FETCH_PRODUCTS,
  async (req, res) => {
    try {
      const today = moment();
      const last30DaysStart = moment(today)
        .subtract(30, "days")
        .format("YYYY-MM-DD");
      const currentDate = moment(today).format("YYYY-MM-DD");

      const products = req.products;
      if (!products || products.length === 0) {
        throw new Error("No products found");
      }

      // Fetch sales data for the last 30 days
      const salesDataLast30Days = await FETCH_PRODUCTS_RECORDS(
        last30DaysStart,
        currentDate
      );

      // Prepare sales data for forecasting
      const salesDataForForecast = products.reduce((acc, product) => {
        const productSales = salesDataLast30Days.filter(
          (sale) => sale.sold_product_name === product.product_name
        );

        if (productSales.length > 0) {
          acc[product.product_id] = productSales.map((sale) => ({
            ds: moment(sale.sold_product_date).utc().format("YYYY-MM-DD"),
            y: sale.sold_product_quantity,
            product_name: sale.sold_product_name,
          }));
        } else {
          acc[product.product_id] = [
            {
              ds: moment().utc().format("YYYY-MM-DD"), // Today's date if no sales
              y: 0,
              product_name: product.product_name,
            },
          ];
        }
        return acc;
      }, {});

      // Fetch forecast results using the last 30 days' data
      const forecastResults = calculateSMAForecast(salesDataForForecast);

      const recommendations = products
        .map((product) => {
          const salesForecast = forecastResults[product.product_id] || {
            lead_time_demand: 0,
          };
          const currentStock = product.product_stock;

          // Calculate recommended stock based on forecast
          let recommendedStock = Math.round(salesForecast.lead_time_demand);

          // Adjust recommendation based on current stock
          let stockToOrder = Math.max(0, recommendedStock - currentStock);

          return {
            productName: product.product_name,
            branchName: product.product_branch_name,
            currentStock: currentStock,
            recommendedStock: stockToOrder,
          };
        })
        .filter((rec) => rec.recommendedStock > 0); // Only include if recommendation > 0

      console.log("recommendations", recommendations);

      res.render("admin_forecast", {
        recommendationList: recommendations,
        branches: req.branches,
      });
    } catch (error) {
      console.error("[/admin/inventory/forecast] Error:", error.message);
      console.error("Stack Trace:", error.stack);
      res.status(500).send("Internal Server Error");
    }
  }
);

manage_inventory.post(
  "/admin/inventory/archived-products/unarchive-product",
  async (req, res) => {
    const productId = req.body.id;

    try {
      const result = await UNARCHIVE_PRODUCT(productId);

      if (result.success) {
        res.json({ success: true });
      } else {
        res.status(500).json({ success: false, message: result.message });
      }
    } catch (error) {
      console.error("Error unarchiving product:", error.message);
      res.status(500).json({ success: false });
    }
  }
);

manage_inventory.post(
  "/admin/inventory/archived-products/delete-product",
  async (req, res) => {
    const productId = req.body.id;

    try {
      const result = await DELETE_PRODUCT(productId);

      if (result.success) {
        res.json({ success: true });
      } else {
        res.status(500).json({ success: false, message: result.message });
      }
    } catch (error) {
      console.error("Error unarchiving product:", error.message);
      res.status(500).json({ success: false });
    }
  }
);

manage_inventory.post(
  "/admin/inventory/add-product",
  FETCH_PRODUCTS,
  async (req, res) => {
    try {
      // Destructure product data from request body, including new category fields
      const {
        productName,
        productBrand,
        productStock,
        productPrice,
        productCost,
        selectedBranchIds,
        selectedBranchNames,
        productCategoryId, // New field
        productCategoryName,
        supplierId,
        supplierName, // New field
      } = req.body;

      console.log("Received product data:", supplierId, supplierName);

      // Call ADD_PRODUCT controller to add product, including the new category data
      const result = await ADD_PRODUCT({
        productName,
        productBrand,
        productStock,
        productPrice,
        productCost,
        selectedBranchIds,
        selectedBranchNames,
        productCategoryId, // Pass category ID to ADD_PRODUCT controller
        productCategoryName,
        supplierId,
        supplierName, // Pass category name to ADD_PRODUCT controller
      });

      // Handle response based on operation success
      if (result.success) {
        // Fetch updated products after adding a new product
        const productsResponse = await FETCH_UPDATED_PRODUCTS();

        if (productsResponse.error) {
          // Handle error if products fetch fails
          return res.status(500).json({ message: "Failed to fetch products" });
        }

        // Return success message and details
        res.status(200).json({
          message: "Product operation completed",
          successfulBranches: result.successfulBranches,
          failedBranches: result.failedBranches,
          products: productsResponse.products,
        });
      } else {
        // Return specific error message if operation failed
        res.status(400).json({ message: result.error });
      }
    } catch (error) {
      console.error("[/admin/inventory/add-product]", error);
      res.status(500).send("Internal Server Error"); // Handle server error if any
    }
  }
);

// Handle POST request to edit a product
manage_inventory.post("/admin/inventory/edit-product", async (req, res) => {
  const {
    product_id,
    product_name,
    product_brand,
    product_cost,
    product_price,
    product_category_id,
    product_category_name, // Add category ID to request body
  } = req.body;

  // Log the received values to the console
  console.log("Received values:", {
    product_id,
    product_name,
    product_brand,
    product_cost,
    product_price,
    product_category_id,
    product_category_name,
  });

  try {
    // Call EDIT_PRODUCT controller to edit product
    const result = await EDIT_PRODUCT(
      product_id,
      product_name,
      product_brand,
      product_cost,
      product_price,
      product_category_id,
      product_category_name // Pass category ID to the EDIT_PRODUCT function
    );

    // Handle response based on operation success
    res.status(200).json(result); // Send success message and data to the front end
  } catch (error) {
    console.error("Error updating product:", error.message);
    res.status(500).json({ error: error.message }); // Handle server error if any
  }
});

manage_inventory.post("/admin/inventory/restock-product", async (req, res) => {
  const { productId, restockAmount } = req.body;

  try {
    const updatedProduct = await RESTOCK_PRODUCT(productId, restockAmount);
    res
      .status(200)
      .json({ message: "Product restocked successfully", updatedProduct });
  } catch (error) {
    console.error("Error restocking product:", error.message);
    res.status(500).json({ error: "Failed to restock product." });
  }
});

manage_inventory.post(
  "/admin/inventory/void-stock-product",
  async (req, res) => {
    const { productId, voidAmount } = req.body;

    try {
      const updatedProduct = await VOID_STOCK(productId, voidAmount);
      res
        .status(200)
        .json({ message: "Stock voided successfully", updatedProduct });
    } catch (error) {
      console.error("Error voiding stock:", error.message);

      res.status(500).json({ message: "Failed to void stock." });
    }
  }
);

manage_inventory.post("/admin/inventory/archive-product", async (req, res) => {
  const { productId } = req.body;
  console.log("Received Product ID: ", productId); // Log received product ID for debugging purposes

  try {
    const result = await ARCHIVE_PRODUCT(productId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to save the category
manage_inventory.post("/admin/inventory/save-category", async (req, res) => {
  const { product_category } = req.body; // Extract the category name from the request body

  try {
    // Check if the category already exists
    const exists = await categoryExists(product_category);
    if (exists) {
      return res.status(400).json({ error: "Category name already exists." });
    }

    const newCategory = await saveCategory(product_category.trim()); // Call the external function, trim spaces
    // Respond with the newly created category
    res
      .status(201)
      .json({ message: "Category added successfully", category: newCategory });
  } catch (error) {
    console.error("Error adding category:", error.message);
    res.status(500).json({ error: "Failed to add category" }); // Respond with error
  }
});

// Edit an existing category
manage_inventory.put("/admin/inventory/edit-category/:id", async (req, res) => {
  const categoryId = req.params.id;
  const { product_category } = req.body;

  try {
    // Check if the new category name already exists (excluding the current category)
    const exists = await categoryExists(product_category);
    if (exists) {
      return res.status(400).json({ error: "Category name already exists." });
    }

    const updatedCategory = await editCategory(
      categoryId,
      product_category.trim()
    ); // Trim spaces before updating
    res.json({
      message: "Category updated successfully",
      category: updatedCategory,
    });
  } catch (error) {
    console.error("Error updating category:", error.message);
    res.status(500).json({ error: "Failed to update category" });
  }
});

// Delete a category
manage_inventory.delete(
  "/admin/inventory/delete-category/:id",
  async (req, res) => {
    const categoryId = req.params.id;

    try {
      // Step 1: Remove the category reference from associated products
      await removeCategoryFromProducts(categoryId);

      // Step 2: Now delete the category itself
      await deleteCategory(categoryId); // Implement the deleteCategory function

      res.json({
        success: true,
        message: "Category removed from products and deleted successfully",
      });
    } catch (error) {
      console.error(
        "Error removing category from products or deleting category:",
        error.message
      );
      res.status(500).json({
        error: "Failed to remove category from products and/or delete category",
      });
    }
  }
);

module.exports = manage_inventory; // Export manage_inventory router for use in main Express application
