document.addEventListener("DOMContentLoaded", function () {
  const restockButtons = document.querySelectorAll(".restock-button");
  const restockModal = document.getElementById("restockModal");
  const productNameLabel = document.getElementById("productNameLabel");
  const currentStockSpan = document.getElementById("currentStock");
  const restockInput = document.getElementById("restockInput");
  const restockSubmitButton = document.getElementById("restockSubmit");
  const voidStockButton = document.getElementById("voidStockButton");
  const errorContainer = document.getElementById("err-restock-product");
  const customAlertContainer = document.getElementById("customAlertContainer");

  // Function to open the restock modal
  function openRestockModal(productName, currentStock) {
    productNameLabel.textContent = `Product Name: ${productName}`;
    currentStockSpan.textContent = parseInt(currentStock, 10); // Convert current stock to an integer
    restockInput.value = ""; // Clear previous input
    errorContainer.textContent = ""; // Clear previous error messages
    restockModal.style.display = "block";
  }

  // Attach click event listeners to each restock button
  restockButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const productId = this.getAttribute("data-product-id");
      const productName = this.closest("tr")
        .querySelector("td:nth-child(1)")
        .innerText.trim(); // Adjust index as per your table structure
      const currentStock = this.closest("tr")
        .querySelector("td:nth-child(7)")
        .innerText.trim(); // Adjust index as per your table structure

      // Display the restock modal with the selected product details
      openRestockModal(productName, currentStock);
      // Set product ID as data attribute in the modal
      restockModal.setAttribute("data-product-id", productId);
    });
  });

  // Close the modal when the close button or outside modal area is clicked
  const closeButtons = document.querySelectorAll(".close, .modal");
  closeButtons.forEach((button) => {
    button.addEventListener("click", function (event) {
      if (event.target === button) {
        restockModal.style.display = "none";
      }
    });
  });

  // Function to show custom alert
  function showCustomAlert(message, type = "success") {
    customAlertContainer.textContent = message;
    customAlertContainer.className = "custom-alert"; // Reset classes
    customAlertContainer.classList.add(type); // Add specific type
    customAlertContainer.style.opacity = 1;

    setTimeout(() => {
      customAlertContainer.style.opacity = 0;
    }, 3000); // Adjust the duration as needed (3 seconds in this case)
  }

  // Check if there is a success or error message in localStorage
  const restockSuccessMessage = localStorage.getItem("restockSuccessMessage");
  if (restockSuccessMessage) {
    showCustomAlert(restockSuccessMessage, "success");
    localStorage.removeItem("restockSuccessMessage"); // Clear stored message
  }

  const restockErrorMessage = localStorage.getItem("restockErrorMessage");
  if (restockErrorMessage) {
    showCustomAlert(restockErrorMessage, "error");
    localStorage.removeItem("restockErrorMessage"); // Clear stored message
  }

  // Handle restock submit button click with validation
  restockSubmitButton.addEventListener("click", async function () {
    const restockValue = restockInput.value.trim();
    const productId = restockModal.getAttribute("data-product-id");

    // Validate restock value
    if (
      !restockValue ||
      isNaN(restockValue) ||
      !Number.isInteger(parseFloat(restockValue))
    ) {
      errorContainer.textContent = restockValue
        ? "Please enter a valid integer value."
        : "Input is required.";
      return;
    }

    try {
      const response = await fetch("/admin/inventory/restock-product", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: productId,
          restockAmount: restockValue,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to restock product.");
      }

      localStorage.setItem(
        "restockSuccessMessage",
        "Product restocked successfully!"
      );
      location.reload();
    } catch (error) {
      console.error("Error:", error.message);
      showCustomAlert(error.message, "error");
    }
  });

  // Handle void stock button click with validation
  voidStockButton.addEventListener("click", async function () {
    const voidValue = restockInput.value.trim();
    const productId = restockModal.getAttribute("data-product-id");

    // Validate void value
    if (
      !voidValue ||
      isNaN(voidValue) ||
      !Number.isInteger(parseFloat(voidValue))
    ) {
      errorContainer.textContent = voidValue
        ? "Please enter a valid integer value."
        : "Input is required.";
      return;
    }

    try {
      const response = await fetch("/admin/inventory/void-stock-product", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: productId,
          voidAmount: voidValue,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        localStorage.setItem(
          "restockErrorMessage",
          errorData.message || "Failed to void stock."
        );
      }

      if (response.ok) {
        location.reload();
        localStorage.setItem(
          "restockSuccessMessage",
          "Stock voided successfully!"
        );
      }

      location.reload();
    } catch (error) {
      console.error("Error:", error.message);
      showCustomAlert(error.message, "error");
    }
  });
});
