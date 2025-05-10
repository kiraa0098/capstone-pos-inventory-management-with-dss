const supabase = require("../services/database");
const { Parser } = require("json2csv"); // json2csv library to convert JSON to CSV

exports.exportSalesReport = async (req, res) => {
  const { year, month, branch } = req.query;

  try {
    let query = supabase
      .from("sales")
      .select("*") // Adjust columns as per your requirement
      .eq("branch_name", branch)
      .gte("sales_date", `${year}-01-01`);

    // If "all" is selected for the month, fetch data for the whole year
    if (month !== "all") {
      const lastDay = new Date(year, month, 0).getDate(); // Dynamically get the last day of the month
      query = query.lte("sales_date", `${year}-${month}-${lastDay}`);
    } else {
      query = query.lte("sales_date", `${year}-12-31`);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase Error:", error.message);
      throw error;
    }

    // Convert the fetched data to CSV
    const json2csvParser = new Parser();
    const csv = json2csvParser.parse(data);

    // Set the response headers to download the CSV
    res.header("Content-Type", "text/csv");
    res.attachment(`sales-report-${branch}-${month}-${year}.csv`);
    res.send(csv);
  } catch (error) {
    console.error("Error exporting sales report:", error.message);
    res.status(500).json({ error: "Failed to export sales report" });
  }
};

exports.getSalesData = async (req, res) => {
  const { year, branch } = req.query; // Add branch parameter

  try {
    let query = supabase
      .from("sales")
      .select("sales_total_price, sales_total_cost, sales_date")
      .gte("sales_date", `${year}-01-01`)
      .lte("sales_date", `${year}-12-31`);

    if (branch && branch !== "all") {
      query = query.eq("branch_name", branch); // Filter by branch if provided
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase Error:", error.message);
      throw error;
    }

    const monthlySales = Array(12).fill(0);
    const monthlyCosts = Array(12).fill(0);

    data.forEach((sale) => {
      const month = new Date(sale.sales_date).getMonth(); // Get the month index
      monthlySales[month] += sale.sales_total_price; // Sum sales by month
      monthlyCosts[month] += sale.sales_total_cost; // Sum costs by month
    });

    // Calculate net revenue
    const netRevenue = monthlySales.map(
      (sales, index) => sales - monthlyCosts[index]
    );

    res.json({ monthlySales, monthlyCosts, netRevenue }); // Send sales, costs, and net revenue data as JSON
  } catch (error) {
    console.error("Error fetching sales data:", error.message);
    res.status(500).json({ error: "Failed to fetch sales data" });
  }
};

exports.getAvailableYears = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("sales") // Replace with your actual table name
      .select("sales_date")
      .order("sales_date", { ascending: true })
      .limit(1); // Fetch the oldest date to determine the earliest year

    if (error) {
      console.error("Supabase Error:", error.message);
      throw error;
    }

    if (data.length === 0) {
      res.json([]); // No data available
      return;
    }

    const oldestDate = new Date(data[0].sales_date);
    const currentYear = new Date().getFullYear();
    const years = [];

    for (let year = oldestDate.getFullYear(); year <= currentYear; year++) {
      years.push(year);
    }

    res.json(years);
  } catch (error) {
    console.error("Error fetching available years:", error.message);
    res.status(500).json({ error: "Failed to fetch available years" });
  }
};

exports.getAvailableBranches = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("branch") // Changed to the 'branch' table
      .select("branch_name"); // Fetch only the branch_name column

    if (error) {
      console.error("Supabase Error:", error.message);
      throw error;
    }

    // Check if data exists and is not empty
    if (!data || data.length === 0) {
      return res.json([]); // Return an empty array if no branches are found
    }

    // Extract unique branch names
    const uniqueBranches = [
      ...new Set(data.map((branch) => branch.branch_name)),
    ];

    res.json(uniqueBranches); // Send unique branches as JSON
  } catch (error) {
    console.error("Error fetching available branches:", error.message);
    res.status(500).json({ error: "Failed to fetch available branches" });
  }
};

exports.getBranchPerformance = async (req, res) => {
  const { year } = req.query; // Get the year from the query parameters
  try {
    const { data, error } = await supabase
      .from("sales")
      .select("branch_name, sales_total_price")
      .gte("sales_date", `${year}-01-01`)
      .lte("sales_date", `${year}-12-31`);

    if (error) {
      console.error("Supabase Error:", error.message);
      throw error;
    }

    const branchPerformance = {};

    data.forEach((sale) => {
      const { branch_name, sales_total_price } = sale;
      if (branchPerformance[branch_name]) {
        branchPerformance[branch_name] += sales_total_price;
      } else {
        branchPerformance[branch_name] = sales_total_price;
      }
    });

    const branchNames = Object.keys(branchPerformance);
    const branchData = Object.values(branchPerformance);

    res.json({ branchNames, branchData });
  } catch (error) {
    console.error("Error fetching branch performance data:", error.message);
    res.status(500).json({ error: "Failed to fetch branch performance data" });
  }
};

exports.getTopProducts = async (req, res) => {
  try {
    const { year } = req.query; // Get the year from the query string

    if (!year) {
      return res.status(400).json({ error: "Year is required" });
    }

    const { data: topProducts, error } = await supabase.rpc(
      "get_top_products",
      { selected_year: parseInt(year, 10) }
    ); // Pass the year to the RPC function

    if (error) {
      console.error("Supabase RPC error:", error.message);
      return res
        .status(400)
        .json({ error: "Failed to fetch top products from database" });
    }

    if (!Array.isArray(topProducts)) {
      console.warn("Unexpected response format from Supabase RPC.");
      return res.status(500).json({ error: "Invalid data format received" });
    }

    // console.log(`Fetched top products for year ${year}:`, topProducts);

    res.status(200).json(topProducts);
  } catch (error) {
    console.error("Unexpected server error:", error);
    res.status(500).json({
      error: "An unexpected error occurred while fetching top products",
    });
  }
};

exports.getRefundLogs = async (req, res) => {
  try {
    const { year, month, branch } = req.query; // Get year, month, and branch from the query string

    // Check if year is provided, if not return an error
    if (!year) {
      return res.status(400).json({ error: "Year is required" });
    }

    // Build the Supabase RPC query
    const { data: refundLogs, error } = await supabase.rpc("get_refund_logs", {
      selected_year: parseInt(year, 10),
      selected_month: month !== "all" ? parseInt(month, 10) : null, // Only pass month if it's not 'all'
      selected_branch: branch !== "all" ? branch : null, // Only pass branch if it's not 'all'
    });

    if (error) {
      console.error("Supabase RPC error:", error.message);
      return res
        .status(400)
        .json({ error: "Failed to fetch refund logs from database" });
    }

    if (!Array.isArray(refundLogs)) {
      console.warn("Unexpected response format from Supabase RPC.");
      return res.status(500).json({ error: "Invalid data format received" });
    }

    console.log(
      `Fetched refund logs for year ${year}, month ${month}, branch ${branch}:`,
      refundLogs
    );

    res.status(200).json(refundLogs);
  } catch (error) {
    console.error("Unexpected server error:", error);
    res.status(500).json({
      error: "An unexpected error occurred while fetching refund logs",
    });
  }
};

exports.getTransactionLogs = async (req, res) => {
  try {
    const { year, month, branch } = req.query; // Get year, month, and branch from the query string

    // Check if year is provided, if not return an error
    if (!year) {
      return res.status(400).json({ error: "Year is required" });
    }

    // Build the Supabase RPC query
    const { data: transactionLogs, error } = await supabase.rpc(
      "get_transaction_logs",
      {
        selected_year: parseInt(year, 10),
        selected_month: month !== "all" ? parseInt(month, 10) : null, // Only pass month if it's not 'all'
        selected_branch: branch !== "all" ? branch : null, // Only pass branch if it's not 'all'
      }
    );

    if (error) {
      console.error("Supabase RPC error:", error.message);
      return res
        .status(400)
        .json({ error: "Failed to fetch transaction logs from database" });
    }

    if (!Array.isArray(transactionLogs)) {
      console.warn("Unexpected response format from Supabase RPC.");
      return res.status(500).json({ error: "Invalid data format received" });
    }

    // Format the transaction logs to match the required structure
    const formattedLogs = transactionLogs.map((log) => {
      return {
        date: log.transaction_date
          ? new Date(log.transaction_date).toLocaleString()
          : "No date", // Format date if available
        name: log.customer_name || "No name", // Default to 'No name' if not available
        total_price: log.total_price || 0, // Default to 0 if not available
        payment_mode: log.payment_mode || "Unknown", // Default to 'Unknown' if not available
        payment_amount: log.payment_amount || 0, // Default to 0 if not available
        discount: log.discount || 0, // Default to 0 if not available
        bank: log.bank || "Unknown", // Default to 'Unknown' if not available
        transaction_number: log.transaction_number || "No number", // Default to 'No number' if not available
      };
    });

    // console.log(
    //   `Fetched transaction logs for year ${year}, month ${month}, branch ${branch}:`,
    //   formattedLogs
    // );

    // Return the formatted transaction logs
    res.status(200).json(formattedLogs);
  } catch (error) {
    console.error("Unexpected server error:", error);
    res.status(500).json({
      error: "An unexpected error occurred while fetching transaction logs",
    });
  }
};


exports.getDailySalesData = async (req, res) => {
  let { year, month, branch } = req.query;

  try {
    // Validate and provide default values for year and month
    if (!year || isNaN(year)) {
      year = new Date().getFullYear(); // Default to the current year
    }
    if (!month || isNaN(month) || month < 1 || month > 12) {
      month = new Date().getMonth() + 1; // Default to the current month
    }

    // Ensure month is in two-digit format
    month = String(month).padStart(2, "0");

    // Calculate the start and end dates for the given month
    const startDate = `${year}-${month}-01`;

    // Get the last day of the month dynamically (e.g., 31 for January, 28 for February, etc.)
    const lastDayOfMonth = new Date(year, month, 0).getDate(); // This gives the last day of the month
    const endDate = `${year}-${month}-${lastDayOfMonth}`;

    // Initialize the query
    let query = supabase
      .from("sales")
      .select("sales_total_price, sales_date")
      .gte("sales_date", startDate)
      .lte("sales_date", endDate);

    // Add the branch filter if provided
    if (branch && branch !== "all") {
      query = query.eq("branch_name", branch);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase Error:", error.message);
      throw error;
    }

    // Initialize an array to store daily sales totals (31 days maximum)
    const dailySales = Array(lastDayOfMonth).fill(0); // Adjust size according to last day of month

    // Loop through sales data and accumulate sales per day
    data.forEach((sale) => {
      const day = new Date(sale.sales_date).getDate(); // Extract day from sales date
      dailySales[day - 1] += sale.sales_total_price; // Add sales to the corresponding day
    });

    // Return the daily sales data as JSON
    res.json({ dailySales });
  } catch (error) {
    console.error("Error fetching daily sales data:", error.message);
    res.status(500).json({ error: "Error fetching daily sales data." });
  }
};

exports.getWeeklySalesData = async (req, res) => {
  let { year, month, branch } = req.query;

  try {
    // Validate and provide default values for year and month
    if (!year || isNaN(year)) {
      year = new Date().getFullYear(); // Default to the current year
    }
    if (!month || isNaN(month) || month < 1 || month > 12) {
      month = new Date().getMonth() + 1; // Default to the current month
    }

    // Ensure month is in two-digit format
    month = String(month).padStart(2, "0");

    // Calculate the start and end dates for the given month
    const startDate = `${year}-${month}-01`;

    // Get the last day of the month dynamically (e.g., 31 for January, 28 for February, etc.)
    const lastDayOfMonth = new Date(year, month, 0).getDate(); // This gives the last day of the month
    const endDate = `${year}-${month}-${lastDayOfMonth}`;

    // Calculate the number of weeks in the month
    const numOfWeeks = Math.ceil(lastDayOfMonth / 7); // Calculate number of weeks in the month

    // Initialize the query
    let query = supabase
      .from("sales")
      .select("sales_total_price, sales_date")
      .gte("sales_date", startDate)
      .lte("sales_date", endDate);

    // Add the branch filter if provided
    if (branch && branch !== "all") {
      query = query.eq("branch_name", branch);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase Error:", error.message);
      throw error;
    }

    // Initialize an array to store weekly sales totals (4 to 5 weeks depending on the month)
    const weeklySales = Array(numOfWeeks).fill(0); // Placeholder for weekly sales

    // Loop through sales data and accumulate sales per week
    data.forEach((sale) => {
      const saleDate = new Date(sale.sales_date);
      const dayOfMonth = saleDate.getDate(); // Extract day from sales date

      // Calculate the week number (1 to 5)
      const weekNumber = Math.ceil(dayOfMonth / 7); // Divide the day of the month by 7 and round up

      // Add sales to the corresponding week
      weeklySales[weekNumber - 1] += sale.sales_total_price;
    });

    // Return the weekly sales data as JSON
    res.json({ weeklySales });
  } catch (error) {
    console.error("Error fetching weekly sales data:", error.message);
    res.status(500).json({ error: "Error fetching weekly sales data." });
  }
};

