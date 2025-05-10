function GENERATE_VERIFICATION_CODE() {
  const code = Math.floor(100000 + Math.random() * 900000).toString(); // Generates a 6-digit code
  return code;
}

module.exports = { GENERATE_VERIFICATION_CODE };
