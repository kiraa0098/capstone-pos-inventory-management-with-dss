const { GET_BRANCH_ADDRESS } = require("../middleware/fetch_branches");

const formatBranchAddress = async (branchId) => {
  const address = await GET_BRANCH_ADDRESS(branchId);
  const addressLines = [
    address.loc_house_number,
    address.loc_building,
    address.loc_street_name,
    address.loc_baranggay,
    address.loc_city,
    address.loc_province,
  ]
    .filter((line) => line)
    .join(", ");

  return addressLines;
};

module.exports = { formatBranchAddress };
