// DOM Elements
const modal = document.getElementById("adminLoginModal");
const openModalButton = document.getElementById("admin-login-modal-button");
const closeModalButton = document.querySelector(".close");
const errorAdminEmail = document.getElementById("error-admin-email");
const errorAdminPassword = document.getElementById("error-admin-password");
const loginAdminButton = document.getElementById("login-admin-button");
const emailInput = document.getElementById("login-admin-email-input");
const passwordInput = document.getElementById("login-admin-password-input");
const adminCustomAlert = document.getElementById("admin-custom-alert");

// Event Listeners
if (openModalButton) {
  openModalButton.addEventListener("click", showModal);
}

if (closeModalButton) {
  closeModalButton.addEventListener("click", hideModal);
}

emailInput.addEventListener("input", validateEmailInput);
passwordInput.addEventListener("input", validatePasswordInput);
loginAdminButton.addEventListener("click", attemptLogin);

// Adding event listener for Enter key
document.addEventListener("keydown", (event) => {
  if (
    event.key === "Enter" &&
    modal.style.display === "block" &&
    (document.activeElement === emailInput ||
      document.activeElement === passwordInput)
  ) {
    attemptLogin();
  }
});

// Show Modal
function showModal() {
  modal.style.display = "block";
  document.body.classList.add("disable-background");
}

// Hide Modal
function hideModal() {
  modal.style.display = "none";
  document.body.classList.remove("disable-background");
  clearErrors();
}

// Validate Email Input
function validateEmailInput() {
  const email = emailInput.value.trim();
  const emailValidationError = validateEmail(email);
  if (emailValidationError) {
    displayErrorMessage(errorAdminEmail, emailValidationError);
  } else {
    clearErrorMessage(errorAdminEmail);
  }
}

// Validate Password Input
function validatePasswordInput() {
  const password = passwordInput.value.trim();
  if (!password) {
    displayErrorMessage(errorAdminPassword, "Password is required");
  } else {
    clearErrorMessage(errorAdminPassword);
  }
}

// Attempt Login
async function attemptLogin() {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  const emailValidationError = validateEmail(email);
  if (emailValidationError) {
    displayErrorMessage(errorAdminEmail, emailValidationError);
    clearErrorMessage(errorAdminPassword);
    return;
  } else {
    clearErrorMessage(errorAdminEmail);
  }

  if (!password) {
    displayErrorMessage(errorAdminPassword, "Password is required");
    return;
  } else {
    clearErrorMessage(errorAdminPassword);
  }

  try {
    const response = await fetch("/login/admin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.status === 429) {
      showCustomAlert("Too many login attempts, please try again later.");
      return;
    }

    if (!response.ok) {
      throw {
        message: data.error || "Login failed",
        status: response.status,
      };
    }

    const token = data.token;
    localStorage.setItem("token", token);
    window.location.href = "/admin/branch";
  } catch (error) {
    console.error("Error caught in frontend:", error);
    handleLoginError(error.message);
  }
}

// Show Custom Alert
function showCustomAlert(message) {
  adminCustomAlert.textContent = message;
  adminCustomAlert.classList.add("show");
  adminCustomAlert.classList.remove("hidden");
  adminCustomAlert.classList.add("showAlert");

  setTimeout(() => {
    adminCustomAlert.classList.remove("show");
    adminCustomAlert.classList.add("hidden");
  }, 5000);
}

// Display Error Messages
function displayErrorMessage(element, message) {
  if (element) {
    element.textContent = message;
    element.style.display = "block";
  }
}

// Clear Error Messages
function clearErrorMessage(element) {
  if (element) {
    element.textContent = "";
    element.style.display = "none";
  }
}

// Clear All Error Messages
function clearErrors() {
  clearErrorMessage(errorAdminEmail);
  clearErrorMessage(errorAdminPassword);
}

// Handle Login Errors
function handleLoginError(message) {
  console.error("Error logging in:", message);
  clearErrors();

  if (message === "Email not found") {
    displayErrorMessage(errorAdminEmail, "Email not found.");
  } else if (message === "Incorrect password") {
    displayErrorMessage(errorAdminPassword, "Incorrect password.");
  } else if (message === "Too many login attempts, please try again later.") {
    showCustomAlert(message);
  } else {
    showCustomAlert("Network Error, Please try again later.");
  }
}

// Validate Email Function
function validateEmail(email) {
  if (!email) {
    return "Email is required";
  }
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(email)) {
    return "Invalid email";
  }
  return null;
}
