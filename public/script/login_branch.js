document.addEventListener("DOMContentLoaded", () => {
  const loginButton = document.getElementById("login-button");
  const customAlert = document.getElementById("admin-custom-alert");

  // Function to show custom alert message
  const showCustomAlert = (message) => {
    customAlert.textContent = message;
    customAlert.classList.remove("hidden");
    customAlert.classList.add("show", "showAlert");

    // Hide the alert after 5 seconds (or adjust as needed)
    setTimeout(() => {
      customAlert.classList.remove("show", "showAlert");
      customAlert.classList.add("hidden");
    }, 5000);
  };

  // Function to handle login
  const handleLogin = async () => {
    const branchName = document.getElementById("branch_name").value;
    const branchKey = document.getElementById("branch_key").value.trim();
    const selectBranchError = document.getElementById("err-select-branch");
    const inputBranchError = document.getElementById("err-input-branch");

    // Clear previous error messages
    selectBranchError.textContent = "";
    inputBranchError.textContent = "";

    // Flag to track if there are errors
    let hasError = false;

    // Check if branchName is empty
    if (!branchName) {
      selectBranchError.textContent = "Please select a Branch Name.";
      hasError = true;
    }

    // Check if branchKey is empty
    if (!branchKey) {
      inputBranchError.textContent = "Please enter a Branch Key.";
      hasError = true;
    }

    // If there are errors, stop further execution
    if (hasError) {
      return;
    }

    try {
      const response = await fetch("/login/branch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          branch_name: branchName,
          branch_key: branchKey,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.error === "Invalid branch key") {
          inputBranchError.textContent = "Invalid Branch Key.";
        } else if (
          result.error === "Unable to login. Please check your connection"
        ) {
          showCustomAlert("Unable to login. Please check your connection.");
        } else if (result.error === "Branch not found") {
          showCustomAlert("Branch not found.");
        } else {
          // Handle other types of errors or display a generic message
          selectBranchError.textContent = result.error || "An error occurred.";
        }
        return;
      }

      window.electronAPI.sendLoginData(
        result.token,
        result.branch_id,
        result.branch_name,
        result.personnelName
      );
      localStorage.setItem("token", result.token);
      window.location.href = `/orders/${result.branch_id}`; // Redirect to the orders page with branch_id
    } catch (error) {
      showCustomAlert("An error occurred: " + error.message);
    }
  };

  // Trigger login on button click
  if (loginButton) {
    loginButton.addEventListener("click", handleLogin);
  }

  // Trigger login on Enter key press, only when focused on branch login fields
  document.addEventListener("keydown", (event) => {
    const activeElement = document.activeElement;
    if (
      event.key === "Enter" &&
      (activeElement.id === "branch_name" || activeElement.id === "branch_key")
    ) {
      handleLogin();
    }
  });
});
