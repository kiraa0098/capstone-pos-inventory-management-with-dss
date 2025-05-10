document.addEventListener("DOMContentLoaded", function () {
  const buttons = document.querySelectorAll('button[id^="unarchive-"]');
  const modal = document.getElementById("unarchiveModal");
  const confirmButton = document.getElementById("confirmUnarchive");
  const cancelButton = document.getElementById("cancelUnarchive");
  let selectedProductId = null;

  // Add click event listeners to unarchive buttons
  buttons.forEach((button) => {
    button.addEventListener("click", function () {
      selectedProductId = this.id.replace("unarchive-", "");
      // Show the modal
      modal.style.display = "block";
    });
  });

  // Confirm unarchive
  confirmButton.addEventListener("click", function () {
    if (selectedProductId) {
      unarchiveProduct(selectedProductId);
      modal.style.display = "none";
    }
  });

  // Cancel unarchive
  cancelButton.addEventListener("click", function () {
    selectedProductId = null;
    modal.style.display = "none";
  });

  // Function to unarchive the product
  function unarchiveProduct(productId) {
    fetch("/admin/inventory/archived-products/unarchive-product", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: productId }),
    })
      .then((response) => response.json())
      .then((data) => {
        const alertMessage = data.success
          ? "Product unarchived successfully!"
          : "Failed to unarchive product. Please try again.";
        const alertType = data.success ? "success" : "error";

        // Store alert message in localStorage
        localStorage.setItem(
          "alertMessage",
          JSON.stringify({ message: alertMessage, type: alertType })
        );

        // Reload the page
        window.location.reload();
      })
      .catch((error) => {
        console.error("Error:", error);
        localStorage.setItem(
          "alertMessage",
          JSON.stringify({
            message: "An error occurred. Please try again.",
            type: "error",
          })
        );
        window.location.reload();
      });
  }

  // Function to show custom alerts
  function displayAlert(message, type) {
    const container = document.getElementById("customAlertContainer");

    // Create a new alert element
    const alertDiv = document.createElement("div");
    alertDiv.className = `custom-alert ${type} fade-in`;
    alertDiv.textContent = message;

    // Append the alert element to the container
    container.appendChild(alertDiv);

    // Fade out after 3 seconds
    setTimeout(() => {
      alertDiv.classList.remove("fade-in");
      alertDiv.classList.add("fade-out");

      // Remove the alert element from the DOM after the fade-out transition
      setTimeout(() => {
        container.removeChild(alertDiv);
      }, 500); // Match this duration with the CSS transition duration
    }, 3000); // Display duration of 3 seconds
  }

  // Display any stored alerts
  function showStoredAlerts() {
    const alertData = JSON.parse(localStorage.getItem("alertMessage"));
    if (alertData) {
      displayAlert(alertData.message, alertData.type);
      localStorage.removeItem("alertMessage");
    }
  }

  // Call this function to display alerts after page reload
  showStoredAlerts();
});
