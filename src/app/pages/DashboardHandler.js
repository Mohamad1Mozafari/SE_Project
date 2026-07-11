export async function get_dashboard_stats() {
  try {
    const response = await fetch("http://localhost:3000/api/dashboard/stats");
    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error);
    return null;
  }
}

export async function get_recent_activity() {
  try {
    const response = await fetch("http://localhost:3000/api/dashboard/recent_activity");
    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (error) {
    console.error("Failed to fetch recent activity:", error);
    return null;
  }
}
