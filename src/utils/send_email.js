const nodemailer = require("nodemailer");

const { GENERATE_VERIFICATION_CODE } = require("./code_generator");

//TODO: maybe a validation of "if email is non-existent recipient"
async function SEND_VERIFICATION_CODE(email) {
  try {
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: "gnwcomputercenter78@gmail.com",
        pass: "coaz aqsi qwik trtn",
      },
    });

    const verificationCode = GENERATE_VERIFICATION_CODE();

    const info = await transporter.sendMail({
      from: "gnwcomputercenter78@gmail.com",
      to: email,
      subject: "Verification Code",
      text: `Your verification code is: ${verificationCode}`,
    });

    console.log("Code sent to", email);
    return verificationCode;
  } catch (error) {
    console.error("[SEND_VERIFICATION_CODE] Unexpected error:", error);
    throw error;
  }
}

module.exports = { SEND_VERIFICATION_CODE };
