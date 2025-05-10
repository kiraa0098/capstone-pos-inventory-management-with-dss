let adminIdToDelete = null;

function showAddAdminModal() {
  document.getElementById("addAdminModal").style.display = "block";
}

function closeAddAdminModal() {
  document.getElementById("addAdminModal").style.display = "none";
}

// Close the modal when clicking outside of it
window.onclick = function (event) {
  const addModal = document.getElementById("addAdminModal");
  const editModal = document.getElementById("editAdminModal");
  const deleteModal = document.getElementById("deleteConfirmationModal");
  const changePasswordModal = document.getElementById("changePasswordModal");

  if (event.target === addModal) closeAddAdminModal();
  if (event.target === editModal) closeEditModal();
  if (event.target === deleteModal) closeDeleteModal();
  if (event.target === changePasswordModal) closeChangePasswordModal();
};

function openEditModal(admin) {
  document.getElementById("editAdminId").value = admin.admin_id;
  document.getElementById("editAdminEmail").value = admin.admin_email;
  document.getElementById("editAdminFirstName").value = admin.admin_first_name;
  document.getElementById("editAdminLastName").value = admin.admin_last_name;
  document.getElementById("editAdminModal").style.display = "block";
}

function closeEditModal() {
  document.getElementById("editAdminModal").style.display = "none";
}

async function updateAdmin(event) {
  event.preventDefault();

  const adminId = document.getElementById("editAdminId").value;
  const email = document.getElementById("editAdminEmail").value;
  const firstName = document.getElementById("editAdminFirstName").value;
  const lastName = document.getElementById("editAdminLastName").value;

  try {
    const response = await fetch(`/api/admins/${adminId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        admin_email: email,
        admin_first_name: firstName,
        admin_last_name: lastName,
      }),
    });

    if (!response.ok) throw new Error("Network response was not ok");
    closeEditModal();
    location.reload();
  } catch (error) {
    console.error("[updateAdmin] Error updating admin:", error);
  }
}

function toggleChangePasswordSection() {
  const section = document.getElementById("changePasswordSection");
  section.style.display =
    section.style.display === "none" || section.style.display === ""
      ? "block"
      : "none";
}

async function changePassword(event) {
  event.preventDefault();

  const adminId = document.getElementById("editAdminId").value;
  const currentPassword = document.getElementById("currentPassword").value;
  const newPassword = document.getElementById("newPassword").value;
  const confirmNewPassword =
    document.getElementById("confirmNewPassword").value;

  if (newPassword !== confirmNewPassword) {
    alert("Passwords do not match!");
    return;
  }

  if (newPassword.length < 8) {
    alert("Password must be at least 8 characters long.");
    return;
  }

  try {
    const response = await fetch(`/api/admins/${adminId}/change-password`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to update password");
    }

    alert("Password changed successfully");
    document.getElementById("currentPassword").value = "";
    document.getElementById("newPassword").value = "";
    document.getElementById("confirmNewPassword").value = "";
    location.reload(); // Optional: Remove if UI updates dynamically
  } catch (error) {
    console.error("[changePassword] Error:", error.message, error.stack);
    alert("Failed to change password. Please try again later.");
  }
}
