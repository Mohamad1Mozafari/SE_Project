export async function Create_shift(usernames, time, date) {
    const response = await fetch("http://localhost:3000/api/shift_management/Create_shift", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usernames, time, date })
    });
    return await response.json(); 
}

export async function Operators_load() {
    const response = await fetch("http://localhost:3000/api/shift_management/Operators", {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    });
    return await response.json();
}

export async function Morning_shift_load() { 
    const response = await fetch("http://localhost:3000/api/shift_management/Morning_shift_load", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });
    return await response.json(); 
}

export async function Evening_shift_load() { 
    const response = await fetch("http://localhost:3000/api/shift_management/Evening_shift_load", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });
    return await response.json(); 
}

export async function Night_shift_load() { 
    const response = await fetch("http://localhost:3000/api/shift_management/Night_shift_load", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });
    return await response.json(); 
}

export async function Weekly_Schedule_load(offset = 0) {
    const response = await fetch(`http://localhost:3000/api/shift_management/Weekly_Schedule_load?offset=${offset}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });
    return await response.json(); 
}

export async function Shift_Coverage_load(offset = 0) {
    const response = await fetch(`http://localhost:3000/api/shift_management/Shift_Coverage_load?offset=${offset}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });
    return await response.json();
}

// ShiftManagement_page.js

export async function Weekly_Schedule_edit(payload) {
  const response = await fetch("http://localhost:3000/api/shift_management/Weekly_Schedule_edit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  // Check if response is HTML/Error before parsing
  if (!response.ok) {
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const err = await response.json();
      throw new Error(err.error || "Failed to edit schedule");
    }
    throw new Error(`Server returned status ${response.status}`);
  }
  return await response.json(); 
}

