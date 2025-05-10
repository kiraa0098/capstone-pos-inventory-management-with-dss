const supabase = require("../services/database");

const COMPUTE_REVENUE_GENERATED = async (
  month = new Date().toLocaleString("default", { month: "long" }),
  year = new Date().getFullYear()
) => {
  try {
    // Convert month name to month number (1-12)
    const monthNumber = new Date(Date.parse(month + " 1, 2021")).getMonth() + 1; // 1-based index for month

    // Construct start and end dates for the month in UTC
    const startDate = new Date(
      Date.UTC(year, monthNumber - 1, 1)
    ).toISOString();
    const endDate = new Date(Date.UTC(year, monthNumber, 1)).toISOString();

    // Fetch sales data within the date range
    const { data: salesData, error } = await supabase
      .from("sold_products")
      .select("product_id, sold_product_total_price, sold_product_quantity")
      .gte("sold_product_date", startDate)
      .lt("sold_product_date", endDate);

    if (error) {
      console.error("Error fetching sales data:", error);
      throw error;
    }

    // Calculate revenue generated and units sold per product
    const revenueByProduct = salesData.reduce((acc, sale) => {
      const { product_id, sold_product_total_price, sold_product_quantity } =
        sale;

      if (!acc[product_id]) {
        acc[product_id] = { revenue_generated: 0, units_sold: 0 };
      }

      acc[product_id].revenue_generated +=
        parseFloat(sold_product_total_price) || 0;
      acc[product_id].units_sold += parseFloat(sold_product_quantity) || 0;

      return acc;
    }, {});

    return revenueByProduct;
  } catch (error) {
    console.error("Error in computeProductRevenue:", error.message);
    throw error;
  }
};

module.exports = COMPUTE_REVENUE_GENERATED;
