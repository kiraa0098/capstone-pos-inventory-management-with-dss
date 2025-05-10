const supabase = require("../services/database");

async function categoryExists(productCategory) {
  const normalizedCategory = productCategory.trim().toLowerCase(); // Normalize input

  const { data, error } = await supabase
    .from("product_category")
    .select("product_category")
    .ilike("product_category", normalizedCategory); // Use ilike for case-insensitive comparison

  if (error) {
    throw new Error(error.message);
  }

  return data.length > 0; // Returns true if the category exists
}

// Function to save a new category
async function saveCategory(productCategory) {
  const { data, error } = await supabase
    .from("product_category")
    .insert([{ product_category: productCategory }]);

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

// Implement the editCategory and deleteCategory functions as needed
async function editCategory(categoryId, productCategory) {
  const { data: updatedCategoryData, error: categoryError } = await supabase
    .from("product_category")
    .update({ product_category: productCategory })
    .eq("product_category_id", categoryId);

  if (categoryError) {
    throw new Error(categoryError.message);
  }

  // Now update the associated products with the new category name
  const { data: updatedProductsData, error: productError } = await supabase
    .from("product")
    .update({ product_category: productCategory })
    .eq("product_category_id", categoryId); // Assuming the products have a field for category name

  if (productError) {
    throw new Error(productError.message);
  }

  return {
    updatedCategory: updatedCategoryData,
    updatedProducts: updatedProductsData,
  };
}

async function deleteCategory(categoryId) {
  const { error } = await supabase
    .from("product_category")
    .delete()
    .eq("product_category_id", categoryId);

  if (error) {
    throw new Error(error.message);
  }
}

async function removeCategoryFromProducts(categoryId) {
  const { error } = await supabase
    .from("product")
    .update({
      product_category_id: null, // Set the category ID to null
      product_category: "Undefined", // Optionally set the category name to null as well
    })
    .eq("product_category_id", categoryId);

  if (error) {
    throw new Error(error.message);
  }
}

async function deleteCategory(categoryId) {
  const { error } = await supabase
    .from("product_category")
    .delete()
    .eq("product_category_id", categoryId);

  if (error) {
    throw new Error(error.message);
  }
}

module.exports = {
  saveCategory,
  editCategory,
  deleteCategory,
  removeCategoryFromProducts,
  categoryExists,
};
