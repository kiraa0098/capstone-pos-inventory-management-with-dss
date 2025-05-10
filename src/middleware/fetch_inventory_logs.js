const supabase = require("../services/database");

async function FETCH_ALL_INVENTORY_LOGS() {
  try {
    const { data: logs, error } = await supabase
      .from("inventory_logs")
      .select("*")
      .order("inventory_log_created_at", { ascending: false });

    if (error) {
      console.error("Error fetching inventory logs:", error.message);
      throw new Error(
        "Failed to fetch inventory logs. Please try again later."
      );
    }

    // Format each log's creation date to 'YYYY-MM-DD'
    const formattedLogs = logs.map((log) => ({
      ...log,
      inventory_log_created_at: new Date(log.inventory_log_created_at)
        .toISOString()
        .split("T")[0],
    }));

    console.log("Formatted inventory logs:", formattedLogs);
    return formattedLogs; // Return formatted logs
  } catch (error) {
    console.error(
      "Unexpected error in FETCH_ALL_INVENTORY_LOGS:",
      error.message
    );
    return [];
  }
}

module.exports = { FETCH_ALL_INVENTORY_LOGS };
