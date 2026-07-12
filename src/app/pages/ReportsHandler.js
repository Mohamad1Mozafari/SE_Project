export async function get_report_summary({ type, period, start, end }) {
  try {
    const params = new URLSearchParams({ type, period });
    if (start) params.append("start", start);
    if (end) params.append("end", end);

    const response = await fetch(`http://localhost:3000/api/reports/summary?${params.toString()}`);
    const body = await response.json();

    if (response.ok) {
      return { ok: true, data: body };
    }
    return { ok: false, error: body.error || "Failed to generate report" };
  } catch (error) {
    console.error("Failed to fetch report summary:", error);
    return { ok: false, error: "Network error while generating report" };
  }
}

export async function download_report_csv({ period, start, end }) {
  try {
    const params = new URLSearchParams({ period });
    if (start) params.append("start", start);
    if (end) params.append("end", end);

    const response = await fetch(`http://localhost:3000/api/reports/export?${params.toString()}`);
    if (response.ok) {
      return await response.blob();
    }
    return null;
  } catch (error) {
    console.error("Failed to download CSV report:", error);
    return null;
  }
}
