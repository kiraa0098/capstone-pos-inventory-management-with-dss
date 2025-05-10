async function checkConnectivity() {
  // Check if the user is online
  if (navigator.onLine) {
    try {
      const response = await fetch("/check-connectivity", { method: "HEAD" });
      return response.ok;
    } catch {
      return false;
    }
  }
  return false;
}

document.addEventListener("DOMContentLoaded", function () {
  const logoutButton = document.getElementById("branch-logout-button");

  // Function to show custom alert message
  function showCustomAlertMessage(message, isError = false) {
    const alertContainer = document.getElementById("customAlertContainer");
    alertContainer.textContent = message;

    // Add the error class if it's an error message
    if (isError) {
      alertContainer.classList.add("error");
    } else {
      alertContainer.classList.remove("error");
    }

    // Make the alert visible
    alertContainer.style.opacity = 1;

    // Hide the alert after 3 seconds
    setTimeout(() => {
      alertContainer.style.opacity = 0;
    }, 3000);
  }

  logoutButton.addEventListener("click", async () => {
    if (!(await checkConnectivity())) {
      showCustomAlertMessage(
        "No internet connection. Please check your connection and try again.",
        true
      );
      return;
    }

    try {
      const response = await fetch("/logout/branch", {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Logout failed");
      }

      const data = await response.json();
      console.log(data);

      window.location.href = "/";
    } catch (error) {
      if (error instanceof TypeError) {
        console.error("Network error:", error.message);
        showCustomAlertMessage(
          "Network error: Unable to logout. Please check your connection and try again.",
          true
        );
      } else {
        console.error("Logout error:", error.message);
        showCustomAlertMessage(error.message, true);
      }
    }
  });
});
