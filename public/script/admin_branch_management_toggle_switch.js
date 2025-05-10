document.addEventListener("DOMContentLoaded", function () {
  const toggleSwitch = document.getElementById("branch-status");

  // Extract branchId from the URL
  const branchId = window.location.pathname.split("/").pop(); // Extract the branchId from the URL

  toggleSwitch.addEventListener("change", async function () {
    const branch_status = toggleSwitch.checked; // Get the new status from the checkbox

    try {
      const response = await fetch("/admin/branch/update-branch-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: branchId, branch_status }),
      });

      const result = await response.json();

      // Check if the status update was successful
      if (result.success) {
        window.location.reload(); // Reload the page if successful
      }
    } catch (error) {
      console.error("Error:", error);
    }
  });
});
