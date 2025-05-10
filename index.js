// index.js
const path = require("path");
const { app: electronApp } = require("electron"); // Rename Electron's app variable to electronApp
const isProduction = process.env.NODE_ENV === "production";

// Load environment variables
if (isProduction) {
  require("dotenv").config({
    path: path.join(electronApp.getAppPath(), ".env"),
  });
} else {
  require("dotenv").config();
}

const express = require("express");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const http = require("http"); // Import http module
const {
  listenToLoginHistoryTable,
  listenToSalesTable,
  setWebSocketServer,
  listenToSoldProductsTable,
} = require("./src/services/supabaseListeners"); // Import the functions

const expressApp = express(); // Rename the Express app variable
const port = 3000;

// Define paths for views and public static files
const viewsPath = isProduction
  ? path.join(electronApp.getAppPath(), "src", "views")
  : path.join(__dirname, "src", "views");

const publicPath = isProduction
  ? path.join(electronApp.getAppPath(), "public")
  : path.join(__dirname, "public");

expressApp.set("view engine", "ejs");
expressApp.set("views", viewsPath);
expressApp.use(express.static(publicPath));

expressApp.use(
  session({
    store: new session.MemoryStore(),
    secret: process.env.SESSION_SECRET || "your_secret_key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

expressApp.use(cookieParser());
expressApp.use(express.json());
expressApp.use(express.urlencoded({ extended: true }));

expressApp.get("/", (req, res) => {
  res.redirect("/login");
});

expressApp.get("/check-connectivity", (req, res) => {
  res.status(200).send("OK");
});

// Set up WebSocket server
const server = http.createServer(expressApp); // Create an HTTP server
setWebSocketServer(server); // Set the WebSocket server

// Call the subscription function during server startup
listenToSalesTable();
listenToLoginHistoryTable();
listenToSoldProductsTable();

// Include your route files
const loginRoutes = require("./src/routes/login_routes.js");
expressApp.use(loginRoutes);

const adminRoutes = require("./src/routes/admin_routes.js");
expressApp.use(adminRoutes);

const manageBranchRoutes = require("./src/routes/manage_branch_routes.js");
expressApp.use(manageBranchRoutes);

const manageInventoryRoutes = require("./src/routes/manage_inventory_routes.js");
expressApp.use(manageInventoryRoutes);

const manageOrderRoutes = require("./src/routes/manage_order_routes.js"); // Pass broadcast function
expressApp.use(manageOrderRoutes);

const manageSupplierRoutes = require("./src/routes/manage_supplier_routes.js");
expressApp.use(manageSupplierRoutes);

const manage_sales_report = require("./src/routes/manage_sales_report_routes.js");
expressApp.use(manage_sales_report);

const manageAdminRoutes = require("./src/routes/manageAdmin_routes.js");
expressApp.use(manageAdminRoutes);

// Start the server
// server.listen(port, () => {
//   console.log(`Server running on http://localhost:${port}`);
// });

function startServer() {
  return new Promise((resolve) => {
    server.listen(port, () => {
      // Change this to server.listen
      console.log(`Server running on http://localhost:${port}`);
      resolve();
    });
  });
}

module.exports = { startServer };
