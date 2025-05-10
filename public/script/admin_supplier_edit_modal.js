document.addEventListener("DOMContentLoaded", function () {
  // Get modal elements
  const editModal = document.getElementById("editSupplierModal");
  const deleteModal = document.getElementById("deleteSupplierModal");
  const closeModal = document.querySelectorAll(".close");
  const editForm = document.getElementById("editSupplierForm");

  const editDetailsModal = document.getElementById("editDetailsModal");
  const editDetailsForm = document.getElementById("editDetailsForm");
  const editDetailsTextarea = document.getElementById("editDetails");
  let supplierIdToEditDetails = null;

  // Open Edit Details Modal when the button is clicked
  document.querySelectorAll("#details-button").forEach((button) => {
    button.addEventListener("click", async function () {
      supplierIdToEditDetails = this.getAttribute("data-supplier-id");

      try {
        // Fetch existing details to populate the form
        const response = await fetch(
          `/api/supplier-details/${supplierIdToEditDetails}`
        );
        const data = await response.json();

        console.log("Fetched data:", data);
        if (response.ok) {
          editDetailsTextarea.value = data.details;
          editDetailsModal.style.display = "block";
        } else {
          console.log("failed to edit");
        }
      } catch (error) {
        console.error("Error fetching details:", error);
      }
    });
  });

  // Handle the form submission for updating details
  editDetailsForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    const updatedDetails = editDetailsTextarea.value.trim();

    try {
      const response = await fetch(
        `/api/update-supplier-details/${supplierIdToEditDetails}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ details: updatedDetails }),
        }
      );

      const result = await response.json(); // Parse the JSON response from the server
      console.log("Server Response:", result); // Log the response for debugging

      if (response.ok && result.success) {
        // If update is successful, close the modal
        editDetailsModal.style.display = "none";
        console.log("Succes");
      } else {
        console.log(result);
      }
    } catch (error) {
      console.error("Error updating details:", error);
    }
  });

  // Variable to store the supplier ID to delete
  let supplierIdToDelete = null;

  // Show the edit modal and populate it with supplier data
  window.openEditModal = function (supplier) {
    document.getElementById("supplierId").value = supplier.supplier_id;
    document.getElementById("name").value = supplier.supplier_name;
    document.getElementById("contact").value = supplier.supplier_contact;
    document.getElementById("address").value = supplier.supplier_address;
    editModal.style.display = "block";
  };

  // Show the delete confirmation modal
  document.querySelectorAll("#delete-button").forEach((button) => {
    button.addEventListener("click", function () {
      supplierIdToDelete = this.getAttribute("data-supplier-id");
      deleteModal.style.display = "block";
    });
  });

  // Close modals
  closeModal.forEach((button) => {
    button.addEventListener("click", function () {
      editModal.style.display = "none";
      deleteModal.style.display = "none";
      editDetailsModal.style.display = "none";
    });
  });

  // Hide modals if the user clicks outside of them
  window.addEventListener("click", function (event) {
    if (event.target === editModal) {
      editModal.style.display = "none";
    } else if (event.target === deleteModal) {
      deleteModal.style.display = "none";
    }
  });

  // Handle edit form submission
  editForm.addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevent default form submission

    const id = document.getElementById("supplierId").value;
    const name = document.getElementById("name").value;
    const contact = document.getElementById("contact").value;
    const address = document.getElementById("address").value;

    try {
      const response = await fetch(`/admin/suppliers/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          supplier_name: name,
          supplier_contact: contact,
          supplier_address: address,
        }),
      });

      console.log("Response status:", response.status);
      console.log("Response text:", await response.text());

      editModal.style.display = "none";
      location.reload();
    } catch (error) {
      console.error("Error:", error);
    }
  });

  // Handle delete confirmation
  document
    .getElementById("confirmDeleteBtn")
    .addEventListener("click", async function () {
      if (supplierIdToDelete) {
        try {
          // Ensure the request URL is correct
          const response = await fetch(
            `/admin/suppliers/delete-supplier/${supplierIdToDelete}`,
            {
              method: "POST", // Change this to POST if your backend is expecting POST
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          console.log("Response status:", response.status);
          console.log("Response text:", await response.text());

          if (response.ok) {
            deleteModal.style.display = "none";
            location.reload(); // Refresh the page after successful delete
          } else {
            console.error(
              "Failed to delete supplier. Status:",
              response.status
            );
          }
        } catch (error) {
          console.error("Error:", error);
        }
      }
    });

  document
    .getElementById("cancelDeleteBtn")
    .addEventListener("click", function () {
      deleteModal.style.display = "none";
    });
});
