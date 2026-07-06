export async function get_vehicle_info(plateNumber) {
  try {
    const response = await fetch(`http://localhost:3000/api/vehicle/${plateNumber}`);
    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (error) {
    console.error("Failed to fetch vehicle info:", error);
    return null;
  }
}

export async function get_current_pricing() {
  try {
    const response = await fetch("http://localhost:3000/api/vehicle_exit/pricing");
    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (error) {
    console.error("Failed to fetch pricing:", error);
    return null;
  }
}

export default async function vehicle_exit_handler(plateNumber) {
  try {
    const response = await fetch("http://localhost:3000/api/vehicle-exit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        plate_number: plateNumber,
      }),
    });

    if (response.ok) {
      return await response.json();
    }

    return null;
  } catch (error) {
    console.error("Vehicle exit request failed:", error);
    return null;
  }
}
