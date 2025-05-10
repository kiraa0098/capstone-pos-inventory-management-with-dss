document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("search-input");
  const productRows = document.querySelectorAll("tbody tr");

  searchInput.addEventListener("input", () => {
    const searchValue = searchInput.value.toLowerCase().replace(/\s+/g, "");

    productRows.forEach((row) => {
      const productName = row.cells[0].innerText
        .toLowerCase()
        .replace(/\s+/g, "");

      // Check if the product name contains the search value
      if (productName.includes(searchValue)) {
        row.style.display = ""; // Show the row if it matches
      } else {
        row.style.display = "none"; // Hide the row if it doesn't match
      }
    });
  });
});
