document.addEventListener("DOMContentLoaded", function () {
  const changeBranchKeyButton = document.getElementById(
    "change-branch-key-btn"
  );
  const branchKeyFields = document.getElementById("branch-key-fields");
  const confirmButton = document.getElementById("confirm-new-branch-key-btn");
  const cancelButton = document.getElementById("cancel-changes-info");
  const saveButton = document.getElementById("save-info-btn");
  const inputFields = document.querySelectorAll(".left-container input");
  const errorMessages = {
    oldBranchKey: document.getElementById("err-old-branch-key"),
    newBranchKey: document.getElementById("err-branch-key"),
    confirmBranchKey: document.getElementById("err-confirm-branch-key"),
  };

  // Extract the branchId from the URL
  const branchId = window.location.pathname.split("/").pop();
  console.log("Branch ID:", branchId); // Debugging line

  function checkForChanges() {
    let hasChanges = false;
    inputFields.forEach((input) => {
      if (input.value !== input.defaultValue) {
        hasChanges = true;
      }
    });
    // Enable or disable buttons based on whether there are changes
    saveButton.disabled = !hasChanges;
    saveButton.classList.toggle("disabled", !hasChanges);
    cancelButton.disabled = !hasChanges;
    cancelButton.classList.toggle("disabled", !hasChanges);
  }

  // Toggle branch key fields visibility
  changeBranchKeyButton.addEventListener("click", function () {
    const isHidden =
      branchKeyFields.style.display === "none" ||
      !branchKeyFields.classList.contains("show");

    if (isHidden) {
      branchKeyFields.style.display = "block"; // Ensure it's displayed before starting animation
      setTimeout(() => branchKeyFields.classList.add("show"), 10); // Slight delay for smooth transition
    } else {
      branchKeyFields.classList.remove("show");
      setTimeout(() => (branchKeyFields.style.display = "none"), 500); // Hide after transition ends
    }
    changeBranchKeyButton.textContent = isHidden ? "Hide" : "Change branch key";
  });

  // Enable or disable buttons based on input changes
  inputFields.forEach((input) => {
    input.addEventListener("input", checkForChanges);
  });

  confirmButton.addEventListener("click", async function () {
    const oldBranchKey = document.getElementById("old-branch-key").value;
    const newBranchKey = document.getElementById("new-branch-key").value;
    const confirmBranchKey =
      document.getElementById("confirm-branch-key").value;

    console.log("Old Branch Key:", oldBranchKey); // Debugging line
    console.log("New Branch Key:", newBranchKey); // Debugging line
    console.log("Confirm Branch Key:", confirmBranchKey); // Debugging line

    // Clear previous error messages
    Object.values(errorMessages).forEach((el) => (el.textContent = ""));

    let hasError = false;

    // Validate inputs
    if (!oldBranchKey) {
      errorMessages.oldBranchKey.textContent = "Old branch key is required.";
      hasError = true;
    }

    if (!newBranchKey) {
      errorMessages.newBranchKey.textContent = "New branch key is required.";
      hasError = true;
    }

    if (!confirmBranchKey) {
      errorMessages.confirmBranchKey.textContent =
        "Confirm branch key is required.";
      hasError = true;
    } else if (newBranchKey !== confirmBranchKey) {
      errorMessages.confirmBranchKey.textContent =
        "New branch key and confirm branch key do not match.";
      hasError = true;
    }

    if (hasError) return; // Exit if there are validation errors

    try {
      // Construct the URL with the branchId
      const url = `/admin/branch/${branchId}/update-branch-key`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          old_branch_key: oldBranchKey,
          new_branch_key: newBranchKey,
        }),
      });

      console.log("Response Status:", response.status); // Debugging line
      const result = await response.json();
      console.log("Response Result:", result); // Debugging line

      if (result.success) {
        branchKeyFields.style.display = "none";
        changeBranchKeyButton.textContent = "Change branch key";
        // Reset inputs to default values
        inputFields.forEach((input) => {
          input.value = input.defaultValue;
        });
        checkForChanges(); // Update button states after reset
      } else {
        errorMessages.oldBranchKey.textContent =
          result.message === "Old branch key is incorrect"
            ? "Old branch key is incorrect."
            : "Failed to update branch key.";
      }
    } catch (error) {
      console.error("Error:", error);
    }
  });

  cancelButton.addEventListener("click", function () {
    // Reset inputs to default values
    inputFields.forEach((input) => {
      input.value = input.defaultValue;
    });
    checkForChanges(); // Update button states after reset
  });
});
