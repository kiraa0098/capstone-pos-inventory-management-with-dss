document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("addProductModal");
  const closeModalButtons = modal.querySelectorAll(".closeModalButton, .close");
  const addProductButton = document.getElementById("addProductButton");
  const openAddProductModalButton = document.getElementById(
    "openAddProductModalButton"
  );

  // Open modal on button click
  openAddProductModalButton.addEventListener("click", () => {
    modal.style.display = "block";
  });

  // Close modal and reset fields
  function closeModal() {
    clearPrompts();
    addProductButton.disabled = false;
    modal.style.display = "none"; // Close modal directly here
  }

  // Close modal for all close buttons
  closeModalButtons.forEach((button) => {
    button.addEventListener("click", () => {
      closeModal();
    });
  });

  // Handle adding a product on button click
  addProductButton.addEventListener("click", async (event) => {
    event.preventDefault();
    addProductButton.disabled = true;
    clearPrompts();

    // Collect input data
    const inputs = [
      "productName",
      "productBrand",
      "productStock",
      "productPrice",
      "productCost",
    ];
    const data = inputs.reduce((acc, input) => {
      acc[input] = document.getElementById(`${input}Input`).value.trim();
      return acc;
    }, {});

    const selectedBranches = getSelectedBranches();
    const selectedCategory = getSelectedCategory(); // Capture selected category
    const selectedSupplier = getSelectedSupplier(); // Capture selected supplier

    // Validate inputs
    const validationErrors = validateInputs(
      data,
      selectedBranches,
      selectedCategory,
      selectedSupplier // Validate supplier
    );

    if (validationErrors.length > 0) {
      validationErrors.forEach((error) =>
        displayPrompt(error.id, error.message)
      );
      addProductButton.disabled = false;
      return;
    }

    // Prepare data for submission
    data.productStock = parseInt(data.productStock);
    data.productPrice = parseFloat(data.productPrice);
    data.productCost = parseFloat(data.productCost);
    data.selectedBranchIds = selectedBranches.map((branch) => branch.id);
    data.selectedBranchNames = selectedBranches.map((branch) => branch.name);
    data.productCategoryId = selectedCategory.id; // Directly set to selectedCategory
    data.productCategoryName = selectedCategory.name; // Directly set to selectedCategory
    data.supplierId = selectedSupplier.id; // Add supplier ID
    data.supplierName = selectedSupplier.name; // Add supplier name

    try {
      const response = await fetch("/admin/inventory/add-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to add product");

      const result = await response.json();

      const alerts = [];
      result.successfulBranches.forEach((branchName) =>
        alerts.push({
          message: `Product successfully added to branch ${branchName}`,
          type: "success",
        })
      );
      result.failedBranches.forEach((branchName) =>
        alerts.push({
          message: `Failed to add product to branch ${branchName}. It already exists.`,
          type: "error",
        })
      );
      localStorage.setItem("alerts", JSON.stringify(alerts));

      closeModal();
      window.location.reload();
    } catch (error) {
      console.error("Error adding product:", error.message);
      displayAlert(`Error adding product: ${error.message}`, "error");
      addProductButton.disabled = false;
    }
  });

  // Validate inputs before submission
  function validateInputs(data, selectedBranches, selectedCategory) {
    const errors = [];

    if (!data.productName)
      errors.push({
        id: "productNamePrompt",
        message: "Product Name is required.",
      });
    if (!data.productBrand)
      errors.push({
        id: "productBrandPrompt",
        message: "Product Brand is required.",
      });
    if (
      !data.productStock ||
      isNaN(data.productStock) ||
      parseInt(data.productStock) <= 0
    ) {
      errors.push({
        id: "productStockPrompt",
        message: "Please enter a valid Product Stock.",
      });
    }
    if (
      !data.productPrice ||
      isNaN(data.productPrice) ||
      parseFloat(data.productPrice) <= 0
    ) {
      errors.push({
        id: "productPricePrompt",
        message: "Please enter a valid Product Price.",
      });
    }
    if (
      !data.productCost ||
      isNaN(data.productCost) ||
      parseFloat(data.productCost) <= 0
    ) {
      errors.push({
        id: "productCostPrompt",
        message: "Please enter a valid Product Cost.",
      });
    }
    if (selectedBranches.length === 0) {
      errors.push({
        id: "branchesPrompt",
        message: "Select at least one branch to add the product.",
      });
    }
    if (!selectedCategory) {
      errors.push({
        id: "categoryPrompt",
        message: "Select a category to add the product.",
      });
    }

    return errors;
  }

  // Get selected branches
  function getSelectedBranches() {
    return Array.from(
      document.querySelectorAll('input[name="branches"]:checked')
    ).map((checkbox) => ({
      id: checkbox.value,
      name: document
        .querySelector(`label[for=branch_${checkbox.value}]`)
        .textContent.trim(),
    }));
  }

  // Get selected category
  function getSelectedCategory() {
    const categorySelect = document.getElementById("addCategorySelect");
    const selectedOption = categorySelect.options[categorySelect.selectedIndex];

    if (selectedOption) {
      return {
        id: selectedOption.value,
        name: selectedOption.textContent.trim(),
      };
    }

    return null; // No category selected
  }

  function getSelectedSupplier() {
    const supplierSelect = document.getElementById("addSupplierSelect");
    const selectedOption = supplierSelect.options[supplierSelect.selectedIndex];

    if (selectedOption) {
      return {
        id: selectedOption.value,
        name: selectedOption.textContent.trim(),
      };
    }

    return null; // No supplier selected
  }

  // Clear all prompts
  function clearPrompts() {
    document
      .querySelectorAll(".prompt")
      .forEach((prompt) => (prompt.textContent = ""));
  }

  // Display validation prompts
  function displayPrompt(promptId, message) {
    const prompt = document.getElementById(promptId);
    if (prompt) prompt.textContent = message;
    else console.error(`Prompt element not found: ${promptId}`);
  }

  // Display custom alerts
  function displayAlert(message, type = "success") {
    const alertContainer = document.getElementById("customAlertContainer");
    const alert = document.createElement("div");
    alert.className = `custom-alert ${type}`;
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

  // Show any alerts stored in localStorage
  function showStoredAlerts() {
    const alerts = JSON.parse(localStorage.getItem("alerts")) || [];
    alerts.forEach((alert) => displayAlert(alert.message, alert.type));
    localStorage.removeItem("alerts");
  }

  showStoredAlerts(); // Call to show any alerts
});
