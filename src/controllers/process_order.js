const { Console } = require("console");
const supabase = require("../services/database");

async function PROCESS_ORDER(
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
) {
  try {
    // Calculate total quantity
    const totalQuantity = selectedProducts.reduce(
      (sum, product) => sum + product.quantity,
      0
    );

    console.log(selectedProducts);

    // Fetch product costs and stock from the database
    const productIds = selectedProducts.map((product) => product.productId);

    const { data: productsData, error: productError } = await supabase
      .from("product")
      .select("product_id, product_cost, product_stock")
      .in("product_id", productIds);

    if (productError) {
      throw new Error(`Error fetching product costs: ${productError.message}`);
    }

    // Map product costs and stock by productId for easy access
    const productMap = productsData.reduce((map, product) => {
      map[product.product_id] = {
        cost: product.product_cost,
        stock: product.product_stock,
      };
      return map;
    }, {});

    // Calculate total cost of the sale
    let totalCostOfSale = 0;

    const updates = selectedProducts.map((product) => {
      const productDetails = productMap[product.productId]; // Get the cost and stock of the product
      const productCost = productDetails.cost; // Get the cost of the product
      const productQuantity = product.quantity; // Get the quantity from the selected product

      // Calculate total cost of the product
      const productCostTotal = productCost * productQuantity;
      totalCostOfSale += productCostTotal; // Add to the total cost of the sale

      // Check for sufficient stock before preparing update
      if (productDetails.stock < productQuantity) {
        throw new Error(`Insufficient stock`);
      }

      return {
        product_id: product.productId,
        product_stock: productDetails.stock - productQuantity, // Update stock based on fetched stock
      };
    });

    // Update stock in the product table
    const { data: stockData, error: stockError } = await supabase
      .from("product")
      .upsert(updates, { onConflict: ["product_id"] });

    if (stockError) {
      if (stockError.message.includes("fetch")) {
        throw new Error("Network error while updating stock.");
      }
      throw new Error(`Error updating stock: ${stockError.message}`);
    }

    // Insert a new record into the sales table
    const { data: salesData, error: salesError } = await supabase
      .from("sales")
      .insert([
        {
          sales_quantity_of_products_sold: totalQuantity,
          sales_total_price: totalPrice.toFixed(2),
          sales_total_cost: totalCostOfSale.toFixed(2), // Insert the total cost of the sale
          payment_amount: paymentAmount.toFixed(2),
          customer_name: customerName,
          payment_mode: paymentMethod,
          bank: bank,
          transaction_number: referenceNumber,
          branch_name: branchName,
          sale_branch_id: branchId,
          discount: discountAmount.toFixed(2),
        },
      ])
      .select(); // Use .select() to fetch the inserted row

    if (salesError) {
      if (salesError.message.includes("fetch")) {
        throw new Error("Network error while inserting sales data.");
      }
      throw new Error(`Error inserting sales data: ${salesError.message}`);
    }

    if (salesData.length === 0) {
      throw new Error("Sales data is empty after insertion.");
    }

    const salesId = salesData[0].sales_id; // Adjust if your ID field name is different

    // Insert records into the sold_products table with total cost for each product
    const soldProductsRecords = selectedProducts.map((product) => {
      const productDetails = productMap[product.productId]; // Fetch the cost and stock details of the product
      const totalCostForProduct = productDetails.cost * product.quantity; // Calculate total cost for the product

      return {
        product_id: product.productId,
        sold_product_name: product.productName,
        sold_product_brand: product.productBrand,
        sold_product_price: product.productPrice.toFixed(2),
        sold_product_quantity: product.quantity,
        sold_product_total_price: (
          product.productPrice * product.quantity
        ).toFixed(2),
        sold_product_cost: totalCostForProduct.toFixed(2), // Store the total cost of the product
        sold_product_sale_id: salesId,
        sold_product_category: product.productCategory,
        sold_product_category_id: product.productCategoryId, // Associate each sold product with the sales ID
      };
    });

    const { error: soldProductsError } = await supabase
      .from("sold_products")
      .insert(soldProductsRecords);

    if (soldProductsError) {
      if (soldProductsError.message.includes("fetch")) {
        throw new Error("Network error while inserting sold products.");
      }
      throw new Error(
        `Error inserting sold products: ${soldProductsError.message}`
      );
    }

    return { success: true, data: { stockData, salesData } };
  } catch (error) {
    console.error("Error processing order:", error.message);
    throw new Error(`Error processing order: ${error.message}`);
  }
}

module.exports = { PROCESS_ORDER };
