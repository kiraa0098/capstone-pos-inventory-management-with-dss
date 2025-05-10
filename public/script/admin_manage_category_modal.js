document.addEventListener("DOMContentLoaded", () => {
  const categoryModal = document.getElementById("categoryModal");
  const closeCategoryModal = document.getElementById("closeCategoryModal");
  const manageCategoriesButton = document.getElementById(
    "manageCategoriesButton"
  );
  const categoryInput = document.getElementById("categoryInput");
  const categoryList = document.getElementById("categoryList");

  let selectedCategoryId = null; // To keep track of the selected category

  // Open the modal when the button is clicked
  manageCategoriesButton.addEventListener("click", () => {
    categoryModal.style.display = "block";
  });

  // Close the modal
  closeCategoryModal.addEventListener("click", () => {
    categoryModal.style.display = "none";
    resetModal();
  });

  // Save (add/edit) category
  document
    .getElementById("saveCategoryBtn")
    .addEventListener("click", async () => {
      const categoryName = categoryInput.value.trim();
      if (categoryName) {
        await submitCategoryData({ product_category: categoryName });
      } else {
        displayErrorMessage(
          "err-category-name",
          "Category name cannot be empty."
        );
      }
    });

  // Delete category
  document.getElementById("deleteCategoryBtn").addEventListener("click", () => {
    if (selectedCategoryId) {
      fetch(`/admin/inventory/delete-category/${selectedCategoryId}`, {
        method: "DELETE",
      })
        .then((response) => response.json())
        .then((result) => {
          if (result.success) {
            location.reload(); // Reload the page to update the EJS-rendered categories
          } else {
            displayErrorMessage(
              "err-category-name",
              result.error || "Failed to delete category."
            );
          }
        });
    } else {
      displayErrorMessage(
        "err-category-name",
        "No category selected for deletion."
      );
    }
  });

  // When a category is clicked, populate the input field
  categoryList.addEventListener("click", (event) => {
    if (event.target.tagName === "LI") {
      selectedCategoryId = event.target.dataset.categoryId;
      const categoryName = event.target.textContent.trim();
      categoryInput.value = categoryName;
      clearErrorMessage();
    }
  });

  // Function to submit category data
  async function submitCategoryData(categoryData) {
    const url = selectedCategoryId
      ? `/admin/inventory/edit-category/${selectedCategoryId}` // Edit URL
      : "/admin/inventory/save-category"; // Add URL

    const method = selectedCategoryId ? "PUT" : "POST"; // PUT for edit, POST for add

    const response = await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(categoryData),
    });

    // Handle the response from the server
    if (response.ok) {
      const data = await response.json();
      console.log("Success:", data);
      location.reload(); // Reload the page to update categories
    } else {
      const errorData = await response.json();
      if (errorData.error === "Category name already exists.") {
        displayErrorMessage("err-category-name", errorData.error);
      } else if (
        response.status === 400 &&
        errorData.error === "Category name is required."
      ) {
        displayErrorMessage("err-category-name", "Category name is required.");
      } else {
        displayErrorMessage("err-category-name", "Failed to save category.");
      }
    }
  }

  function displayErrorMessage(elementId, message) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
    errorElement.style.display = "block";
  }

  function clearErrorMessage() {
    const errorElement = document.getElementById("err-category-name");
    errorElement.textContent = "";
    errorElement.style.display = "none";
  }

  function resetModal() {
    selectedCategoryId = null;
    categoryInput.value = "";
    clearErrorMessage();
  }
});
