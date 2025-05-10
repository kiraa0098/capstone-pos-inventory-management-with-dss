const supabase = require("../services/database");

// Function to fetch sales records by branch_id
async function FETCH_SALES_BY_BRANCH(branchId) {
  try {
    const { data, error } = await supabase
      .from("sales")
      .select("*")
      .eq("sale_branch_id", branchId);

    if (error) {
      console.error("Error fetching sales data:", error);
      throw new Error("Error fetching sales data.");
    }

    return data;
  } catch (error) {
    console.error("Error in FETCH_SALES_BY_BRANCH:", error.message);
    throw error;
  }
}

// Function to fetch sold products by sales_id
async function FETCH_SOLD_PRODUCTS_BY_SALES_ID(salesIds) {
  try {
    const { data, error } = await supabase
      .from("sold_products")
      .select("*")
      .in("sold_product_sale_id", salesIds); // Fetch products for all sales IDs

    return data;
  } catch (error) {
    console.error("Error in FETCH_SOLD_PRODUCTS_BY_SALES_ID:", error.message);
    throw error;
  }
}

// Function to fetch today's sales for each branch
const FETCH_TODAYS_SALES_PER_BRANCH = async () => {
  // Get today's date in YYYY-MM-DD format
  const today = new Date();
  const todayStart = new Date(today.setUTCHours(0, 0, 0, 0)).toISOString(); // Start of the day in UTC
  const todayEnd = new Date(today.setUTCHours(23, 59, 59, 999)).toISOString(); // End of the day in UTC

  try {
    // Fetch sales records for today
    const { data, error } = await supabase
      .from("sales")
      .select("*")
      .gte("sales_date", todayStart) // Start of the day
      .lte("sales_date", todayEnd); // End of the day

    if (error) {
      console.error("Error fetching today's sales:", error);
      throw new Error("Error fetching today's sales.");
    }

    // Calculate total sales per branch
    const salesPerBranch = data.reduce((acc, sale) => {
      const branchId = sale.sale_branch_id;
      const totalSales = sale.sales_total_price || 0; // Use 0 if sales_total_price is null

      if (!acc[branchId]) {
        acc[branchId] = {
          sale_branch_id: branchId,
          total_sales: 0,
        };
      }

      acc[branchId].total_sales += totalSales; // Accumulate total sales for the branch
      return acc;
    }, {});

    // Convert the result back to an array
    return Object.values(salesPerBranch); // Return an array of total sales per branch
  } catch (error) {
    console.error("Error in FETCH_TODAYS_SALES_PER_BRANCH:", error.message);
    throw error;
  }
};

async function FETCH_PRODUCTS_RECORDS(lastYearStart, lastYearEnd) {
  const { data: salesData, error } = await supabase
    .from("sold_products")
    .select(
      "product_id, sold_product_name, sold_product_quantity, sold_product_date"
    )
    .gte("sold_product_date", lastYearStart)
    .lte("sold_product_date", lastYearEnd);

  if (error) {
    throw new Error(`Error fetching product records: ${error.message}`);
  }

  return salesData;
}

const FETCH_YEAR_SALES = async (req, res, next) => {
  try {
    // Query the 'sales' table to get all sales_date entries
    const { data, error } = await supabase.from("sales").select("sales_date");

    // Check for errors returned by Supabase
    if (error) {
      console.error("Error fetching sales data:", error.message);
      return res.status(500).json({ error: "Error fetching sales data" });
    }

    // Extract distinct years from sales_date
    const years = [
      ...new Set(
        data.map((record) => new Date(record.sales_date).getFullYear())
      ),
    ].sort((a, b) => b - a); // Sort years in descending order

    // Attach the years data to the request object for use in subsequent middleware or route handlers
    req.years = years;
    next();
  } catch (error) {
    console.error("Unexpected error:", error.message);
    res.status(500).json({ error: "Unexpected error" });
  }
};

async function FETCH_SOLD_PRODUCTS_BY_SALE_ID(saleId) {
  const { data, error } = await supabase
    .from("sold_products")
    .select("*")
    .eq("sold_product_sale_id", saleId);

  if (error) {
    console.error("Error fetching sold products:", error);
    return null;
  }

  return data;
}

async function FETCH_SALE_DETAILS_BY_SALE_ID(saleId) {
  // Query Supabase to get sale details
  const { data, error } = await supabase
    .from("sales") // assuming 'sales' is your table name
    .select("*")
    .eq("sales_id", saleId);

  if (error) {
    console.error("Error fetching sale details:", error);
    return null;
  }

  if (data.length === 0) {
    console.log("Sale not found.");
    return null;
  }

  return data[0]; // Return the first matching result
}

module.exports = {
  FETCH_SALE_DETAILS_BY_SALE_ID,
  FETCH_SOLD_PRODUCTS_BY_SALE_ID,
  FETCH_SALES_BY_BRANCH,
  FETCH_PRODUCTS_RECORDS,
  FETCH_YEAR_SALES,
  FETCH_TODAYS_SALES_PER_BRANCH, // Export the new function
};
