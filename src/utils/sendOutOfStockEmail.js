const nodemailer = require("nodemailer");

// Send an out-of-stock notification to the admin
async function sendOutOfStockEmail(productName, branchName, email) {
  try {
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: "gnwcomputercenter78@gmail.com",
        pass: "coaz aqsi qwik trtn", // Note: This password should be stored securely
      },
    });

    const info = await transporter.sendMail({
      from: "gnwcomputercenter78@gmail.com",
      to: email, // Replace with the admin's email
      subject: `Out of Stock Alert: ${productName}`,
      text: `The product "${productName}" is out of stock at branch "${branchName}". Please check the inventory and restock as needed.`,
    });

    console.log("Out-of-stock alert sent for product:", productName);
  } catch (error) {
    console.error("[sendOutOfStockEmail] Error sending email:", error);
    throw error;
  }
}

module.exports = { sendOutOfStockEmail };
