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

document.addEventListener("DOMContentLoaded", () => {
  // DOM elements
  const sections = Array.from(document.querySelectorAll(".section"));
  const startButton = document.getElementById("start-button");
  const sendCodeButton = document.getElementById("send-code-button");
  const verifyCodeButton = document.getElementById("verify-code-button");
  const setupAdminButton = document.getElementById("setup-admin-button");
  const updateEmailButtons = Array.from(
    document.querySelectorAll(".update-email-button")
  );

  // State variables
  let email = "";
  let generatedVerificationCode = "";

  // Function to show custom alert message
  const customAlert = document.getElementById("admin-custom-alert");

  // Function to show custom alert message
  const showCustomAlert = (message) => {
    customAlert.textContent = message;
    customAlert.classList.remove("hidden");
    customAlert.classList.add("show", "showAlert");

    console.log("Showing custom alert with message:", message); // Debugging line
    console.log("Alert classes:", customAlert.className); // Debugging line

    // Hide the alert after 5 seconds (or adjust as needed)
    setTimeout(() => {
      customAlert.classList.remove("show", "showAlert");
      customAlert.classList.add("hidden");
    }, 5000);
  };

  // Event listener for the start button to navigate to the email registration section
  if (startButton) {
    startButton.addEventListener("click", () =>
      navigateToSection("email-registration-section")
    );
  }

  // Event listener for the send code button to initiate the verification code sending process
  if (sendCodeButton) {
    sendCodeButton.addEventListener("click", async (event) => {
      event.preventDefault();

      // Disable the send code button during the request
      disableButton(sendCodeButton);

      const email = document.getElementById("email").value.trim();
      const errorEmailDiv = document.getElementById("err-email");

      // Validate email input
      if (!isValidEmail(email)) {
        displayError(errorEmailDiv, "Please enter a valid email address.");
        enableButton(sendCodeButton);
        return;
      }

      if (!(await checkConnectivity())) {
        showCustomAlert(
          "No internet connection. Please check your connection and try again."
        );
        enableButton(sendCodeButton);
        return;
      }

      try {
        const response = await fetch("/send-verification-code", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        });

        const data = await response.json();

        if (!response.ok) {
          displayError(
            errorEmailDiv,
            "An unexpected error occurred. Please try again later."
          );
          throw new Error(data.error || "Failed to send verification code");
        }

        document.getElementById("email-to-receive-code").innerText = email;
        generatedVerificationCode = data.verificationCode;
        console.log("Generated code: ", generatedVerificationCode);
        navigateToSection("email-verification-section");
      } catch (error) {
        console.error("[/send-verification-code POST]: ", error);
        showCustomAlert(
          "An unexpected error occurred. Please try again later."
        );
      } finally {
        enableButton(sendCodeButton);
      }
    });
  }

  // Event listener for the verify code button to check the entered verification code
  if (verifyCodeButton) {
    verifyCodeButton.addEventListener("click", () => {
      const errorCodeDiv = document.getElementById("err-code");
      const verificationCodeInput = document
        .getElementById("verification-code")
        .value.trim();

      if (!isValidVerificationCode(verificationCodeInput)) {
        displayError(errorCodeDiv, "Please enter a 6-digit verification code.");
        return;
      }

      if (verificationCodeInput !== generatedVerificationCode) {
        displayError(errorCodeDiv, "Incorrect verification code.");
        return;
      }

      document.getElementById("verification-code").value = "";
      navigateToSection("personal-information-section");
    });
  }

  // Event listener for the setup admin button to set up the admin account
  if (setupAdminButton) {
    setupAdminButton.addEventListener("click", async (event) => {
      event.preventDefault();

      const email = document.getElementById("email").value.trim();
      const firstName = document.getElementById("first-name").value.trim();
      const lastName = document.getElementById("last-name").value.trim();
      const password = document.getElementById("password").value;
      const confirmPassword = document.getElementById("confirm-password").value;

      const errorFirstNameDiv = document.getElementById("err-firstname");
      const errorLastNameDiv = document.getElementById("err-lastname");
      const errorPasswordDiv = document.getElementById("err-password");
      const errorConfirmPasswordDiv = document.getElementById(
        "err-confirm-password"
      );

      const isValid = validateInputs(
        firstName,
        lastName,
        password,
        confirmPassword,
        errorFirstNameDiv,
        errorLastNameDiv,
        errorPasswordDiv,
        errorConfirmPasswordDiv
      );

      if (!isValid) {
        return;
      }

      if (!(await checkConnectivity())) {
        showCustomAlert(
          "No internet connection. Please check your connection and try again."
        );
        return;
      }

      try {
        const response = await fetch("/setup-admin", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, firstName, lastName, password }),
        });

        if (!response.ok) {
          throw new Error("Failed to set up admin");
        }

        window.location.href = "/login";
      } catch (error) {
        console.error("[/setup-admin POST ] Error setting up admin:", error);
        showCustomAlert("Failed to set up admin. Please try again later.");
      }
    });
  }

  // Event listener for "Update email" buttons to navigate to email registration section
  updateEmailButtons.forEach((button) => {
    button.addEventListener("click", () => {
      navigateToSection("email-registration-section");
    });
  });

  // Function to toggle visibility of sections based on section ID
  function navigateToSection(sectionId) {
    sections.forEach((section) => {
      section.classList.toggle("hidden", section.id !== sectionId);
    });
  }

  // Function to validate email format
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Function to validate verification code format
  function isValidVerificationCode(code) {
    const codeRegex = /^\d{6}$/;
    return codeRegex.test(code);
  }

  // Function to display error message in an element
  function displayError(element, message) {
    element.innerText = message;
    element.classList.add("reg-error-email-alert");
  }

  // Function to enable a button
  function enableButton(button) {
    button.classList.remove("button-disabled");
    button.disabled = false;
  }

  // Function to disable a button
  function disableButton(button) {
    button.classList.add("button-disabled");
    button.disabled = true;
  }

  // Function to validate first name and last name inputs
  function validateInputs(
    firstName,
    lastName,
    password,
    confirmPassword,
    errorFirstNameDiv,
    errorLastNameDiv,
    errorPasswordDiv,
    errorConfirmPasswordDiv
  ) {
    let isValid = true;

    if (!isValidName(firstName)) {
      displayError(errorFirstNameDiv, "Please enter a valid first name.");
      isValid = false;
    }

    if (!isValidName(lastName)) {
      displayError(errorLastNameDiv, "Please enter a valid last name.");
      isValid = false;
    }

    // Password validation for minimum and maximum length
    if (password.length < 6 || password.length > 17) {
      displayError(
        errorPasswordDiv,
        "Password must be between 6 and 17 characters."
      );
      isValid = false;
    }

    if (confirmPassword.length < 6 || confirmPassword.length > 17) {
      displayError(
        errorConfirmPasswordDiv,
        "Confirm password must be between 6 and 17 characters."
      );
      isValid = false;
    } else if (password !== confirmPassword) {
      displayError(errorConfirmPasswordDiv, "Passwords do not match.");
      isValid = false;
    }

    return isValid;
  }

  // Real-time input validation on email input change
  const emailInput = document.getElementById("email");
  if (emailInput) {
    emailInput.addEventListener("input", () => {
      const email = emailInput.value.trim();
      const errorEmailDiv = document.getElementById("err-email");

      if (email === "") {
        displayError(errorEmailDiv, "Email field cannot be empty.");
      } else if (!isValidEmail(email)) {
        displayError(errorEmailDiv, "Please enter a valid email address.");
      } else {
        displayError(errorEmailDiv, ""); // Clear the error message
      }
    });
  }

  // Function to validate if a name consists only of letters and spaces
  function isValidName(name) {
    const nameRegex = /^[a-zA-Z\s]+$/;
    return nameRegex.test(name);
  }

  // Function to enforce 6-digit limit on verification code input
  const verificationInput = document.getElementById("verification-code");
  if (verificationInput) {
    verificationInput.addEventListener("input", (event) => {
      const input = event.target;
      let value = input.value.replace(/\D/g, ""); // Remove all non-digit characters
      if (value.length > 6) {
        value = value.slice(0, 6); // Limit to 6 digits
      }
      input.value = value; // Update input value
    });
  }

  // Toggle visibility for the password field
  const passwordEyeIcon = document.getElementById("password-eyeIcon");
  const passwordField = document.getElementById("password");

  if (passwordEyeIcon && passwordField) {
    passwordEyeIcon.addEventListener("click", () => {
      if (passwordField.type === "password") {
        passwordField.type = "text";
        passwordEyeIcon.src = "/assets/images/eye-open.png";
      } else {
        passwordField.type = "password";
        passwordEyeIcon.src = "/assets/images/eye-close.png";
      }
    });
  }

  const confirmPasswordEyeIcon = document.getElementById(
    "confirm-password-eyeIcon"
  );
  const confirmPasswordField = document.getElementById("confirm-password");

  if (confirmPasswordEyeIcon && confirmPasswordField) {
    confirmPasswordEyeIcon.addEventListener("click", () => {
      if (confirmPasswordField.type === "password") {
        confirmPasswordField.type = "text";
        confirmPasswordEyeIcon.src = "/assets/images/eye-open.png";
      } else {
        confirmPasswordField.type = "password";
        confirmPasswordEyeIcon.src = "/assets/images/eye-close.png";
      }
    });
  }
});
