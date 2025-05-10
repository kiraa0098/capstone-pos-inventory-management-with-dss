async function checkConnectivity() {
  try {
    const response = await fetch("/check-connectivity", { method: "GET" });
    return response.ok;
  } catch {
    return false;
  }
}
