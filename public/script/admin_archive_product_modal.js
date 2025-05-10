document.addEventListener("DOMContentLoaded", function () {
  const archiveButtons = document.querySelectorAll(".archive-button");
  const archiveModal = document.getElementById("archiveModal");
  const confirmArchiveButton = document.getElementById("confirmArchiveButton");
  const closeModalButton = document.querySelector("#archiveModal .close");

  let currentProductId = null;

  // Function to open the archive modal
  function openArchiveModal(productId) {
    currentProductId = productId;
    archiveModal.style.display = "block";
  }

  // Attach click event listeners to each archive button
  archiveButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const productId = this.getAttribute("data-product-id");
      openArchiveModal(productId);
    });
  });

  // Close the modal when the close button or outside modal area is clicked
  closeModalButton.addEventListener("click", function () {
    archiveModal.style.display = "none";
  });

  window.addEventListener("click", function (event) {
    if (event.target === archiveModal) {
      archiveModal.style.display = "none";
    }
  });

  // Handle confirm archive button click
  confirmArchiveButton.addEventListener("click", async function () {
    try {
      const response = await fetch("/admin/inventory/archive-product", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId: currentProductId }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok.");
      }

      // Store success message in localStorage
      localStorage.setItem(
        "archiveSuccessMessage",
        "Product archived successfully"
      );

      // Reload the page after a short delay
      setTimeout(() => {
        location.reload(); // Reload the page after successful archive
      }, 1000); // Adjust delay as needed
    } catch (error) {
      console.error("Error:", error.message);
      // Handle error scenarios here
    }
  });

  // Check if there is a success message in localStorage and display it
  const archiveSuccessMessage = localStorage.getItem("archiveSuccessMessage");
  if (archiveSuccessMessage) {
    displaySuccessAlert(archiveSuccessMessage);
    localStorage.removeItem("archiveSuccessMessage"); // Clear stored message
  }

  // Function to display custom alert
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
});
