// ShiftChangeRequest_operator_view.js
import { get_user_name } from "./USername_role.js"; 

export async function new_request(id_shift_current, shiftDate, shiftType) {
  let username = get_user_name();
  const response = await fetch("http://localhost:3000/api/shift_change_reuqest_operator/new_request", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, id_shift_current, shiftDate, shiftType })
  });
  return await response.json();
}

export async function current_shift_load() {
  let username = get_user_name();
  const response = await fetch("http://localhost:3000/api/shift_change_reuqest_operator/current_sift", { 
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username })
  });
  return await response.json();
}

export async function requested_shift_load() {
  let username = get_user_name();
  const response = await fetch("http://localhost:3000/api/shift_change_reuqest_operator/requested_shift", { 
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username })
  });
  const data = await response.json();
  return data || []; // Return empty array if null/undefined
}

export async function pending_request() {
  let username = get_user_name();
  const response = await fetch("http://localhost:3000/api/shift_change_reuqest_operator/pending_request", { 
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username })
  });
  return await response.json();
}

export async function aproved_request() {
  let username = get_user_name();
  const response = await fetch("http://localhost:3000/api/shift_change_reuqest_operator/aproved_request", { 
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username })
  });
  return await response.json();
}

export async function rejected_request() {
  let username = get_user_name();
  // FIXED: Changed from /aproved_request to /rejected_request
  const response = await fetch("http://localhost:3000/api/shift_change_reuqest_operator/rejected_request", { 
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username })
  });
  return await response.json();
}