// Function to show the custom alert
function showCustomAlert(message, type = "error") {
  const alertDiv = document.getElementById("custom-alert");
  alertDiv.textContent = message;

  // Remove previous alert type classes
  alertDiv.classList.remove("success", "error");

  // Add the appropriate class based on the alert type
  alertDiv.classList.add(type);

  // Show the alert
  alertDiv.classList.add("show");

  // Fade out the alert after 3 seconds
  setTimeout(() => {
    alertDiv.classList.remove("show");
  }, 3000); // Adjust delay to match the fade-out effect
}

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

// Transition between phases
document.getElementById("send-code-btn").addEventListener("click", async () => {
  if (!(await checkConnectivity())) {
    showCustomAlert(
      "No internet connection. Please check your connection and try again.",
      "error"
    );
    return;
  }

  const pathParts = window.location.pathname.split("/");
  const branchId = pathParts[pathParts.length - 2]; // Assuming branch_id is the second last segment

  // Disable the button to prevent double sending
  const sendCodeBtn = document.getElementById("send-code-btn");
  sendCodeBtn.disabled = true;

  fetch(`/admin/branch/${branchId}/forgot-branch-key/send-code`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        console.log("Verification Code:", data.verificationCode);
        window.storedVerificationCode = data.verificationCode;

        // Transition to phase 2
        document.getElementById("phase-1").style.display = "none";
        document.getElementById("phase-2").style.display = "block";
      } else {
        console.error("Error:", data.message);
        sendCodeBtn.disabled = false;
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      sendCodeBtn.disabled = false;
    });
});

document
  .getElementById("confirm-code-btn")
  .addEventListener("click", async () => {
    if (!(await checkConnectivity())) {
      showCustomAlert(
        "No internet connection. Please check your connection and try again.",
        "error"
      );
      return;
    }

    const enteredCode = document.getElementById(
      "verification-code-input"
    ).value;
    const errorDiv = document.getElementById("err-code");
    const confirmCodeBtn = document.getElementById("confirm-code-btn");
    errorDiv.textContent = "";

    if (!enteredCode) {
      errorDiv.textContent = "Verification code is required.";
    } else if (!/^\d{6}$/.test(enteredCode)) {
      errorDiv.textContent = "Verification code must be exactly 6 digits.";
    } else if (enteredCode !== window.storedVerificationCode) {
      errorDiv.textContent =
        "Verification code is incorrect. Please try again.";
    } else {
      // Code is correct, transition to phase 3
      document.getElementById("phase-2").style.display = "none";
      document.getElementById("phase-3").style.display = "block";
    }

    // Re-enable the button after each attempt
    confirmCodeBtn.disabled = false;
  });

// Re-enable the confirm button when the user starts typing in the verification code input
document
  .getElementById("verification-code-input")
  .addEventListener("input", function (event) {
    const inputField = event.target;
    let inputValue = inputField.value;

    // Remove any non-numeric characters
    inputValue = inputValue.replace(/\D/g, "");

    // Limit input to 6 digits
    if (inputValue.length > 6) {
      inputValue = inputValue.slice(0, 6);
    }

    // Update the input field value with the valid input
    inputField.value = inputValue;

    // Enable the confirm button if valid input is provided
    const confirmCodeBtn = document.getElementById("confirm-code-btn");
    confirmCodeBtn.disabled = inputValue.length !== 6;
  });

document.getElementById("final-btn").addEventListener("click", async () => {
  if (!(await checkConnectivity())) {
    showCustomAlert(
      "No internet connection. Please check your connection and try again.",
      "error"
    );
    return;
  }

  const newBranchKey = document.getElementById("new-input").value;
  const confirmNewBranchKey =
    document.getElementById("confirm-new-input").value;

  const errNewBranchKeyDiv = document.getElementById("err-new-branch-key");
  const errConfirmNewBranchKeyDiv = document.getElementById(
    "err-confirm-new-branch-key"
  );

  errNewBranchKeyDiv.textContent = "";
  errConfirmNewBranchKeyDiv.textContent = "";

  if (!newBranchKey) {
    errNewBranchKeyDiv.textContent = "New branch key is required.";
    return;
  }

  if (newBranchKey !== confirmNewBranchKey) {
    errConfirmNewBranchKeyDiv.textContent =
      "New branch key and confirmation do not match.";
    return;
  }

  const pathParts = window.location.pathname.split("/");
  const branchId = pathParts[pathParts.length - 2]; // Assuming branch_id is the second last segment

  fetch(`/admin/branch/${branchId}/forgot-branch-key/update-branch-key`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ new_branch_key: newBranchKey }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        showCustomAlert(
          "Branch key updated successfully. Redirecting...",
          "success"
        );
        setTimeout(() => {
          window.location.href = `/admin/branch/${branchId}`;
        }, 3000);
      } else {
        showCustomAlert(
          "An error occurred while updating the branch key.",
          "error"
        );
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      showCustomAlert(
        "An error occurred while updating the branch key.",
        "error"
      );
    });
});

// Password visibility toggle for new branch key input
let newInputEyeIcon = document.getElementById("new-input-eyeIcon");
let newInputField = document.getElementById("new-input");

newInputEyeIcon.onclick = function () {
  if (newInputField.type === "text") {
    newInputField.type = "password";
    newInputEyeIcon.src = "/assets/images/eye-close.png";
  } else {
    newInputField.type = "text";
    newInputEyeIcon.src = "/assets/images/eye-open.png";
  }
};

// Password visibility toggle for confirm new branch key input
let confirmNewInputEyeIcon = document.getElementById(
  "confirm-new-input-eyeIcon"
);
let confirmNewInputField = document.getElementById("confirm-new-input");

confirmNewInputEyeIcon.onclick = function () {
  if (confirmNewInputField.type === "text") {
    confirmNewInputField.type = "password";
    confirmNewInputEyeIcon.src = "/assets/images/eye-close.png";
  } else {
    confirmNewInputField.type = "text";
    confirmNewInputEyeIcon.src = "/assets/images/eye-open.png";
  }
};
