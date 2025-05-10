document.addEventListener("DOMContentLoaded", function () {
  const saveInfoButton = document.getElementById("save-info-btn");
  const branchNameInput = document.getElementById("branch-name");
  const provinceInput = document.getElementById("loc-province");
  const baranggayInput = document.getElementById("loc-baranggay");
  const cityInput = document.getElementById("loc-city");
  const streetNameInput = document.getElementById("loc-street-name");
  const buildingNumberInput = document.getElementById("loc-building");
  const houseNumberInput = document.getElementById("loc-house-number");
  const personelInput = document.getElementById("personel-in-charge");
  const branchId = window.location.pathname.split("/").pop(); // Extract branchId from the URL

  // Store initial values
  const initialValues = {
    branchName: branchNameInput.value,
    province: provinceInput.value,
    baranggay: baranggayInput.value,
    city: cityInput.value,
    streetName: streetNameInput.value,
    buildingNumber: buildingNumberInput.value,
    houseNumber: houseNumberInput.value,
    personelInCharge: personelInput.value,
  };

  // Disable the save button by default
  saveInfoButton.disabled = true;

  // Function to check if any input value has changed
  function hasChanges() {
    return (
      branchNameInput.value !== initialValues.branchName ||
      provinceInput.value !== initialValues.province ||
      baranggayInput.value !== initialValues.baranggay ||
      cityInput.value !== initialValues.city ||
      streetNameInput.value !== initialValues.streetName ||
      buildingNumberInput.value !== initialValues.buildingNumber ||
      houseNumberInput.value !== initialValues.houseNumber ||
      personelInput.value !== initialValues.personelInCharge
    );
  }

  // Function to enable or disable the button based on changes
  function updateButtonState() {
    saveInfoButton.disabled = !hasChanges();
  }

  // Add event listeners to input fields
  [
    branchNameInput,
    provinceInput,
    baranggayInput,
    cityInput,
    streetNameInput,
    buildingNumberInput,
    houseNumberInput,
    personelInput,
  ].forEach((input) => {
    input.addEventListener("input", updateButtonState);
  });

  saveInfoButton.addEventListener("click", async function () {
    const branchName = branchNameInput.value;
    const province = provinceInput.value;
    const baranggay = baranggayInput.value;
    const city = cityInput.value;
    const streetName = streetNameInput.value;
    const buildingNumber = buildingNumberInput.value;
    const houseNumber = houseNumberInput.value;
    const personelInCharge = personelInput.value;

    try {
      const response = await fetch("/admin/branch/update-branch-info", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: branchId,
          branch_name: branchName,
          loc_province: province,
          loc_baranggay: baranggay,
          loc_city: city,
          loc_street_name: streetName,
          loc_building: buildingNumber,
          loc_house_number: houseNumber,
          personel_in_charge: personelInCharge,
        }),
      });

      const result = await response.json();

      // Store success or error message in local storage
      localStorage.setItem(
        "alert",
        JSON.stringify({
          message: result.success
            ? "Branch information updated successfully"
            : result.message,
          type: result.success ? "success" : "error",
        })
      );

      // Wait a bit before reloading
      setTimeout(() => {
        window.location.reload();
      }, 1000); // Adjust this time as needed
    } catch (error) {
      console.error("Error:", error);
      // Store error message in local storage
      localStorage.setItem(
        "alert",
        JSON.stringify({
          message: "An error occurred while updating branch information",
          type: "error",
        })
      );

      // Wait a bit before reloading
      setTimeout(() => {
        window.location.reload();
      }, 1000); // Adjust this time as needed
    }
  });

  // Function to display alert from local storage
  function showStoredAlert() {
    const alert = JSON.parse(localStorage.getItem("alert"));
    if (alert && alert.message) {
      displayAlert(alert.message, alert.type);
      localStorage.removeItem("alert");
    }
  }

  // Call the function to display any stored alert
  showStoredAlert();

  function displayAlert(message, type) {
    const alertContainer = document.getElementById("customAlertContainer");
    const alert = document.createElement("div");
    alert.className = `custom-alert ${type}`;
    alert.textContent = message;

    // Make sure to reset opacity to 1 to show it
    alert.style.opacity = 1;
    alertContainer.appendChild(alert);

    // Fade in effect
    alert.classList.add("fade-in");

    // Wait for 3 seconds then fade out
    setTimeout(() => {
      alert.classList.remove("fade-in");
      alert.classList.add("fade-out");
      setTimeout(() => {
        alert.remove(); // Remove alert after fade-out
      }, 500); // Duration of fade-out transition
    }, 3000); // Duration the alert stays visible
  }
});
