document.addEventListener("DOMContentLoaded", function () {
  const branchDivs = document.querySelectorAll(".branch-cards"); // Changed to .branch-cards

  branchDivs.forEach(function (branchDiv) {
    branchDiv.addEventListener("click", function () {
      const branchId = this.getAttribute("data-branch-id");
      console.log(branchId);
      // Redirect to branch page with branch_id parameter
      window.location.href = `/admin/branch/${branchId}`;
    });
  });
});
