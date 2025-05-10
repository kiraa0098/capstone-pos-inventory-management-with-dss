const { VERIFY_BRANCH_TOKEN } = require("../middleware/verify_webtoken");
const supabase = require("../services/database");
const { FETCH_PRODUCT_BY_BRANCH } = require("../middleware/fetch_products");
const {
  FETCH_SALES_BY_BRANCH,
  FETCH_SOLD_PRODUCTS_BY_SALE_ID,
  FETCH_SALE_DETAILS_BY_SALE_ID,
} = require("../middleware/fetch_order_sale");
const {
  FETCH_BRANCHES,
  FETCH_BRANCH_BY_ID,
} = require("../middleware/fetch_branches");
const { PROCESS_ORDER } = require("../controllers/process_order");
const { PRINT_RECEIPT } = require("../controllers/receipt_printer");
const processRefund = require("../controllers/refund");
const {
  fetchRefunds,
  FETCH_REFUND_PRODUCTS_BY_SALE_ID,
} = require("../middleware/fetch_refund");

const { Router } = require("express");
const { log } = require("console");
const manage_order_routes = Router(); // Create a router instance for login routes

manage_order_routes.get(
  "/orders/:branch_id",
  VERIFY_BRANCH_TOKEN,
  async (req, res) => {
    try {
      const branchId = req.params.branch_id;
      const branch = await FETCH_BRANCH_BY_ID(branchId);

      const todaySales = await FETCH_TODAYS_SALES_BY_BRANCH_ID(branchId);

      todaySales.total_sales = todaySales.total_sales.toFixed(2);

      //const branch_id = branch.branch_id;
      const branch_name = branch.branch_name;

      const products = await FETCH_PRODUCT_BY_BRANCH(branchId);

      const salesRecords = await FETCH_SALES_BY_BRANCH(branchId);

      const refundRecords = await fetchRefunds(branchId);

      req.session.branchId = branchId;
      req.session.branchName = branch_name;

      res.render("manage_order", {
        products,
        branch_name,
        salesRecords,
        refundRecords,
        todaySales: todaySales.total_sales,
      });
    } catch (error) {
      console.error("[/orders/:branch_id] Error rendering orders page:", error);
      res.status(500).send("Internal Server Error");
    }
  }
);

const FETCH_TODAYS_SALES_BY_BRANCH_ID = async (branchId) => {
  if (!branchId) {
    throw new Error("Branch ID is required to fetch sales.");
  }

  // Get today's date in YYYY-MM-DD format
  const today = new Date();
  const todayStart = new Date(today.setUTCHours(0, 0, 0, 0)).toISOString(); // Start of the day in UTC
  const todayEnd = new Date(today.setUTCHours(23, 59, 59, 999)).toISOString(); // End of the day in UTC

  try {
    // Fetch sales records for the given branch ID and today's date
    const { data, error } = await supabase
      .from("sales")
      .select("*")
      .eq("sale_branch_id", branchId) // Filter by branch ID
      .gte("sales_date", todayStart) // Start of the day
      .lte("sales_date", todayEnd); // End of the day

    if (error) {
      console.error(
        `Error fetching today's sales for branch ID ${branchId}:`,
        error
      );
      throw new Error(
        `Error fetching today's sales for branch ID ${branchId}.`
      );
    }

    // Calculate the total sales for the branch
    const totalSales = data.reduce((sum, sale) => {
      const saleAmount = sale.sales_total_price || 0; // Use 0 if sales_total_price is null
      return sum + saleAmount;
    }, 0);

    // Return the branch ID and total sales
    return {
      sale_branch_id: branchId,
      total_sales: totalSales,
    };
  } catch (error) {
    console.error("Error in FETCH_TODAYS_SALES_BY_BRANCH_ID:", error.message);
    throw error;
  }
};

manage_order_routes.get(
  "/fetch-refund-products/:refundId",
  VERIFY_BRANCH_TOKEN,
  async (req, res) => {
    const refundId = req.params.refundId;
    try {
      const refundProducts = await FETCH_REFUND_PRODUCTS_BY_SALE_ID(refundId); // Define this helper function
      res.json(refundProducts); // Send the sold products back as JSON
    } catch (error) {
      console.error(
        `[fetch-refund-products] Error fetching products for refund ${refundId}:`,
        error
      );
      res.status(500).json({ message: "Failed to fetch refund products." });
    }
  }
);

manage_order_routes.get(
  "/fetch-sold-products/:saleId",
  VERIFY_BRANCH_TOKEN,
  async (req, res) => {
    const saleId = req.params.saleId;
    try {
      const soldProducts = await FETCH_SOLD_PRODUCTS_BY_SALE_ID(saleId); // Define this helper function
      res.json(soldProducts); // Send the sold products back as JSON
    } catch (error) {
      console.error(
        `[fetch-sold-products] Error fetching products for sale ${saleId}:`,
        error
      );
      res.status(500).json({ message: "Failed to fetch sold products." });
    }
  }
);

manage_order_routes.get("/fetch-sale-details/:saleId", async (req, res) => {
  const saleId = req.params.saleId;

  try {
    const saleDetails = await FETCH_SALE_DETAILS_BY_SALE_ID(saleId);

    if (!saleDetails) {
      return res
        .status(404)
        .json({ success: false, message: "Sale not found" });
    }

    res.json(saleDetails);
  } catch (error) {
    console.error("Error fetching sale details:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch sale details" });
  }
});

manage_order_routes.post("/order/process-sale", async (req, res) => {
  try {
    const branchId = req.session.branchId;
    const branchName = req.session.branchName;
    const orderData = req.body; // Assuming the whole order data is in the body
    const selectedProducts = orderData.products;
    const {
      paymentAmount,
      customerName,
      paymentMethod,
      bank,
      referenceNumber,
      totalPrice,
      discountAmount = 0,
    } = orderData;

    console.log(selectedProducts);

    // Call the external function to update stock
    const result = await PROCESS_ORDER(
      selectedProducts,
      paymentAmount,
      customerName,
      paymentMethod,
      bank,
      referenceNumber,
      totalPrice,
      branchName,
      branchId,
      discountAmount
    );

    // Attempt to print receipt but don't block order processing if printer fails
    const printResult = await PRINT_RECEIPT(
      selectedProducts,
      paymentAmount,
      customerName,
      paymentMethod,
      bank,
      referenceNumber,
      totalPrice,
      branchId,
      branchName,
      discountAmount
    ).catch((error) => {
      console.error("Printer error:", error.message);
      // Log the error but do not let it affect the order processing result
      return { success: false, message: "Printer not available." };
    });

    if (!result.success) {
      return res.status(400).json({ success: false, message: result.message });
    }

    // Include the sales data and printer result in the success response
    res.status(200).json({
      success: true,
      message: "Order processed successfully!",
      data: result.data, // Pass the result data to the frontend
      printResult: printResult.message || "Receipt printing attempted.",
    });
  } catch (error) {
    console.error("Error processing order:", error.message);
    if (error.message.includes("Network error")) {
      res.status(503).json({
        success: false,
        message: "Service unavailable. Please check your internet connection.",
      });
    } else {
      res.status(500).json({ success: false, message: error.message });
    }
  }
});

manage_order_routes.post("/order/print-sale-record", async (req, res) => {
  try {
    const branchId = req.session.branchId;
    const branchName = req.session.branchName;
    const {
      soldProducts,
      payment_amount: paymentAmount,
      customer_name: customerName = "N/A",
      payment_mode: paymentMethod,
      bank = "N/A",
      transaction_number: referenceNumber = "N/A",
      sales_total_price: totalPrice,
    } = req.body;

    const selectedProducts = soldProducts.map(
      ({
        sold_product_name: productName,
        sold_product_price: productPrice,
        sold_product_quantity: quantity,
      }) => ({
        productName,
        productPrice,
        quantity,
      })
    );

    console.log(
      selectedProducts,
      paymentAmount,
      customerName,
      paymentMethod,
      bank,
      referenceNumber,
      totalPrice,
      branchId,
      branchName
    );

    const printResult = await PRINT_RECEIPT(
      selectedProducts,
      paymentAmount,
      customerName,
      paymentMethod,
      bank,
      referenceNumber,
      totalPrice,
      branchId,
      branchName
    );

    if (!printResult.success) {
      return res.status(400).json({
        success: false,
        message: printResult.message,
        error: printResult.message, // Include the error message here
      });
    }

    res.status(200).json({
      success: true,
      message: "Receipt printed successfully!",
      printResult: printResult.message,
    });
  } catch (error) {
    console.error("Unable to print receipt:", error.message);

    if (error.message.includes("Failed to fetch branch address")) {
      return res.status(400).json({
        success: false,
        message: "Failed to fetch branch address.",
        error: error.message,
      });
    } else if (error.message.includes("Printer not available")) {
      return res.status(400).json({
        success: false,
        message: "Printer not available.",
        error: error.message,
      });
    }

    // Default error response for other issues
    res.status(500).json({
      success: false,
      message: "Unable to print receipt.",
      error: error.message,
    });
  }
});

manage_order_routes.post("/order/refund", async (req, res) => {
  try {
    const branchId = req.session.branchId;
    const branchName = req.session.branchName;

    // Extract sale details and sold products from the request body
    const {
      soldProducts, // Extract soldProducts
      payment_amount: paymentAmount,
      customer_name: customerName = "N/A",
      payment_mode: paymentMethod,
      discount: discount = 0,
      sales_date: sales_date, // the day it has been sold, this is diff with refund date, okay
      bank = "N/A",
      transaction_number: referenceNumber = "N/A",
      sales_total_price: totalPrice,
      sales_total_cost: sales_total_cost,
      refundReason,
      sales_id, // Extract sale_id (which is passed from the frontend)
    } = req.body;

    // Prepare products array for insertion into refunded_products table
    const selectedProducts = soldProducts.map(
      ({
        sold_product_name: productName,
        sold_product_price: productPrice,
        sold_product_brand: brand,
        sold_product_quantity: quantity,
        sold_product_total_price: totalPrice,
        sold_product_cost: cost,
        sold_product_category: category,
        sold_product_category_id: categoryId,
        product_id: productId,
      }) => ({
        productName,
        productPrice,
        brand,
        quantity,
        totalPrice,
        cost,
        category,
        categoryId,
        productId,
      })
    );

    // External function to process the refund
    const result = await processRefund({
      saleId: sales_id, // Use sale_id here
      soldProducts: selectedProducts,
      paymentAmount,
      customerName,
      paymentMethod,
      bank,
      referenceNumber,
      totalPrice,
      refundReason,
      branchId,
      branchName,
      discount,
      sales_total_cost,
      sales_date,
    });

    if (result.success) {
      return res.status(200).json({ success: true, message: result.message });
    } else {
      return res.status(500).json({ success: false, message: result.message });
    }
  } catch (error) {
    console.error("Unable to refund:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Unable to process refund." });
  }
});

module.exports = manage_order_routes; // Export the login_routes router for use in main Express app
