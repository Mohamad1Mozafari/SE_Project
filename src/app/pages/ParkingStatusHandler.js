export default async function get_parking_status() {
  try {
    const response = await fetch("http://localhost:3000/api/parking_status");
    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (error) {
    console.error("Failed to fetch parking status:", error);
    return null;
  }
}
