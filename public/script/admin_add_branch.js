// Add an event listener that runs the provided function once the DOM content is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  // Get the "Add Branch" button element by its ID
  const addBranchButton = document.getElementById("add-branch");

  // Add a click event listener to the "Add Branch" button
  addBranchButton.addEventListener("click", handleAddBranchClick);

  // Handle the Add Branch button click event
  async function handleAddBranchClick() {
    try {
      // Clear any previous error messages displayed on the form
      clearErrorMessages();

      // Check connectivity by making a request to the "/check-connectivity" endpoint
      const connectivityResponse = await fetch("/check-connectivity");
      if (!connectivityResponse.ok) {
        displayCustomAlert(
          "You are currently offline. Please check your internet connection."
        );
        return; // Exit the function if the connectivity check fails
      }

      // Collect input values from the form fields and trim whitespace
      const branchData = collectInputValues();

      // Validate input values and show real-time feedback for empty inputs
      if (!validateInputs(branchData)) return;

      // Send the branch data to the backend server via a POST request
      await submitBranchData(branchData);
    } catch (error) {
      // Log any caught errors to the console
      console.error("Error:", error);
      displayCustomAlert(
        "No internet connection. Please check your connection and try again."
      );
    }
  }

  // Function to display a custom alert
  function displayCustomAlert(message) {
    const alertContainer = document.getElementById("customAlertContainer");
    alertContainer.textContent = message;
    alertContainer.style.opacity = 1; // Show the alert

    // Optionally hide the alert after 3 seconds
    setTimeout(() => {
      alertContainer.style.opacity = 0; // Fade out the alert
    }, 3000);
  }

  // Function to collect input values and trim whitespace
  function collectInputValues() {
    return {
      branchName: getValueAndTrim("branch-name"),
      province: getValueAndTrim("province"),
      city: getValueAndTrim("city"),
      baranggay: getValueAndTrim("baranggay"),
      streetName: getValueAndTrim("street-name"),
      building: getValueAndTrim("building"),
      houseNumber: getValueAndTrim("house-number"),
      branchKey: getValueAndTrim("branch-key"),
      confirmBranchKey: getValueAndTrim("confirm-branch-key"),
    };
  }

  // Function to validate input values and show feedback for empty fields
  function validateInputs(data) {
    let isValid = true;
    const fields = [
      { value: data.branchName, label: "Branch name" },
      { value: data.province, label: "Province" },
      { value: data.city, label: "City" },
      { value: data.baranggay, label: "Baranggay" },
      { value: data.streetName, label: "Street name" },
      { value: data.building, label: "Building" },
      { value: data.houseNumber, label: "House number" },
      { value: data.branchKey, label: "Branch key" },
      { value: data.confirmBranchKey, label: "Confirm branch key" },
    ];

    fields.forEach((field) => {
      if (!field.value) {
        displayErrorMessage(
          `err-${field.label.replace(/\s+/g, "-").toLowerCase()}`,
          `${field.label} is required.`
        );
        isValid = false;
      }
    });

    // Check if Confirm Branch Key matches Branch Key
    if (data.branchKey !== data.confirmBranchKey) {
      displayErrorMessage("err-confirm-branch-key", "Branch key do not match.");
      isValid = false;
    }

    return isValid;
  }

  async function submitBranchData(branchData) {
    const response = await fetch("/add-branch", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(branchData),
    });

    // Handle the response from the server
    if (response.ok) {
      const data = await response.json();
      console.log("Success:", data);
      // Redirect to the branch management page upon successful addition
      window.location.href = "/admin/branch";
    } else {
      const errorData = await response.json();
      if (
        response.status === 400 &&
        errorData.error === "Branch name already exists."
      ) {
        displayErrorMessage("err-branch-name", "Branch name already exists.");
      } /*else if (
        response.status === 400 &&
        errorData.error === "Branch key already exists"
      ) {
        displayErrorMessage("err-branch-key", "Branch key already exists");
      } */ else {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
    }
  }

  // Function to get the trimmed value of an input field by its ID
  function getValueAndTrim(id) {
    return document.getElementById(id).value.trim();
  }

  // Function to clear all error messages from the form
  function clearErrorMessages() {
    const errorDivs = document.querySelectorAll(".form-grid > div[id^='err-']");
    errorDivs.forEach((div) => (div.textContent = ""));
  }

  // Function to display an error message for a specific form field
  function displayErrorMessage(elementId, message) {
    const errorDiv = document.getElementById(elementId);
    errorDiv.textContent = message;
  }
});
