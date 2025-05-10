// src/services/supabaseListeners.js
const supabase = require("./database"); // Adjust the path if necessary
const WebSocket = require("ws");
const {
  FETCH_TODAYS_SALES_PER_BRANCH,
} = require("../middleware/fetch_order_sale");
const COMPUTE_REVENUE_GENERATED = require("../controllers/compute_revenue_generated");
const { GET_ALL_PRODUCT } = require("../middleware/fetch_products");
const { sendOutOfStockEmail } = require("../utils/sendOutOfStockEmail");
const { FETCH_ADMIN_INFO } = require("../middleware/fetch_admin_info");

let wss; // Declare WebSocket server variable

// Function to set the WebSocket server
const setWebSocketServer = (server) => {
  wss = new WebSocket.Server({ server });
};

// Broadcast function to send updates to all connected clients
const broadcast = (message) => {
  if (wss) {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }
};

// Function to handle inserts
const updateStock = async (payload) => {
  const { sales_id } = payload.new;

  const { data: soldProducts, error: soldProductsError } = await supabase
    .from("sold_products")
    .select("*")
    .eq("sold_product_sale_id", sales_id);

  if (soldProductsError) {
    console.error("Error retrieving sold products:", soldProductsError.message);
    return;
  }

  // Prepare the payload for broadcasting
  const broadcastPayload = {
    type: "updateStock",
    payload: {
      sale: payload.new,
      soldProducts: soldProducts,
    },
  };

  // Broadcast the message to clients
  broadcast(JSON.stringify(broadcastPayload));
};

const updateTodaySales = async (payload) => {
  // Retrieve the sale details
  const { sale_branch_id } = payload.new;

  // Fetch updated today's sales for all branches
  const todaysSalesPerBranch = await FETCH_TODAYS_SALES_PER_BRANCH();

  console.log("todaysSalesPerBranch:", todaysSalesPerBranch);

  // Prepare the payload for broadcasting
  const broadcastPayload = {
    type: "updateTodaySales",
    payload: {
      branchId: sale_branch_id, // Include the branch ID
      todaysSalesPerBranch: todaysSalesPerBranch, // Include updated today's sales
    },
  };

  broadcast(JSON.stringify(broadcastPayload));
};

const updateMonthlyRevenueAndUnits = async (payload) => {
  // Get the current month and year
  const now = new Date();
  const month = now.getMonth() + 1; // getMonth() returns 0-11, so we add 1
  const year = now.getFullYear(); // gets the current year (e.g., 2024)

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

  // Prepare the payload for broadcasting
  const broadcastPayload = {
    type: "updateMonthlyRevenueAndUnits",
    payload: {
      productsWithRevenue: productsWithRevenue, // Include updated today's sales
    },
  };

  broadcast(JSON.stringify(broadcastPayload));
};

// Set up Supabase real-time subscription
async function listenToSalesTable() {
  const { data: subscription, error } = await supabase
    .channel("sales")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "sales" },
      updateStock
    )
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "sales" },
      updateTodaySales
    )
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "sales" },
      updateMonthlyRevenueAndUnits
    )
    .subscribe();

  if (error) {
    console.error("Error subscribing to sales table:", error.message);
  } else {
    console.log("Successfully subscribed to sales table.");
  }
}

// Function to handle new login history entry
const handleNewLoginHistory = async (payload) => {
  // Extract the newly inserted login entry from the payload
  const { new: newLogin } = payload;

  // Prepare the payload for broadcasting
  const broadcastPayload = {
    type: "newLoginHistory",
    payload: {
      loginDate: new Date(newLogin.login_date).toLocaleString(),
      branchName: newLogin.login_branch_name,
      personnelName: newLogin.login_branch_personel_name,
      action: newLogin.Action,
    },
  };

  // Broadcast the new login history entry
  broadcast(JSON.stringify(broadcastPayload));
};

// Set up Supabase real-time subscription for login history
async function listenToLoginHistoryTable() {
  const { data: subscription, error } = await supabase
    .channel("login_history")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "login_history" },
      handleNewLoginHistory
    )
    .subscribe();

  if (error) {
    console.error("Error subscribing to login_history table:", error.message);
  } else {
    console.log("Successfully subscribed to login_history table.");
  }
}

const handleNewSoldProduct = async (payload) => {
  try {
    const { product_id } = payload.new;

    const email = await FETCH_ADMIN_INFO();

    const adminEmail = email[0].admin_email;

    // Fetch the current stock of the sold product from the product table
    const { data: product, error: productError } = await supabase
      .from("product")
      .select("product_name, product_stock, product_branch_name")
      .eq("product_id", product_id)
      .single();

    if (productError) {
      console.error(
        "Error fetching product information:",
        productError.message
      );
      return;
    }

    // Check if the product stock is zero
    if (product.product_stock === 0) {
      // Send an out-of-stock email notification to the admin
      await sendOutOfStockEmail(
        product.product_name,
        product.product_branch_name,
        adminEmail
      );
      console.log(
        `Out-of-stock notification sent for product: ${product.product_name}`
      );
    }
  } catch (error) {
    console.error("Error in handleNewSoldProduct:", error.message);
  }
};

// Set up Supabase real-time subscription for sold products table
async function listenToSoldProductsTable() {
  const { data: subscription, error } = await supabase
    .channel("sold_products")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "sold_products" },
      handleNewSoldProduct
    )
    .subscribe();

  if (error) {
    console.error("Error subscribing to sold_products table:", error.message);
  } else {
    console.log("Successfully subscribed to sold_products table.");
  }
}

// Export the functions
module.exports = {
  listenToSalesTable,
  setWebSocketServer,
  listenToLoginHistoryTable,
  listenToSoldProductsTable,
};
