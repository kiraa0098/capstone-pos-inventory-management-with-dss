document.addEventListener("DOMContentLoaded", () => {
  const selectedProducts = [];
  const elements = {
    cashButton: document.getElementById("cash-button"),
    bankTransferButton: document.getElementById("bank-transfer-button"),
    bankTransferDetails: document.getElementById("bank-transfer-details"),
    orderCart: document.getElementById("order-cart"),
    submitOrderButton: document.getElementById("submit-order-button"),
    cancelOrderButton: document.getElementById("cancel-order-button"),
    processOrderModalButton: document.getElementById(
      "process-order-modal-button"
    ),
    modal: document.getElementById("process-order-modal"),
    closeButton: document
      .getElementById("process-order-modal")
      .querySelector(".close-button"),
    discountButton: document.getElementById("discount-button"),
    discountModal: document.getElementById("discount-modal"),
    discountModalCloseButton: document
      .getElementById("discount-modal")
      .querySelector(".discount-modal-close-button"),
    productTable: document.getElementById("product-table"),
    totalPriceElement: document.getElementById("total-price"),
    paymentAmount: document.getElementById("payment-amount"),
    customerName: document.getElementById("customer-name"),
    bank: document.getElementById("bank"),
    referenceNumber: document.getElementById("reference-number"),
    errorPaymentAmount: document.getElementById("err-payment-amount"),
    errorSelectBank: document.getElementById("err-select-bank"),
    errorReferenceNumber: document.getElementById("err-reference-number"),
    customAlertContainer: document.getElementById("customAlertContainer"),
  };

  let discountApplied = false;
  let discountAmount = 0;
  let paymentMethod = "Cash";

  function toggleModal(modal, display) {
    if (display) {
      modal.style.display = "block";
      setTimeout(() => {
        modal.classList.add("show");
      }, 10);
    } else {
      modal.classList.remove("show");
      setTimeout(() => {
        modal.style.display = "none";
      }, 300);
    }
  }

  function updateOrderCart() {
    elements.orderCart.innerHTML = "";
    let totalPrice = 0;

    selectedProducts.forEach((product, index) => {
      const cartItem = document.createElement("div");
      cartItem.classList.add("product-item");
      cartItem.innerHTML = `
        <span class="deselect-product"><button class="deselect">Deselect</button></span>
        <span class="product-name" title="${product.productName}">${
        product.productName
      }</span>
        <span class="product-brand">${product.productBrand}</span>
        <span class="product-price">${product.productPrice.toFixed(2)}</span>
        <span class="total-price">${(
          product.productPrice * product.quantity
        ).toFixed(2)}</span>
        <span class="product-actions">
          <button class="minus">-</button>
          <input type="number" value="${
            product.quantity
          }" min="1" class="quantity-input">
          <button class="plus">+</button>
        </span>`;

      elements.orderCart.appendChild(cartItem);
      totalPrice += product.productPrice * product.quantity;

      const quantityInput = cartItem.querySelector(".quantity-input");
      const minusButton = cartItem.querySelector(".minus");
      const plusButton = cartItem.querySelector(".plus");
      const deselectButton = cartItem.querySelector(".deselect");
      const productTotalPriceElement = cartItem.querySelector(".total-price");

      const updateTotalPrice = () => {
        const updatedTotalPrice = (
          product.productPrice * product.quantity
        ).toFixed(2);
        productTotalPriceElement.innerText = updatedTotalPrice;
        calculateTotalPrice();
      };

      minusButton.addEventListener("click", () => {
        if (product.quantity > 1) {
          product.quantity--;
          quantityInput.value = product.quantity;
          updateTotalPrice();
        }
      });

      plusButton.addEventListener("click", () => {
        if (product.quantity < product.stock) {
          product.quantity++;
          quantityInput.value = product.quantity;
          updateTotalPrice();
        }
      });

      quantityInput.addEventListener("input", (e) => {
        const value = parseInt(e.target.value, 10);
        if (value > 0 && value <= product.stock) {
          product.quantity = value;
        } else if (value > product.stock) {
          product.quantity = product.stock;
        } else {
          product.quantity = 1;
        }
        quantityInput.value = product.quantity;
        updateTotalPrice();
      });

      deselectButton.addEventListener("click", () => {
        selectedProducts.splice(index, 1);
        updateOrderCart();
        document
          .querySelector(`tr[data-id='${product.productId}']`)
          ?.classList.remove("selected");
      });
    });

    if (selectedProducts.length === 0) {
      discountApplied = false;
      discountAmount = 0;
      elements.discountButton.innerText = "Discount";
      elements.discountButton.disabled = true;
    } else {
      elements.discountButton.disabled = false;
    }

    calculateTotalPrice();
    elements.processOrderModalButton.disabled = selectedProducts.length === 0;
    elements.discountButton.disabled = selectedProducts.length === 0;
    elements.cancelOrderButton.disabled = selectedProducts.length === 0;
  }

  function calculateTotalPrice() {
    const totalPrice = selectedProducts.reduce(
      (sum, product) => sum + product.productPrice * product.quantity,
      0
    );
    const finalPrice = Math.max(0, totalPrice - discountAmount);

    elements.totalPriceElement.innerText = `Total Price: ${finalPrice.toFixed(
      2
    )}`;
    document.getElementById(
      "discount"
    ).innerText = `Discount: ${discountAmount.toFixed(2)}`;
  }

  function getTotalPrice() {
    return selectedProducts.reduce(
      (sum, product) => sum + product.productPrice * product.quantity,
      0
    );
  }

  function showCustomAlertMessage(message, type = "success") {
    elements.customAlertContainer.innerHTML = `<div class="custom-alert">${message}</div>`;
    // Add error class based on type
    if (type === "error") {
      elements.customAlertContainer.classList.add("error");
    } else {
      elements.customAlertContainer.classList.remove("error");
    }
    elements.customAlertContainer.style.display = "block";
    elements.customAlertContainer.style.opacity = 1;
    setTimeout(() => {
      elements.customAlertContainer.style.opacity = 0;
      setTimeout(() => {
        elements.customAlertContainer.style.display = "none";
      }, 500);
    }, 3000);
  }

  function updatePaymentMethod() {
    // Implement the logic to update payment method here
    console.log(`Payment method updated to: ${paymentMethod}`);
  }

  let isProcessing = false; // Initialize the flag

  function handleOrderSubmit() {
    if (isProcessing) return; // Prevent multiple submissions

    isProcessing = true; // Set the flag to true to lock re-entry
    elements.submitOrderButton.disabled = true; // Disable the button

    elements.errorPaymentAmount.innerText = "";
    elements.errorSelectBank.innerText = "";
    elements.errorReferenceNumber.innerText = "";

    const paymentAmount = elements.paymentAmount.value.trim();
    const customerName = elements.customerName.value.trim();
    const bank = elements.bank.value.trim();
    const referenceNumber = elements.referenceNumber.value.trim();

    let isValid = true;

    if (
      paymentAmount === "" ||
      isNaN(paymentAmount) ||
      parseFloat(paymentAmount) <= 0
    ) {
      elements.errorPaymentAmount.innerText =
        "Payment amount must be a valid number.";
      isValid = false;
    }

    if (paymentMethod === "Bank Transfer") {
      if (bank === "") {
        elements.errorSelectBank.innerText = "Bank selection is required.";
        isValid = false;
      }
      if (referenceNumber === "") {
        elements.errorReferenceNumber.innerText =
          "Reference number is required.";
        isValid = false;
      }
    }

    const totalPrice = getTotalPrice() - discountAmount;

    if (parseFloat(paymentAmount) < totalPrice) {
      elements.errorPaymentAmount.innerText =
        "Payment amount is not sufficient to cover the total price.";
      isValid = false;
    }

    if (isValid) {
      const orderData = {
        products: selectedProducts,
        paymentMethod,
        paymentAmount: parseFloat(paymentAmount),
        customerName,
        bank,
        referenceNumber,
        totalPrice: Math.max(0, totalPrice),
        discountAmount: discountAmount || 0,
      };

      fetch("/order/process-sale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            localStorage.setItem("showCustomAlert", "true");
            localStorage.setItem("printerStatus", data.printResult);
            selectedProducts.length = 0;
            updateOrderCart();
            location.reload();
          } else {
            if (data.message === "Error processing order: Insufficient stock") {
              localStorage.setItem("alertMessage", "Insufficient stock.");
              location.reload(); // Refresh the page immediately
            } else {
              showCustomAlertMessage(
                "Unable to process your order. Please check your internet connection.",
                "error"
              );
            }

            elements.submitOrderButton.disabled = false;
          }
        })
        .catch((error) => {
          console.error("Error:", error);
          showCustomAlertMessage(
            "Unable to process your order. Please check your internet connection.",
            "error"
          );
          isProcessing = false; // Reset flag on error
          elements.submitOrderButton.disabled = false;
        });
    } else {
      isProcessing = false; // Reset flag if form is invalid
      elements.submitOrderButton.disabled = false;
    }
  }

  function initializeEventListeners() {
    elements.discountButton.addEventListener("click", () => {
      if (selectedProducts.length === 0) return;
      if (discountApplied) {
        discountApplied = false;
        discountAmount = 0;
        updateOrderCart();
        elements.discountButton.innerText = "Discount";
      } else {
        toggleModal(elements.discountModal, true);
      }
    });

    elements.discountModalCloseButton.addEventListener("click", () =>
      toggleModal(elements.discountModal, false)
    );

    window.addEventListener("click", (event) => {
      if (event.target === elements.discountModal) {
        toggleModal(elements.discountModal, false);
      }
      if (event.target === elements.modal) {
        toggleModal(elements.modal, false);
      }
    });

    document.getElementById("apply-discount").addEventListener("click", () => {
      if (selectedProducts.length === 0) {
        alert("No products selected. Please add products to apply a discount.");
        return;
      }
      const discountInput = document.getElementById("discount-amount");
      const discount = parseFloat(discountInput.value) || 0;
      const totalPrice = getTotalPrice();
      discountAmount = Math.min(discount, totalPrice);
      discountApplied = discountAmount > 0;
      toggleModal(elements.discountModal, false);
      updateOrderCart();
      elements.discountButton.innerText = "Cancel Discount";
    });

    elements.processOrderModalButton.addEventListener("click", () =>
      toggleModal(elements.modal, true)
    );
    elements.closeButton.addEventListener("click", () =>
      toggleModal(elements.modal, false)
    );

    elements.submitOrderButton.addEventListener("click", handleOrderSubmit);

    elements.cancelOrderButton.addEventListener("click", () => {
      selectedProducts.length = 0;
      updateOrderCart();
      elements.productTable
        .querySelectorAll("tbody tr.selected")
        .forEach((row) => row.classList.remove("selected"));
    });

    elements.cashButton.addEventListener("click", () => {
      paymentMethod = "Cash";
      updatePaymentMethod();
      elements.bankTransferDetails.style.display = "none";
      elements.cashButton.classList.add("active");
      elements.bankTransferButton.classList.remove("active");
    });

    elements.bankTransferButton.addEventListener("click", () => {
      paymentMethod = "Bank Transfer";
      updatePaymentMethod();
      elements.bankTransferDetails.style.display = "block";
      elements.bankTransferButton.classList.add("active");
      elements.cashButton.classList.remove("active");
    });

    const productRows = elements.productTable.querySelectorAll("tbody tr");
    productRows.forEach((row) => {
      const productStock = parseInt(row.dataset.stock);
      const productId = row.dataset.id;
      const productCategory = row.dataset.category;
      const productCategoryId = row.dataset.category_id;
      const cells = row.cells;

      if (productStock === 0) {
        row.classList.add("out-of-stock", "disabled-row");
        row.style.pointerEvents = "none";
      }

      row.addEventListener("click", () => {
        if (productStock === 0) return;

        const product = {
          productId,
          productCategory,
          productCategoryId,
          productName: cells[0].innerText,
          productBrand: cells[1].innerText,
          productPrice: parseFloat(cells[2].innerText),
          quantity: 1,
          stock: productStock,
        };

        const index = selectedProducts.findIndex(
          (p) => p.productName === product.productName
        );

        if (index > -1) {
          selectedProducts.splice(index, 1);
          row.classList.remove("selected");
        } else {
          selectedProducts.push(product);
          row.classList.add("selected");
        }

        updateOrderCart();
      });
    });

    const alertMessage = localStorage.getItem("alertMessage");
    if (alertMessage) {
      showCustomAlertMessage(alertMessage, "error");
      localStorage.removeItem("alertMessage"); // Clear the alert message
    }

    const showCustomAlert = localStorage.getItem("showCustomAlert");
    const printerStatus = localStorage.getItem("printerStatus");
    if (showCustomAlert === "true") {
      localStorage.removeItem("showCustomAlert");
      const alertMessage =
        printerStatus === "Printer not available."
          ? "Printer not available. Order processed but receipt couldn't be printed."
          : "Order processed successfully!";
      showCustomAlertMessage(alertMessage);
      localStorage.removeItem("printerStatus");
    }
  }

  initializeEventListeners();
});
