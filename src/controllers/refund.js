const supabase = require("../services/database");

async function processRefund(refundDetails) {
  const {
    soldProducts,
    paymentAmount,
    customerName,
    paymentMethod,
    bank,
    referenceNumber,
    totalPrice,
    refundReason,
    branchId,
    branchName,
    saleId, // This is the original saleId, which will be used as refundId
    discount, // Discount passed from frontend
    sales_total_cost, // Total cost passed from frontend
    sales_date, // Sales date passed from frontend
  } = refundDetails;

  // We will use the saleId as the refundId
  const refundId = saleId;

  try {
    // 1. Insert into the refund table
    const { data: refundData, error: refundError } = await supabase
      .from("refund")
      .insert([
        {
          refund_id: refundId, // Use the original saleId as refundId
          refund_reason: refundReason,
          payment_amount: paymentAmount,
          payment_mode: paymentMethod,
          customer_name: customerName || "N/A",
          bank: bank || "N/A",
          transaction_number: referenceNumber || "N/A",
          refund_total_price: totalPrice,
          refund_quantity_of_products_sold: soldProducts.length,
          branch_name: branchName,
          sale_branch_id: branchId,
          discount: discount || 0, // Use the discount passed from frontend
          sales_total_cost: sales_total_cost || 0, // Use the total cost passed from frontend
          sales_date: sales_date || new Date().toISOString(), // Use the sales date passed from frontend
        },
      ]);

    if (refundError) {
      throw new Error(`Refund table insertion error: ${refundError.message}`);
    }

    // 2. Insert each refunded product into refunded_products table
    for (const product of soldProducts) {
      const {
        productId,
        productName,
        productPrice,
        quantity,
        totalPrice: productTotalPrice, // Rename totalPrice to avoid conflict
        cost,
        category,
        categoryId,
        brand,
      } = product;

      const { error: refundedProductError } = await supabase
        .from("refunded_products")
        .insert([
          {
            product_id: productId, // Product ID for the refunded product
            refunded_product_name: productName,
            refunded_product_brand: brand || "N/A", // Assuming product has a 'brand' field
            refunded_product_price: productPrice,
            refunded_product_quantity: quantity,
            refunded_product_total_price: productTotalPrice,
            refunded_product_refund_id: refundId, // Link to the refund using saleId
            refunded_product_cost: cost,
            refunded_product_category: category,
            refunded_product_category_id: categoryId,
          },
        ]);

      if (refundedProductError) {
        throw new Error(
          `Refunded product table insertion error: ${refundedProductError.message}`
        );
      }

      // 3. Find the product by its ID and update stock
      const { data: productData, error: productFindError } = await supabase
        .from("product")
        .select("product_stock")
        .eq("product_id", productId)
        .single(); // Get a single product based on product_id

      if (productFindError) {
        throw new Error(
          `Product not found for stock update: ${productFindError.message}`
        );
      }

      // Update the stock by adding the sold quantity
      const newStock = productData.product_stock + quantity;

      const { error: stockUpdateError } = await supabase
        .from("product")
        .update({
          product_stock: newStock,
        })
        .match({ product_id: productId });

      if (stockUpdateError) {
        throw new Error(
          `Product stock update error: ${stockUpdateError.message}`
        );
      }
    }

    // 4. Delete the original sale and sold products
    const { error: saleDeleteError } = await supabase
      .from("sales")
      .delete()
      .match({ sales_id: saleId });

    if (saleDeleteError)
      throw new Error(`Sales deletion error: ${saleDeleteError.message}`);

    const { error: soldProductsDeleteError } = await supabase
      .from("sold_products")
      .delete()
      .match({ sold_product_sale_id: saleId });

    if (soldProductsDeleteError) {
      throw new Error(
        `Sold products deletion error: ${soldProductsDeleteError.message}`
      );
    }

    // Return success message
    return {
      success: true,
      message: "Refund processed successfully!",
    };
  } catch (error) {
    console.error("Error processing refund:", error);
    return {
      success: false,
      message: error.message,
    };
  }
}

module.exports = processRefund;
