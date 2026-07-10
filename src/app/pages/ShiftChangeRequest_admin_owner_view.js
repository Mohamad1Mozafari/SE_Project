export async function pending_request() {
  const response = await fetch("http://localhost:3000/api/shift_management/pending_request_all", { 
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  return await response.json();
}

export async function aproved_request() {
  const response = await fetch("http://localhost:3000/api/shift_management/aproved_request_all", { 
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  return await response.json();
}

export async function rejected_request() {
  // FIXED: Changed from /aproved_request_all to /rejected_request_all
  const response = await fetch("http://localhost:3000/api/shift_management/rejected_request_all", { 
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  return await response.json();
}

export async function pending_request_approve_button(shiftchangerequestID) {
  const response = await fetch("http://localhost:3000/api/shift_management/pending_request_approve_button", { 
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ shiftchangerequestID })
  });
  return await response.json();
}

export async function pending_request_reject_button(shiftchangerequestID) {
  const response = await fetch("http://localhost:3000/api/shift_management/pending_request_reject_button", { 
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ shiftchangerequestID })
  });
  return await response.json();
}