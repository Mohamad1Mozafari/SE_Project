export async function get_available_spots() {
  try {
    const response = await fetch("http://localhost:3000/api/vehicle_entry/available_spots");
    if (response.ok) {
      return await response.json();
    }
    return [];
  } catch (error) {
    console.error("Failed to fetch available spots:", error);
    return [];
  }
}

export default async function vehicle_entry_handler(plateNumber, parkingSpot) {
  try {
    const response = await fetch("http://localhost:3000/api/vehicle_entry", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        plate_number: plateNumber,
        location: parkingSpot,
      }),
    });

    if (response.ok) {
      const result = await response.json();
      if (result && result.success) {
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error("Vehicle entry request failed:", error);
    return false;
  }
}