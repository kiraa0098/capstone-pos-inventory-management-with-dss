document.addEventListener("DOMContentLoaded", () => {
  const yearSelect = document.getElementById("yearSelect");
  const branchSelect = document.getElementById("salesBranchSelect");
  const totalSalesElement = document.getElementById("totalSales");
  const netRevenueElement = document.getElementById("netRevenue");
  const chartCanvas = document.getElementById("simpleBarChart");
  let chartInstance = null;

  // Create a placeholder chart
  const createPlaceholderChart = () => {
    chartInstance = new Chart(chartCanvas, {
      type: "bar",
      data: {
        labels: [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ],
        datasets: [
          {
            label: "Monthly Sales",
            data: Array(12).fill(0), // Placeholder data
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: { beginAtZero: true },
        },
      },
    });
  };

  const fetchAvailableBranches = async () => {
    try {
      const response = await fetch("/api/available-branches"); // Update to the correct endpoint
      const data = await response.json();

      // Check if the data is an array of branch objects
      if (!Array.isArray(data)) {
        throw new Error("Expected an array of branch objects");
      }

      // Populate the dropdown with "All Branches" as the first option
      branchSelect.innerHTML =
        `<option value="all" selected>All Branches</option>` + // "All Branches" option
        data
          .map((branch) => `<option value="${branch}">${branch}</option>`)
          .join("");
    } catch (error) {
      console.error("Error fetching available branches:", error);
    }
  };

  const fetchAvailableYears = async () => {
    try {
      const response = await fetch("/api/available-years");
      const years = await response.json();

      // Populate the dropdown with years
      yearSelect.innerHTML =
        `<option value="" disabled>Select Year</option>` +
        years
          .map((year) => `<option value="${year}">${year}</option>`)
          .join("");

      // Automatically select the latest year
      if (years.length > 0) {
        yearSelect.value = years[years.length - 1]; // Set to the latest year
        await updateSalesAndChart(yearSelect.value); // Fetch sales data and update chart
      }
    } catch (error) {
      console.error("Error fetching available years:", error);
    }
  };

  const fetchSalesData = async (year, branch = "all") => {
    try {
      const response = await fetch(
        `/api/sales-data?year=${year}&branch=${branch}`
      );
      const { monthlySales, monthlyCosts, netRevenue } = await response.json(); // Get all three: sales, costs, and net revenue
      return { monthlySales, monthlyCosts, netRevenue }; // Return all data
    } catch (error) {
      console.error("Error fetching sales data:", error);
      return {
        monthlySales: Array(12).fill(0),
        monthlyCosts: Array(12).fill(0),
        netRevenue: Array(12).fill(0),
      }; // Return empty data on error
    }
  };

  const updateChart = (monthlySales, monthlyCosts, netRevenue) => {
    if (chartInstance) {
      chartInstance.destroy();
    }

    chartInstance = new Chart(chartCanvas, {
      type: "bar",
      data: {
        labels: [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ],
        datasets: [
          {
            label: "Monthly Sales",
            data: monthlySales,
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
          },
          {
            label: "Monthly Costs",
            data: monthlyCosts,
            backgroundColor: "rgba(255, 159, 64, 0.2)", // Choose a different color for costs
            borderColor: "rgba(255, 159, 64, 1)",
            borderWidth: 1,
          },
          {
            label: "Net Revenue",
            data: netRevenue,
            backgroundColor: "rgba(255, 99, 132, 0.2)", // You can choose a different color
            borderColor: "rgba(255, 99, 132, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: { y: { beginAtZero: true } },
      },
    });
  };

  const fetchBranchPerformance = async (year) => {
    try {
      const response = await fetch(`/api/branch-performance?year=${year}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching branch performance data:", error);
      return { branchNames: [], branchData: [] };
    }
  };

  const createBranchPlaceholderChart = () => {
    const ctx = document.getElementById("branchPieChart").getContext("2d");
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.font = "16px Arial";
    ctx.fillStyle = "#000";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const centerX = ctx.canvas.width / 2;
    const centerY = ctx.canvas.height / 2;
    ctx.fillText("No data available for selected year.", centerX, centerY);
  };

  const renderBranchPieChart = async (year) => {
    const { branchNames, branchData } = await fetchBranchPerformance(year);
    const ctx = document.getElementById("branchPieChart").getContext("2d");

    if (window.branchPieChart instanceof Chart) {
      window.branchPieChart.destroy();
    }

    if (branchNames.length === 0 || branchData.length === 0) {
      createBranchPlaceholderChart(); // Show placeholder if no data
      return;
    }

    window.branchPieChart = new Chart(ctx, {
      type: "pie",
      data: {
        labels: branchNames,
        datasets: [
          {
            data: branchData,
            backgroundColor: [
              "rgba(255, 99, 132, 0.2)",
              "rgba(54, 162, 235, 0.2)",
              "rgba(255, 206, 86, 0.2)",
              "rgba(75, 192, 192, 0.2)",
            ],
            borderColor: [
              "rgba(255, 99, 132, 1)",
              "rgba(54, 162, 235, 1)",
              "rgba(255, 206, 86, 1)",
              "rgba(75, 192, 192, 1)",
            ],
            borderWidth: 1,
          },
        ],
      },
      options: { responsive: true },
    });
  };

  const fetchTopProducts = async (year) => {
    try {
      const response = await fetch(`/api/top-products?year=${year}`);
      const topProducts = await response.json();
      return topProducts;
    } catch (error) {
      console.error("Error fetching top products data:", error);
      return []; // Return an empty array on error
    }
  };

  const updateTopProductsTable = async (year) => {
    const topProducts = await fetchTopProducts(year);
    const tbody = document.getElementById("topProductsBody");
    tbody.innerHTML = ""; // Clear existing data

    topProducts.forEach((product) => {
      const row = document.createElement("tr");
      row.innerHTML = `<td>${product.sold_product_name}</td><td>${product.total_quantity}</td>`;
      tbody.appendChild(row);
    });
  };

  const updateSalesAndChart = async (selectedYear, selectedBranch) => {
    // Fetch sales data for the selected year and branch
    const { monthlySales, netRevenue, monthlyCosts } = await fetchSalesData(
      selectedYear,
      selectedBranch
    );

    // Calculate total sales and total net revenue
    const totalSales = monthlySales.reduce((acc, curr) => acc + curr, 0);
    const totalNetRevenue = netRevenue.reduce((acc, curr) => acc + curr, 0);

    // Update UI elements with the fetched data
    totalSalesElement.textContent = `₱${totalSales.toLocaleString()}`; // Format with commas
    netRevenueElement.textContent = `₱${totalNetRevenue.toLocaleString()}`;

    // Update the chart with the monthly sales data
    updateChart(monthlySales, monthlyCosts, netRevenue);

    // Render branch performance chart
    await renderBranchPieChart(selectedYear); // Update the pie chart for the selected year

    // Update top products table
    await updateTopProductsTable(selectedYear); // Fetch and display top products
  };

  yearSelect.addEventListener("change", async () => {
    const selectedYear = yearSelect.value;
    const selectedBranch = branchSelect.value; // Get selected branch value
    if (selectedYear) {
      await updateSalesAndChart(selectedYear, selectedBranch); // Pass both year and branch
    }
  });

  branchSelect.addEventListener("change", async () => {
    const selectedBranch = branchSelect.value; // Get selected branch value
    const selectedYear = yearSelect.value; // Get selected year value
    if (selectedYear) {
      await updateSalesAndChart(selectedYear, selectedBranch); // Pass both year and branch
    }
  });

  createPlaceholderChart(); // Initialize with placeholder chart
  fetchAvailableYears(); // Fetch years and possibly update the chart
  fetchAvailableBranches();
});

document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("exportModal");
  const openModalBtn = document.getElementById("openExportModalBtn");
  const closeBtn = document.getElementById("exportClose");
  const exportBtn = document.getElementById("exportBtn");
  const yearSelect = document.getElementById("exportYearSelect");
  const monthSelect = document.getElementById("exportMonthSelect");
  const branchSelect = document.getElementById("branchSelect");

  // Open the modal when the button is clicked
  openModalBtn.addEventListener("click", () => {
    modal.style.display = "block";
    populateYearDropdown();
    populateBranchDropdown();
  });

  // Close the modal when the 'x' button is clicked
  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  // Close the modal when clicking outside
  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });

  // Fetch available years and populate the year dropdown
  const populateYearDropdown = async () => {
    try {
      const response = await fetch("/api/available-years");
      const years = await response.json();
      yearSelect.innerHTML =
        `<option value="" disabled>Select Year</option>` +
        years
          .map((year) => `<option value="${year}">${year}</option>`)
          .join("");
    } catch (error) {
      console.error("Error fetching available years:", error);
    }
  };

  const populateBranchDropdown = async () => {
    try {
      const response = await fetch("/api/available-branches"); // Update to the correct endpoint
      const data = await response.json();
      console.log(data); // Log the data to see its structure

      // Check if the data is an array
      if (!Array.isArray(data)) {
        throw new Error("Expected an array of branch names");
      }

      // Populate the dropdown using the strings directly
      branchSelect.innerHTML =
        `<option value="" disabled>Select Branch</option>` +
        data
          .map((branch) => `<option value="${branch}">${branch}</option>`)
          .join("");
    } catch (error) {
      console.error("Error fetching available branches:", error);
    }
  };

  exportBtn.addEventListener("click", async () => {
    const selectedYear = yearSelect.value;
    const selectedMonth =
      monthSelect.value === "all" ? "all" : monthSelect.value;
    const selectedBranch = branchSelect.value;

    // Validate if year and branch are selected
    if (!selectedYear || !selectedBranch) {
      alert("Please select a year and a branch.");
      return;
    }

    try {
      // Fetch CSV data for export
      const response = await fetch(
        `/api/export-report?year=${selectedYear}&month=${selectedMonth}&branch=${selectedBranch}`
      );

      // Check if the response is OK (status 200)
      if (!response.ok) {
        throw new Error("Failed to fetch report data.");
      }

      // Retrieve the CSV content as plain text
      const csvContent = await response.text();

      // Create a downloadable link for the CSV
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `sales_report_${selectedBranch}_${selectedYear}_${selectedMonth}.csv`;

      // Trigger the download
      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      modal.style.display = "none"; // Close the modal after export
    } catch (error) {
      console.error("Error exporting report:", error);
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("logsModal");
  const openLogsModalButton = document.getElementById("openLogs");
  const closeModalButton = document.getElementById("closeLogs");
  const branchSelect = document.getElementById("logsBranchSelect");
  const yearSelect = document.getElementById("logsYearSelect");
  const monthSelect = document.getElementById("logsMonthSelect");
  const refundLogsList = document.getElementById("refundLogsList");
  const transactionLogsTable = document
    .getElementById("transaction-logs")
    .getElementsByTagName("tbody")[0]; // Transaction logs table body

  // Function to open modal
  openLogsModalButton.onclick = async function () {
    modal.style.display = "block";

    // Populate dropdowns
    await populateBranchDropdown();
    await populateYearDropdown();
    populateMonthDropdown();

    // After dropdowns are populated, fetch refund logs and transaction logs
    fetchRefundLogs();
    fetchTransactionLogs();
  };

  // Function to close modal
  closeModalButton.onclick = function () {
    modal.style.display = "none";
  };

  // Close modal if clicked outside
  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };

  // Fetch available years and populate the year dropdown
  const populateYearDropdown = async () => {
    try {
      const response = await fetch("/api/available-years");
      const years = await response.json();

      // Find the latest year
      const latestYear = years[years.length - 1];

      // Populate the dropdown and set the latest year as selected
      yearSelect.innerHTML =
        `<option value="" disabled>Select Year</option>` +
        years
          .map((year) => {
            const selected = year === latestYear ? "selected" : "";
            return `<option value="${year}" ${selected}>${year}</option>`;
          })
          .join("");
    } catch (error) {
      console.error("Error fetching available years:", error);
    }
  };

  const populateBranchDropdown = async () => {
    try {
      const response = await fetch("/api/available-branches"); // Update to the correct endpoint
      const data = await response.json();

      // Check if the data is an array
      if (!Array.isArray(data)) {
        throw new Error("Expected an array of branch names");
      }

      // Populate the dropdown using the strings directly
      branchSelect.innerHTML =
        `<option value="" disabled>Select Branch</option>` +
        data
          .map((branch) => `<option value="${branch}">${branch}</option>`)
          .join("");
    } catch (error) {
      console.error("Error fetching available branches:", error);
    }
  };

  // Populate month dropdown
  const populateMonthDropdown = () => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    // Get the current month (0-based index)
    const currentMonth = new Date().getMonth() + 1; // Adding 1 to convert to 1-based index

    monthSelect.innerHTML =
      `<option value="" disabled>Select Month</option>` +
      months
        .map((month, index) => {
          const monthIndex = index + 1;
          const selected = monthIndex === currentMonth ? "selected" : "";
          return `<option value="${monthIndex}" ${selected}>${month}</option>`;
        })
        .join("");
  };

  // Function to fetch refund logs based on selected filters
  const fetchRefundLogs = async () => {
    const year = yearSelect.value;
    const month = monthSelect.value;
    const branch = branchSelect.value;

    // Ensure all filters are selected
    if (!year || !month || !branch) {
      alert("Please select year, month, and branch.");
      return;
    }

    const monthFilter = month === "all" ? "" : month;

    try {
      const response = await fetch(
        `/api/refund-logs?year=${year}&month=${monthFilter}&branch=${branch}`
      );
      const data = await response.json();

      if (Array.isArray(data) && data.length > 0) {
        // Sorting the refund logs by refund_date (descending)
        data.sort((a, b) => new Date(b.refund_date) - new Date(a.refund_date));

        // Populate the refund logs list
        refundLogsList.innerHTML = data
          .map(
            (log) => ` 
        <tr>
          <td>${formatDate(log.refund_date)}</td> <!-- Format date here -->
          <td>${log.customer_name}</td>
          <td>${log.refund_quantity_of_products_sold}</td>
          <td>${log.refund_total_price}</td>
          <td>${log.refund_reason}</td>
          <td>${log.payment_amount}</td>
          <td>${log.payment_mode}</td>
          <td>${log.bank}</td>
          <td>${log.transaction_number}</td>
        </tr>`
          )
          .join("");
      } else {
        refundLogsList.innerHTML =
          "<tr><td colspan='9'>No refund logs found.</td></tr>";
      }
    } catch (error) {
      console.error("Error fetching refund logs:", error);
    }
  };

  // Function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString); // Parse the date string
    if (isNaN(date)) return "Invalid Date"; // Check if it's a valid date
    return date.toLocaleDateString("en-US"); // Customize format as needed
  };

  // Function to fetch transaction logs
  const fetchTransactionLogs = async () => {
    const year = yearSelect.value;
    const month = monthSelect.value;
    const branch = branchSelect.value;

    // Ensure all filters are selected
    if (!year || !month || !branch) {
      alert("Please select year, month, and branch.");
      return;
    }

    const monthFilter = month === "all" ? "" : month;

    try {
      const response = await fetch(
        `/api/transaction-logs?year=${year}&month=${monthFilter}&branch=${branch}`
      );
      const data = await response.json();

      if (Array.isArray(data) && data.length > 0) {
        // Sorting the transaction logs by transaction_date (descending)
        data.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Populate the transaction logs table
        transactionLogsTable.innerHTML = data
          .map((log) => {
            return `
            <tr>
              <td>${formatDate(log.date)}</td> <!-- Format date -->
              <td>${
                log.name || "Unknown"
              }</td> <!-- Provide default for name -->
              <td>${
                log.total_price || 0
              }</td> <!-- Provide default for total_price -->
              <td>${log.payment_mode || "Unknown"}</td>
              <td>${log.payment_amount || 0}</td>
              <td>${log.discount || 0}</td>
              <td>${log.bank || "Unknown"}</td>
              <td>${log.transaction_number || "No number"}</td>
            </tr>`;
          })
          .join("");
      } else {
        transactionLogsTable.innerHTML =
          "<tr><td colspan='8'>No transaction logs found.</td></tr>";
      }
    } catch (error) {
      console.error("Error fetching transaction logs:", error);
    }
  };

  // Trigger refund and transaction logs fetch when the user changes the filters
  yearSelect.addEventListener("change", () => {
    fetchRefundLogs();
    fetchTransactionLogs();
  });
  monthSelect.addEventListener("change", () => {
    fetchRefundLogs();
    fetchTransactionLogs();
  });
  branchSelect.addEventListener("change", () => {
    fetchRefundLogs();
    fetchTransactionLogs();
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("dailySalesModal");
  const openDailyModalButton = document.getElementById("openDailySales");
  const closeDailyModalButton = document.getElementById("closeDailySales");
  const chartCanvas = document.getElementById("dailysimpleBarChart");
  const DSalesyearSelect = document.getElementById("dailyYearSelect");
  const DSalesmonthSelect = document.getElementById("dailyMonthSelect");
  const DSalesbranchSelect = document.getElementById("dailyBranchSelect");
  let chartInstance = null;

  // Create a placeholder chart
  const createDailyPlaceholderChart = () => {
    const daysInMonth = Array.from({ length: 31 }, (_, i) => `Day ${i + 1}`);

    chartInstance = new Chart(chartCanvas, {
      type: "bar",
      data: {
        labels: daysInMonth,
        datasets: [
          {
            label: "Daily Sales",
            data: Array(31).fill(0), // Placeholder data for 31 days
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: { beginAtZero: true },
        },
      },
    });
  };

  const createDailyChart = (dailySales) => {
    if (chartInstance) {
      chartInstance.destroy(); // Destroy existing chart to avoid overlaps
    }

    const daysInMonth = Array.from({ length: 31 }, (_, i) => `Day ${i + 1}`);

    chartInstance = new Chart(chartCanvas, {
      type: "bar",
      data: {
        labels: daysInMonth,
        datasets: [
          {
            label: "Daily Sales",
            data: dailySales,
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: { beginAtZero: true },
        },
      },
    });
  };

  // Date validation function
  const isValidDate = (year, month, day) => {
    const date = new Date(year, month - 1, day); // months are 0-indexed
    return date.getDate() === day; // Returns true if the date is valid, false if invalid (e.g., 31st in November)
  };

  // Open modal and load data
  openDailyModalButton.onclick = async function () {
    modal.style.display = "block";

    // Populate dropdowns
    await populateYearDropdown();
    populateMonthDropdown();
    await populateBranchDropdown();

    // Get selected values or use defaults
    const year = DSalesyearSelect.value || new Date().getFullYear();
    const month = DSalesmonthSelect.value || new Date().getMonth() + 1;
    const branch = DSalesbranchSelect.value || "all";

    // Load daily sales data and update chart
    updateDailyChart(year, month, branch);
  };

  // Close modal function
  closeDailyModalButton.onclick = function () {
    modal.style.display = "none";
  };

  // Close modal if clicked outside
  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };

  // Fetch available years and populate the year dropdown
  const populateYearDropdown = async () => {
    try {
      const response = await fetch("/api/available-years");
      const years = await response.json();

      // Find the latest year
      const latestYear = years[years.length - 1];

      // Populate the dropdown and set the latest year as selected
      DSalesyearSelect.innerHTML =
        `<option value="" disabled>Select Year</option>` +
        years
          .map((year) => {
            const selected = year === latestYear ? "selected" : "";
            return `<option value="${year}" ${selected}>${year}</option>`;
          })
          .join("");
    } catch (error) {
      console.error("Error fetching available years:", error);
    }
  };

  // Populate month dropdown
  const populateMonthDropdown = () => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const currentMonth = new Date().getMonth() + 1; // Adding 1 to convert to 1-based index

    DSalesmonthSelect.innerHTML =
      `<option value="" disabled>Select Month</option>` +
      months
        .map((month, index) => {
          const monthIndex = index + 1;
          const selected = monthIndex === currentMonth ? "selected" : "";
          return `<option value="${monthIndex}" ${selected}>${month}</option>`;
        })
        .join("");
  };

  const populateBranchDropdown = async () => {
    try {
      const response = await fetch("/api/available-branches"); // Update to the correct endpoint
      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("Expected an array of branch names");
      }

      DSalesbranchSelect.innerHTML =
        `<option value="" disabled>Select Branch</option>` +
        `<option value="all">All</option>` +
        data
          .map((branch) => `<option value="${branch}">${branch}</option>`)
          .join("");
    } catch (error) {
      console.error("Error fetching available branches:", error);
    }
  };

  // Fetch daily sales data for the selected year, month, and branch
  const fetchDailySalesData = async (year, month, branch = "all") => {
    try {
      const response = await fetch(
        `/api/daily-sales-data?year=${year}&month=${month}&branch=${branch}`
      );
      const { dailySales } = await response.json(); // Expect daily sales data from the API
      return dailySales; // Return the fetched data
    } catch (error) {
      console.error("Error fetching daily sales data:", error);
      return Array(31).fill(0); // Return placeholder data for 31 days on error
    }
  };

  // Update chart when year, month, or branch is selected
  const updateDailyChart = async (year, month, branch) => {
    const daysInMonth = new Date(year, month, 0).getDate(); // Get the number of days in the selected month
    const isValid = isValidDate(year, month, daysInMonth);
    if (!isValid) {
      alert("Invalid date. Please select a valid date.");
      return; // Stop if the date is invalid
    }

    // Fetch and display daily sales data
    const dailySales = await fetchDailySalesData(year, month, branch);
    createDailyChart(dailySales); // Create the chart with the fetched data
  };

  // Event listeners for dropdown changes
  DSalesyearSelect.addEventListener("change", () => {
    const year = DSalesyearSelect.value;
    const month = DSalesmonthSelect.value;
    const branch = DSalesbranchSelect.value || "all";
    updateDailyChart(year, month, branch);
  });

  DSalesmonthSelect.addEventListener("change", () => {
    const year = DSalesyearSelect.value;
    const month = DSalesmonthSelect.value;
    const branch = DSalesbranchSelect.value || "all";
    updateDailyChart(year, month, branch);
  });

  DSalesbranchSelect.addEventListener("change", () => {
    const year = DSalesyearSelect.value;
    const month = DSalesmonthSelect.value;
    const branch = DSalesbranchSelect.value || "all";
    updateDailyChart(year, month, branch);
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("weeklySalesModal");
  const openWeeklyModalButton = document.getElementById("openWeeklySales");
  const closeWeeklyModalButton = document.getElementById("closeWeeklySales");
  const chartCanvas = document.getElementById("weeklysimpleBarChart");
  const weeklyYearSelect = document.getElementById("weeklyYearSelect");
  const weeklyMonthSelect = document.getElementById("weeklyMonthSelect");
  const weeklyBranchSelect = document.getElementById("weeklyBranchSelect");
  let chartInstance = null;

  // Create a placeholder chart
  const createWeeklyPlaceholderChart = () => {
    const weeksInMonth = Array.from({ length: 5 }, (_, i) => `Week ${i + 1}`);

    chartInstance = new Chart(chartCanvas, {
      type: "bar",
      data: {
        labels: weeksInMonth,
        datasets: [
          {
            label: "Weekly Sales",
            data: Array(5).fill(0), // Placeholder data for 5 weeks
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: { beginAtZero: true },
        },
      },
    });
  };

  const createWeeklyChart = (weeklySales) => {
    if (chartInstance) {
      chartInstance.destroy(); // Destroy existing chart to avoid overlaps
    }

    const weeksInMonth = Array.from({ length: 5 }, (_, i) => `Week ${i + 1}`);

    chartInstance = new Chart(chartCanvas, {
      type: "bar",
      data: {
        labels: weeksInMonth,
        datasets: [
          {
            label: "Weekly Sales",
            data: weeklySales,
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: { beginAtZero: true },
        },
      },
    });
  };

  // Open modal and load data
  openWeeklyModalButton.onclick = async function () {
    modal.style.display = "block";

    // Populate dropdowns
    await populateWeeklyYearDropdown();
    populateWeeklyMonthDropdown();
    await populateWeeklyBranchDropdown();

    // Get selected values or use defaults
    const year = weeklyYearSelect.value || new Date().getFullYear();
    const month = weeklyMonthSelect.value || new Date().getMonth() + 1;
    const branch = weeklyBranchSelect.value || "all";

    // Load weekly sales data and update chart
    updateWeeklyChart(year, month, branch);
  };

  // Close modal function
  closeWeeklyModalButton.onclick = function () {
    modal.style.display = "none";
  };

  // Close modal if clicked outside
  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };

  // Fetch available years and populate the year dropdown
  const populateWeeklyYearDropdown = async () => {
    try {
      const response = await fetch("/api/available-years");
      const years = await response.json();

      // Find the latest year
      const latestYear = years[years.length - 1];

      // Populate the dropdown and set the latest year as selected
      weeklyYearSelect.innerHTML =
        `<option value="" disabled>Select Year</option>` +
        years
          .map((year) => {
            const selected = year === latestYear ? "selected" : "";
            return `<option value="${year}" ${selected}>${year}</option>`;
          })
          .join("");
    } catch (error) {
      console.error("Error fetching available years:", error);
    }
  };

  // Populate month dropdown
  const populateWeeklyMonthDropdown = () => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const currentMonth = new Date().getMonth() + 1; // Adding 1 to convert to 1-based index

    weeklyMonthSelect.innerHTML =
      `<option value="" disabled>Select Month</option>` +
      months
        .map((month, index) => {
          const monthIndex = index + 1;
          const selected = monthIndex === currentMonth ? "selected" : "";
          return `<option value="${monthIndex}" ${selected}>${month}</option>`;
        })
        .join("");
  };

  const populateWeeklyBranchDropdown = async () => {
    try {
      const response = await fetch("/api/available-branches"); // Update to the correct endpoint
      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("Expected an array of branch names");
      }

      weeklyBranchSelect.innerHTML =
        `<option value="" disabled>Select Branch</option>` +
        `<option value="all">All</option>` +
        data
          .map((branch) => `<option value="${branch}">${branch}</option>`)
          .join("");
    } catch (error) {
      console.error("Error fetching available branches:", error);
    }
  };

  // Fetch weekly sales data for the selected year, month, and branch
  const fetchWeeklySalesData = async (year, month, branch = "all") => {
    try {
      const response = await fetch(
        `/api/weekly-sales-data?year=${year}&month=${month}&branch=${branch}`
      );
      const { weeklySales } = await response.json(); // Expect weekly sales data from the API
      return weeklySales; // Return the fetched data
    } catch (error) {
      console.error("Error fetching weekly sales data:", error);
      return Array(5).fill(0); // Return placeholder data for 5 weeks on error
    }
  };

  // Update chart when year, month, or branch is selected
  const updateWeeklyChart = async (year, month, branch) => {
    const weeksInMonth = Math.ceil(new Date(year, month, 0).getDate() / 7); // Calculate number of weeks in the month
    const weeklySales = await fetchWeeklySalesData(year, month, branch);
    createWeeklyChart(weeklySales); // Create the chart with the fetched data
  };

  // Event listeners for dropdown changes
  weeklyYearSelect.addEventListener("change", () => {
    const year = weeklyYearSelect.value;
    const month = weeklyMonthSelect.value;
    const branch = weeklyBranchSelect.value || "all";
    updateWeeklyChart(year, month, branch);
  });

  weeklyMonthSelect.addEventListener("change", () => {
    const year = weeklyYearSelect.value;
    const month = weeklyMonthSelect.value;
    const branch = weeklyBranchSelect.value || "all";
    updateWeeklyChart(year, month, branch);
  });

  weeklyBranchSelect.addEventListener("change", () => {
    const year = weeklyYearSelect.value;
    const month = weeklyMonthSelect.value;
    const branch = weeklyBranchSelect.value || "all";
    updateWeeklyChart(year, month, branch);
  });
});
