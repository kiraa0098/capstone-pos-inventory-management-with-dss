// Function to check internet connectivity
async function checkConnectivity() {
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

// Wait for the DOM content to load before executing JavaScript
document.addEventListener("DOMContentLoaded", function () {
  // Get the logout button element from the DOM
  const logoutButton = document.getElementById("admin-logout-button");

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

  // Add click event listener to the logout button
  logoutButton.addEventListener("click", async () => {
    if (!(await checkConnectivity())) {
      showCustomAlertMessage(
        "No internet connection. Please check your connection and try again.",
        true
      );
      return;
    }

    try {
      // Send a POST request to the server to logout the admin
      const response = await fetch("/logout/admin", {
        method: "POST",
      });

      // Check if the logout request was successful
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Logout failed");
      }

      // Parse the JSON response from the server
      const data = await response.json();
      console.log(data);

      // Redirect the user to the home page after successful logout
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
