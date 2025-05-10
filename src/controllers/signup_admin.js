const bcrypt = require("bcrypt");
const supabase = require("../services/database"); // Adjust path as per your directory structure

async function SIGNUP_ADMIN(email, firstName, lastName, password) {
  try {
    // Hash the password with bcrypt before storing it in the database
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new admin into the Supabase database
    const { data, error } = await supabase.from("admin").insert([
      {
        admin_email: email,
        admin_first_name: firstName,
        admin_last_name: lastName,
        admin_password: hashedPassword,
      },
    ]);

    // Handle any errors that occur during the database operation
    if (error) {
      throw new Error(error.message);
    }

    console.log("Success: " + data);
    return data; // Return the inserted data on successful signup
  } catch (error) {
    console.error("[SIGNUP_ADMIN] Error setting up admin:", error.message);
    throw new Error("Failed to set up admin.");
  }
}

module.exports = {
  SIGNUP_ADMIN,
};
