document.addEventListener("DOMContentLoaded", function () {
  const editButtons = document.querySelectorAll(".edit-button");

  editButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const tr = this.closest("tr");
      populateEditModal(tr);
      document.getElementById("editModal").style.display = "block";
      resetFormState();
    });
  });

  const editModal = document.getElementById("editModal");
  const closeEditModalButtons = editModal.querySelectorAll(
    ".closeModalButton, .close"
  );

  closeEditModalButtons.forEach((button) => {
    button.addEventListener("click", function () {
      editModal.style.display = "none";
      clearProductNameError();
      resetFormState();
    });
  });

  window.addEventListener("click", function (event) {
    if (event.target === editModal) {
      editModal.style.display = "none";
      clearProductNameError();
      resetFormState();
    }
  });

  const saveChangesButton = document.getElementById("saveChangesButton");
  saveChangesButton.addEventListener("click", async () => {
    const productId = document.getElementById("editProductId").value;
    const productName = document.getElementById("editProductName").value;
    const productBrand = document.getElementById("editProductBrand").value;
    const productCost = document.getElementById("editProductCost").value.trim();
    const productPrice = document
      .getElementById("editProductPrice")
      .value.trim();
    const categorySelect = document.getElementById("categorySelect");
    const productCategoryId = categorySelect.value;
    const productCategoryName =
      categorySelect.options[categorySelect.selectedIndex].dataset.name; // Get category name

    const errors = validateFields(
      productName,
      productBrand,
      productCost,
      productPrice
    );

    if (errors) {
      displayErrors(errors);
      return;
    }

    const formattedCost = parseFloat(productCost).toFixed(2);
    const formattedPrice = parseFloat(productPrice).toFixed(2);

    const payload = {
      product_id: productId,
      product_name: productName,
      product_brand: productBrand,
      product_cost: parseFloat(formattedCost),
      product_price: parseFloat(formattedPrice),
      product_category_id: productCategoryId, // Added category ID
      product_category_name: productCategoryName, // Added category name
    };

    try {
      const response = await fetch("/admin/inventory/edit-product", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        localStorage.setItem(
          "editSuccessMessage",
          "Product successfully edited"
        );
        setTimeout(() => {
          location.reload();
        }, 1000);
      } else {
        const data = await response.json();
        if (data.error === "Product name already exists") {
          document.addEventListener("DOMContentLoaded", () => {
            const editModal = document.getElementById("editModal");
            const closeModalButtons =
              document.querySelectorAll(".closeModalButton");
            const saveChangesButton =
              document.getElementById("saveChangesButton");

            const openEditModal = (productId) => {
              const row = document.querySelector(
                `tr[data-product-id="${productId}"]`
              );
              const productName = row.querySelector(
                ".product-name .marquee"
              ).innerText;
              const productBrand = row.cells[1].innerText;
              const productCost = parseFloat(row.cells[4].innerText);
              const productPrice = parseFloat(row.cells[5].innerText);
              const categoryId = row.dataset.productCategoryId;

              // Populate the modal fields
              document.getElementById("editProductId").value = productId;
              document.getElementById("editProductName").value = productName;
              document.getElementById("editProductBrand").value = productBrand;
              document.getElementById("editProductCost").value = productCost;
              document.getElementById("editProductPrice").value = productPrice;

              // Select the correct category
              const categorySelect = document.getElementById("categorySelect");
              categorySelect.value = categoryId;

              // Show the modal
              editModal.style.display = "block";
            };

            // Handle closing the modal
            closeModalButtons.forEach((button) => {
              button.addEventListener("click", () => {
                editModal.style.display = "none";
                clearErrors();
              });
            });

            // Handle save changes button
            saveChangesButton.addEventListener("click", () => {
              const productId = document.getElementById("editProductId").value;
              const productName =
                document.getElementById("editProductName").value;
              const productBrand =
                document.getElementById("editProductBrand").value;
              const productCost = parseFloat(
                document.getElementById("editProductCost").value
              );
              const productPrice = parseFloat(
                document.getElementById("editProductPrice").value
              );
              const categoryId =
                document.getElementById("categorySelect").value;

              const errors = validateFields(
                productName,
                productBrand,
                productCost,
                productPrice
              );

              if (Object.keys(errors).length > 0) {
                displayErrors(errors);
              } else {
                // Send the updated product data to the server
                fetch(`/api/products/${productId}`, {
                  method: "PUT",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    product_name: productName,
                    product_brand: productBrand,
                    product_cost: productCost,
                    product_price: productPrice,
                    product_category_id: categoryId,
                  }),
                })
                  .then((response) => {
                    if (response.ok) {
                      alert("Product updated successfully!");
                      // Optionally refresh the page or update the table without reloading
                      location.reload();
                    } else {
                      alert("Error updating product");
                    }
                  })
                  .catch((err) => console.error(err));
              }
            });

            function validateFields(name, brand, cost, price) {
              const errors = {};
              if (!name) errors.name = "Product name is required.";
              if (!brand) errors.brand = "Brand is required.";
              if (isNaN(cost) || cost < 0)
                errors.cost = "Cost must be a valid number.";
              if (isNaN(price) || price < 0)
                errors.price = "Price must be a valid number.";
              return errors;
            }

            function displayErrors(errors) {
              document.getElementById("err-product-name").innerText =
                errors.name || "";
              document.getElementById("err-product-brand").innerText =
                errors.brand || "";
              document.getElementById("err-product-cost").innerText =
                errors.cost || "";
              document.getElementById("err-product-price").innerText =
                errors.price || "";
            }

            function clearErrors() {
              document.getElementById("err-product-name").innerText = "";
              document.getElementById("err-product-brand").innerText = "";
              document.getElementById("err-product-cost").innerText = "";
              document.getElementById("err-product-price").innerText = "";
            }

            // Add event listener for edit buttons
            document.querySelectorAll(".edit-button").forEach((button) => {
              button.addEventListener("click", () => {
                const productId = button.getAttribute("data-product-id");
                openEditModal(productId);
              });
            });
          });
          displayProductNameError("Product name already exists");
        } else {
          console.error("Failed to update product:", data.error);
        }
      }
    } catch (error) {
      console.error("Error:", error);
    }
  });

  const editSuccessMessage = localStorage.getItem("editSuccessMessage");
  if (editSuccessMessage) {
    displaySuccessAlert(editSuccessMessage);
    localStorage.removeItem("editSuccessMessage");
  }

  const initialFormState = {
    productName: "",
    productBrand: "",
    productCost: "",
    productPrice: "",
    category: "", // Track initial category
  };

  function resetFormState() {
    initialFormState.productName =
      document.getElementById("editProductName").value;
    initialFormState.productBrand =
      document.getElementById("editProductBrand").value;
    initialFormState.productCost = document
      .getElementById("editProductCost")
      .value.trim();
    initialFormState.productPrice = document
      .getElementById("editProductPrice")
      .value.trim();
    initialFormState.category = document.getElementById("categorySelect").value; // Store initial category value
    checkFormChanges();
  }

  function checkFormChanges() {
    const currentProductName = document.getElementById("editProductName").value;
    const currentProductBrand =
      document.getElementById("editProductBrand").value;
    const currentProductCost = document
      .getElementById("editProductCost")
      .value.trim();
    const currentProductPrice = document
      .getElementById("editProductPrice")
      .value.trim();
    const currentCategory = document.getElementById("categorySelect").value; // Get the current selected category

    const changesMade =
      currentProductName !== initialFormState.productName ||
      currentProductBrand !== initialFormState.productBrand ||
      currentProductCost !== initialFormState.productCost ||
      currentProductPrice !== initialFormState.productPrice ||
      currentCategory !== initialFormState.category; // Include category in change detection

    saveChangesButton.disabled = !changesMade; // Disable if no changes made
  }

  const editProductInputs = document.querySelectorAll(
    "#editProductName, #editProductBrand, #editProductCost, #editProductPrice, #categorySelect"
  );

  editProductInputs.forEach((input) => {
    input.addEventListener("input", checkFormChanges);
  });

  function displaySuccessAlert(message) {
    const alertContainer = document.getElementById("customAlertContainer");
    const alert = document.createElement("div");
    alert.className = "custom-alert success";
    alert.textContent = message;
    alertContainer.appendChild(alert);

    setTimeout(() => {
      alert.classList.add("fade-in");
      setTimeout(() => {
        alert.classList.remove("fade-in");
        alert.classList.add("fade-out");
        setTimeout(() => {
          alert.remove();
        }, 500);
      }, 3000);
    }, 10);
  }

  function populateEditModal(tr) {
    const editProductIdElem = document.getElementById("editProductId");
    const editProductNameElem = document.getElementById("editProductName");
    const editProductBrandElem = document.getElementById("editProductBrand");
    const editProductCostElem = document.getElementById("editProductCost");
    const editProductPriceElem = document.getElementById("editProductPrice");
    const categorySelectElem = document.getElementById("categorySelect");

    if (
      !editProductIdElem ||
      !editProductNameElem ||
      !editProductBrandElem ||
      !editProductCostElem ||
      !editProductPriceElem ||
      !categorySelectElem
    ) {
      console.error("One or more required elements not found.");
      return;
    }

    // Set values to the input fields
    editProductIdElem.value = tr.dataset.productId;
    editProductNameElem.value = tr
      .querySelector("td:nth-child(1)")
      .innerText.trim();
    editProductBrandElem.value = tr
      .querySelector("td:nth-child(2)")
      .innerText.trim();

    // Retrieve cost and price from table cells
    const costText = tr.querySelector("td:nth-child(6)").innerText.trim();
    const priceText = tr.querySelector("td:nth-child(7)").innerText.trim();

    const cleanedCostText = costText.replace(/[^0-9.]/g, "");
    const cleanedPriceText = priceText.replace(/[^0-9.]/g, "");
    const cost = parseFloat(cleanedCostText);
    const price = parseFloat(cleanedPriceText);

    editProductCostElem.value = isNaN(cost) ? "" : cost.toFixed(2);
    editProductPriceElem.value = isNaN(price) ? "" : price.toFixed(2);

    // Set the selected category
    const productCategoryId = tr.dataset.productCategoryId; // Use category ID from data attribute
    categorySelectElem.value = productCategoryId; // Set the correct option as selected

    console.log("Selected category ID:", productCategoryId);

    resetFormState(); // Initialize form state
  }

  function validateFields(name, brand, cost, price) {
    const errors = {};

    if (!name) {
      errors.name = "Product name is required";
    }
    if (!brand) {
      errors.brand = "Brand is required";
    }
    if (!cost || isNaN(cost) || parseFloat(cost) < 0) {
      errors.cost = "Enter valid inputs"; // Updated message
    }
    if (!price || isNaN(price) || parseFloat(price) < 0) {
      errors.price = "Enter valid inputs"; // Updated message
    }

    return Object.keys(errors).length === 0 ? null : errors;
  }

  function displayErrors(errors) {
    const errProductNameElem = document.getElementById("err-product-name");
    const errProductBrandElem = document.getElementById("err-product-brand");
    const errProductCostElem = document.getElementById("err-product-cost");
    const errProductPriceElem = document.getElementById("err-product-price");

    errProductNameElem.innerText = errors.name || "";
    errProductBrandElem.innerText = errors.brand || "";
    errProductCostElem.innerText = errors.cost || "";
    errProductPriceElem.innerText = errors.price || "";
  }

  function clearProductNameError() {
    const errProductNameElem = document.getElementById("err-product-name");
    errProductNameElem.innerText = "";
  }

  function displayProductNameError(message) {
    const errProductNameElem = document.getElementById("err-product-name");
    errProductNameElem.innerText = message;
  }
});
