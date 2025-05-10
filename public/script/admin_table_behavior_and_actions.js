document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("searchInput");
  const branchFilter = document.getElementById("branchFilter");
  const stockSort = document.getElementById("stockSort");
  const categorySort = document.getElementById("categorySort");
  const filterButton = document.getElementById("filterButton");
  const productTable = document.getElementById("productTable");
  const suppplierSort = document.getElementById("supplierSort");
  // Apply color indicators based on stock levels
  function applyColorIndicators() {
    const rows = productTable.querySelectorAll("tbody tr");
    rows.forEach((row) => {
      const stockCell = row.querySelector("td:nth-child(7)"); // Stock column
      const indicator = row.querySelector(".color-indicator");
      const stock = parseInt(stockCell?.textContent || "0", 10);

      if (!indicator) return;

      indicator.classList.remove("green", "orange", "red"); // Reset indicator

      if (stock > 5) {
        indicator.classList.add("green");
      } else if (stock > 0) {
        indicator.classList.add("orange");
      } else {
        indicator.classList.add("red");
      }
    });
  }

  // Filter products based on branch and search input
  function filterProducts() {
    const searchQuery = searchInput.value.toLowerCase();
    const selectedBranch = branchFilter.value;
    const selectedCategory = categorySort.value;
    const selectedSupplier = suppplierSort.value;
    const rows = Array.from(productTable.querySelectorAll("tbody tr"));

    rows.forEach((row) => {
      const productName =
        row
          .querySelector(".product-name .marquee")
          ?.textContent.toLowerCase() || "";
      const branchName =
        row.querySelector("td:nth-child(3)")?.textContent || "";
      const categoryName =
        row.querySelector("td:nth-child(4)")?.textContent || "";
      const supplierName =
        row.querySelector("td:nth-child(5)")?.textContent || "";
      const matchesSearch = productName.includes(searchQuery);
      const matchesBranch =
        selectedBranch === "all" || branchName === selectedBranch;
      const matchesCategory =
        selectedCategory === "all" ||
        (selectedCategory === "undefined" && !categoryName) || // Check for undefined category
        categoryName === selectedCategory;
      const matchesSupplier =
        selectedSupplier === "all" || supplierName === selectedSupplier;

      // Show or hide row based on filter criteria
      row.style.display =
        matchesSearch && matchesBranch && matchesCategory && matchesSupplier
          ? ""
          : "none";
    });
  }

  // Sort filtered products by stock level
  function sortProducts() {
    const sortOption = stockSort.value;

    // Select only rows that are currently visible (not hidden by filtering)
    const rows = Array.from(productTable.querySelectorAll("tbody tr")).filter(
      (row) => row.style.display !== "none"
    );

    if (sortOption === "all") {
      // Sort alphabetically by product name
      rows.sort((a, b) => {
        const nameA =
          a
            .querySelector(".product-name .marquee")
            ?.textContent.toLowerCase() || "";
        const nameB =
          b
            .querySelector(".product-name .marquee")
            ?.textContent.toLowerCase() || "";
        return nameA.localeCompare(nameB);
      });
    } else {
      // Sort by stock level in selected order
      rows.sort((a, b) => {
        const stockA = parseInt(
          a.querySelector("td:nth-child(7)")?.textContent || "0",
          10
        );
        const stockB = parseInt(
          b.querySelector("td:nth-child(7)")?.textContent || "0",
          10
        );
        return sortOption === "lowToHigh" ? stockA - stockB : stockB - stockA;
      });
    }

    const tbody = productTable.querySelector("tbody");
    rows.forEach((row) => tbody.appendChild(row)); // Append sorted rows back to tbody
  }

  // Combined filter and sort function, triggered by the filter button
  function filterAndSortProducts() {
    filterProducts(); // Apply search and branch filtering
    sortProducts(); // Apply stock sorting on filtered rows
    applyColorIndicators(); // Apply color indicators to sorted and filtered rows
  }

  // Event listeners
  filterButton.addEventListener("click", filterAndSortProducts); // Trigger filter & sort on button click
  applyColorIndicators(); // Initial color application for all rows
});
