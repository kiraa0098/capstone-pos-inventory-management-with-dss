document.addEventListener("DOMContentLoaded", function () {
  const customAlertContainer = document.getElementById("customAlertContainer");
  const refundReasonContainer = document.getElementById(
    "refund-reason-container"
  );
  const refundReasonInput = document.getElementById("refund-reason");
  const cancelRefundButton = document.getElementById("cancel-refund");
  const confirmRefundButton = document.getElementById("confirm-refund");
  const errRefundReason = document.getElementById("err-refund-reason");

  // Toggle modal visibility
  function toggleModal(modal, display) {
    if (display) {
      modal.style.display = "block";
      setTimeout(() => modal.classList.add("show"), 10);
    } else {
      modal.classList.remove("show");
      refundReasonContainer.style.display = "none"; // Hide the reason input
      refundReasonInput.value = ""; // Clear the input field
      setTimeout(() => (modal.style.display = "none"), 300);
    }
  }

  // Show custom alert message
  function showCustomAlertMessage(message, type = "success") {
    customAlertContainer.innerHTML = `<div class="custom-alert">${message}</div>`;
    customAlertContainer.classList.toggle("error", type === "error");
    customAlertContainer.style.display = "block";
    customAlertContainer.style.opacity = 1;
    setTimeout(() => {
      customAlertContainer.style.opacity = 0;
      setTimeout(() => (customAlertContainer.style.display = "none"), 500);
    }, 3000);
  }

  // Modal and close button logic for the logs modal
  const logsModal = document.getElementById("logs-modal");
  const logsButton = document.getElementById("transanction-logs");
  const logsCloseButton = logsModal.querySelector(".close-button");

  if (logsButton) {
    logsButton.onclick = () => toggleModal(logsModal, true);
  }
  if (logsCloseButton) {
    logsCloseButton.onclick = () => toggleModal(logsModal, false);
  }

  window.addEventListener("click", (event) => {
    if (event.target === logsModal) {
      toggleModal(logsModal, false);
    }
  });

  // Event listener for "view-products-button"
  document.addEventListener("click", async function (event) {
    if (event.target.matches(".view-products-button")) {
      const saleId = event.target.getAttribute("data-sale-id");

      try {
        // Fetch sold products by sale ID
        const soldProducts = await fetchSoldProducts(saleId);

        // Fetch sale details by sale ID
        const saleDetails = await fetchSaleDetails(saleId);

        console.log(saleDetails);
        if (soldProducts && saleDetails) {
          // Populate the sold products modal
          populateSoldProductsModal(soldProducts);

          const printButton = document.getElementById(
            "print-sale-record-button"
          );
          const refundButton = document.getElementById("refund-sale-button");

          if (printButton) {
            printButton.onclick = () =>
              printSaleRecord(saleDetails, soldProducts);
          }

          if (refundButton) {
            refundButton.onclick = () => {
              // Show the refund reason input when refund button is clicked
              refundReasonContainer.style.display = "block";
            };
          }

          if (confirmRefundButton) {
            confirmRefundButton.onclick = () => {
              // Get the refund reason when the user clicks "Confirm Refund"
              const reason = refundReasonInput.value.trim(); // Get the refund reason

              // Validate the refund reason
              if (!reason) {
                errRefundReason.innerHTML = "Refund reason is required."; // Show error in div
                errRefundReason.style.display = "block"; // Ensure it's visible
                return; // Prevent submission if no reason is provided
              }

              // Clear error if the reason is provided
              errRefundReason.innerHTML = "";
              errRefundReason.style.display = "none";

              saleDetails.soldProducts = soldProducts; // Attach sold products data
              saleDetails.refundReason = reason; // Attach refund reason to sale details

              // Call refundSale with the updated sale details
              refundSale(saleDetails, soldProducts);

              // Hide the reason input after submitting
              refundReasonContainer.style.display = "none";
              refundReasonInput.value = ""; // Clear the input field
            };
          }

          toggleModal(document.getElementById("sold-products-modal"), true);
        }
      } catch (error) {
        console.error("Error fetching sale data:", error);
        showCustomAlertMessage("Failed to fetch sale data.", "error");
      }
    }
  });

  document.addEventListener("click", async function (event) {
    if (event.target.matches(".view-refund-product")) {
      const refundId = event.target.getAttribute("data-refund-id");

      try {
        // Fetch sold products by sale ID
        const refundProducts = await fetchRefundProducts(refundId);

        console.log(refundProducts);

        if (refundProducts) {
          // Populate the refund products modal
          populateRefundProductsModal(refundProducts);

          //   const printButton = document.getElementById(
          //     "print-sale-record-button"
          //   );
          //   const refundButton = document.getElementById("refund-sale-button");

          //   if (printButton) {
          //     printButton.onclick = () =>
          //       printSaleRecord(saleDetails, soldProducts);
          //   }

          //   if (refundButton) {
          //     refundButton.onclick = () => {
          //       // Show the refund reason input when refund button is clicked
          //       refundReasonContainer.style.display = "block";
          //     };
          //   }

          //   if (confirmRefundButton) {
          //     confirmRefundButton.onclick = () => {
          //       // Get the refund reason when the user clicks "Confirm Refund"
          //       const reason = refundReasonInput.value.trim(); // Get the refund reason

          //       // Validate the refund reason
          //       if (!reason) {
          //         errRefundReason.innerHTML = "Refund reason is required."; // Show error in div
          //         errRefundReason.style.display = "block"; // Ensure it's visible
          //         return; // Prevent submission if no reason is provided
          //       }

          //       // Clear error if the reason is provided
          //       errRefundReason.innerHTML = "";
          //       errRefundReason.style.display = "none";

          //       saleDetails.soldProducts = soldProducts; // Attach sold products data
          //       saleDetails.refundReason = reason; // Attach refund reason to sale details

          //       // Call refundSale with the updated sale details
          //       refundSale(saleDetails, soldProducts);

          //       // Hide the reason input after submitting
          //       refundReasonContainer.style.display = "none";
          //       refundReasonInput.value = ""; // Clear the input field
          //     };
          //   }

          toggleModal(document.getElementById("refund-products-modal"), true);
        }
      } catch (error) {
        console.error("Error fetching sale data:", error);
        showCustomAlertMessage("Failed to fetch sale data.", "error");
      }
    }
  });

  async function fetchRefundProducts(refundId) {
    try {
      const response = await fetch(`/fetch-refund-products/${refundId}`);
      if (!response.ok) throw new Error("Failed to fetch refund products.");
      return await response.json();
    } catch (error) {
      console.error("Error fetching refund products:", error);
      showCustomAlertMessage("Failed to fetch refund products.", "error");
    }
  }

  function populateRefundProductsModal(refundProducts) {
    const refundProductsTableBody = document.querySelector(
      "#refund-products-list"
    );
    refundProductsTableBody.innerHTML = "";

    if (refundProducts && refundProducts.length > 0) {
      refundProducts.forEach((product) => {
        const row = document.createElement("tr");
        row.innerHTML = ` 
          <td>${product.refunded_product_name}</td>
          <td>${product.refunded_product_brand}</td>
          <td>${product.refunded_product_quantity}</td>
          <td>${parseFloat(product.refunded_product_total_price).toFixed(
            2
          )}</td>
        `;
        refundProductsTableBody.appendChild(row);
      });
    } else {
      const row = document.createElement("tr");
      row.innerHTML = `<td colspan="4">No products found.</td>`;
      soldProductsTableBody.appendChild(row);
    }
  }

  // Function to fetch sold products from the server
  async function fetchSoldProducts(saleId) {
    try {
      const response = await fetch(`/fetch-sold-products/${saleId}`);
      if (!response.ok) throw new Error("Failed to fetch sold products.");
      return await response.json();
    } catch (error) {
      console.error("Error fetching sold products:", error);
      showCustomAlertMessage("Failed to fetch sold products.", "error");
    }
  }

  // Function to fetch sale details from the server
  async function fetchSaleDetails(saleId) {
    try {
      const response = await fetch(`/fetch-sale-details/${saleId}`);
      if (!response.ok) throw new Error("Failed to fetch sale details.");
      return await response.json();
    } catch (error) {
      console.error("Error fetching sale details:", error);
      showCustomAlertMessage("Failed to fetch sale details.", "error");
    }
  }

  // Populate the sold products modal with the fetched data
  function populateSoldProductsModal(soldProducts) {
    const soldProductsTableBody = document.querySelector("#sold-products-list");
    soldProductsTableBody.innerHTML = "";

    if (soldProducts && soldProducts.length > 0) {
      soldProducts.forEach((product) => {
        const row = document.createElement("tr");
        row.innerHTML = ` 
          <td>${product.sold_product_name}</td>
          <td>${product.sold_product_brand}</td>
          <td>${product.sold_product_quantity}</td>
          <td>${parseFloat(product.sold_product_total_price).toFixed(2)}</td>
        `;
        soldProductsTableBody.appendChild(row);
      });
    } else {
      const row = document.createElement("tr");
      row.innerHTML = `<td colspan="4">No products found.</td>`;
      soldProductsTableBody.appendChild(row);
    }
  }

  // Function to print the sale record
  async function printSaleRecord(saleDetails, soldProducts) {
    try {
      saleDetails.soldProducts = soldProducts;
      const responsePrint = await fetch("/order/print-sale-record", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(saleDetails),
      });

      const result = await responsePrint.json();

      if (result.success) {
        showCustomAlertMessage(result.message);
      } else if (
        result.message &&
        result.message.includes("Can not find printer")
      ) {
        showCustomAlertMessage("Printer not available", "error");
      } else {
        showCustomAlertMessage(result.message, "error");
      }
    } catch (error) {
      console.error("Error printing sale record:", error);
      showCustomAlertMessage("Failed to print receipt.", "error");
    }
  }

  // Handle refund process
  async function refundSale(saleDetails, soldProducts) {
    try {
      // Merge saleDetails and soldProducts into one object before sending to the backend
      const refundData = {
        ...saleDetails, // Include sale details like sale_id, payment_amount, etc.
        soldProducts, // Include the array of sold products
      };

      // Send the merged data to the backend
      const response = await fetch("/order/refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(refundData), // Send the combined object
      });

      const result = await response.json();

      if (result.success) {
        // Store a flag in local storage to show the custom alert after page reload
        localStorage.setItem("refundSuccess", "true");

        // Reload the page
        location.reload();
      } else {
        showCustomAlertMessage(result.message, "error");
      }
    } catch (error) {
      console.error("Error processing refund:", error);
      showCustomAlertMessage("Failed to process refund.", "error");
    }
  }

  // Cancel button logic for refund
  cancelRefundButton.onclick = () => {
    refundReasonContainer.style.display = "none"; // Hide the reason input
    refundReasonInput.value = ""; // Clear the input field
  };

  // Close button logic for sold products modal
  const soldProductsModal = document.getElementById("sold-products-modal");
  const soldProductsCloseButton =
    soldProductsModal.querySelector(".close-button");

  // Close button logic for sold products modal
  const refundProductsModal = document.getElementById("refund-products-modal");
  const refundProductsCloseButton =
    refundProductsModal.querySelector(".close-button");

  if (soldProductsCloseButton) {
    soldProductsCloseButton.addEventListener("click", () =>
      toggleModal(soldProductsModal, false)
    );
  }

  if (refundProductsCloseButton) {
    refundProductsCloseButton.addEventListener("click", () =>
      toggleModal(refundProductsModal, false)
    );
  }

  window.addEventListener("click", (event) => {
    if (event.target === soldProductsModal) {
      toggleModal(soldProductsModal, false);
    }
  });

  // After page reload, check local storage for refund success
  const refundSuccess = localStorage.getItem("refundSuccess");

  if (refundSuccess) {
    // Show the success alert
    showCustomAlertMessage("Refund processed successfully!");

    // Remove the flag from local storage
    localStorage.removeItem("refundSuccess");
  }
});
