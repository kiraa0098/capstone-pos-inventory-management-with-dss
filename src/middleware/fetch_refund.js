const supabase = require("../services/database");

async function fetchRefunds(branchId) {
  try {
    // Fetch refunds filtered by the branch_id
    const { data, error } = await supabase
      .from("refund")
      .select("*")
      .eq("sale_branch_id", branchId); // Filters by sale_branch_id

    if (error) {
      console.error("Error fetching refunds:", error);
      return null;
    }

    return data;
  } catch (err) {
    console.error("An unexpected error occurred:", err);
    return null;
  }
}

async function FETCH_REFUND_PRODUCTS_BY_SALE_ID(refundId) {
  const { data, error } = await supabase
    .from("refunded_products")
    .select("*")
    .eq("refunded_product_refund_id", refundId);

  if (error) {
    console.error("Error fetching sold products:", error);
    return null;
  }

  console.log(data);

  return data;
}

module.exports = { fetchRefunds, FETCH_REFUND_PRODUCTS_BY_SALE_ID };
