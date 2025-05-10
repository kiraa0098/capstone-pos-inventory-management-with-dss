const express = require("express");
const manage_sales_report = express.Router();
const { VERIFY_ADMIN_TOKEN } = require("../middleware/verify_webtoken");
const salesController = require("../controllers/sales_controller"); // Import the sales controller

// Route to render the sales and reports page
manage_sales_report.get(
  "/admin/sales-and-reports",
  VERIFY_ADMIN_TOKEN, // Middleware to verify admin token
  async (req, res) => {
    try {
      res.render("admin_sales_report", {}); // Render the EJS view
    } catch (error) {
      console.error("[/admin/sales-and-reports]", error);
      res.status(500).send("Internal Server Error");
    }
  }
);

// API route to get sales data for a specific year
manage_sales_report.get(
  "/api/sales-data",
  VERIFY_ADMIN_TOKEN, // You can protect this route if necessary
  salesController.getSalesData // Use the controller method to fetch sales data
);

// API route to get available years
manage_sales_report.get(
  "/api/available-years",
  VERIFY_ADMIN_TOKEN,
  salesController.getAvailableYears
);

manage_sales_report.get(
  "/api/branch-performance",
  VERIFY_ADMIN_TOKEN,
  salesController.getBranchPerformance
);

manage_sales_report.get(
  "/api/top-products",
  VERIFY_ADMIN_TOKEN,
  salesController.getTopProducts // New method for top products
);

manage_sales_report.get(
  "/api/available-branches",
  VERIFY_ADMIN_TOKEN,
  salesController.getAvailableBranches // Use the new controller method
);

manage_sales_report.get(
  "/api/export-report",
  VERIFY_ADMIN_TOKEN, // Middleware to verify admin access
  salesController.exportSalesReport // Connect the controller method here
);

manage_sales_report.get(
  "/api/refund-logs", // Define the endpoint for refund logs
  VERIFY_ADMIN_TOKEN, // Middleware to verify admin access
  salesController.getRefundLogs // Connect the refund logs controller method here
);

manage_sales_report.get(
  "/api/transaction-logs", // Define the endpoint for transaction logs
  VERIFY_ADMIN_TOKEN, // Middleware to verify admin access
  salesController.getTransactionLogs // Connect the transaction logs controller method
);

manage_sales_report.get(
  "/api/daily-sales-data", // Define the endpoint for daily sales data
  VERIFY_ADMIN_TOKEN, // Middleware to verify admin access
  salesController.getDailySalesData // Connect to the `getDailySalesData` controller method
);

manage_sales_report.get(
  "/api/weekly-sales-data", // Define the endpoint for weekly sales data
  VERIFY_ADMIN_TOKEN, // Middleware to verify admin access
  salesController.getWeeklySalesData // Connect to the `getWeeklySalesData` controller method
);

module.exports = manage_sales_report;
