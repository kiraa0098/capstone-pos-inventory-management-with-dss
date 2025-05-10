// printer.js
const escpos = require("escpos");
escpos.USB = require("escpos-usb");
const { formatBranchAddress } = require("../utils/format_branch_address");

let device;
let printer;
const getCurrentDateTime = () => {
  const now = new Date();
  const options = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  };
  return now.toLocaleString("en-US", options).replace(",", "");
};

const MAX_WIDTH = 32;

const centerText = (text) => {
  const spaces = Math.max(0, Math.floor((MAX_WIDTH - text.length) / 2));
  return " ".repeat(spaces) + text;
};

const initializePrinter = () => {
  device = new escpos.USB();
  printer = new escpos.Printer(device);
};
const checkPrinterConnection = () => {
  return new Promise((resolve, reject) => {
    device.open((err) => {
      if (err) {
        return reject("Printer not detected or unavailable: " + err.message);
      }
      device.close(() => resolve(true));
    });
  });
};

// Function to calculate the change
const calculateChange = (totalPrice, paymentAmount) => {
  return paymentAmount - totalPrice;
};

const PRINT_RECEIPT = async (
  selectedProducts,
  paymentAmount,
  customerName,
  paymentMethod,
  bank,
  referenceNumber,
  totalPrice,
  branchId,
  branchName
) => {
  try {
    let formattedAddress;

    try {
      formattedAddress = await formatBranchAddress(branchId);
    } catch (error) {
      // If formatBranchAddress fails, throw a network error
      throw new Error("Network error");
    }

    if (!formattedAddress) {
      throw new Error("Failed to fetch branch address.");
    }

    initializePrinter();
    await checkPrinterConnection();

    // Open the device within a Promise
    return new Promise((resolve, reject) => {
      device.open((err) => {
        if (err) {
          return reject("Failed to open USB device: " + err.message);
        }

        try {
          printer
            .text(centerText("GNW Computer Center"))
            .text(centerText(`${branchName} Branch`))
            .text(centerText(formattedAddress)) // Display formatted address
            .text(centerText(`${getCurrentDateTime()}`))
            .text("================================")
            .text(`Customer Name: ${customerName}`)
            .text(`Payment Method: ${paymentMethod}`)
            .text("--------------------------------");

          if (paymentMethod.toLowerCase() === "bank transfer") {
            printer
              .text(`Bank: ${bank}`)
              .text(`Reference Number: ${referenceNumber}`)
              .text("--------------------------------");
          }

          selectedProducts.forEach((product) => {
            printer
              .text(`Product Name: ${product.productName}`)
              .text(`Price: ${product.productPrice.toFixed(2)}`)
              .text(`Quantity: ${product.quantity}`)
              .text(
                `Subtotal: ${(product.productPrice * product.quantity).toFixed(
                  2
                )}`
              )
              .text("--------------------------------");
          });

          const change = calculateChange(totalPrice, paymentAmount);

          printer
            .text(`Payment Amount: ${paymentAmount.toFixed(2)}`)
            .text(`Total: ${totalPrice.toFixed(2)}`)
            .text(`Change: ${change.toFixed(2)}`) // Display change
            .text("================================")
            .text(centerText("This will serve as your official receipt"))

          printer.cut().close();

          resolve({ success: true, message: "Receipt printed successfully" });
        } catch (error) {
          reject("Failed to print receipt: " + error.message);
        }
      });
    });
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = { PRINT_RECEIPT };
