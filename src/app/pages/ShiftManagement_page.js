export async function new_request (username , id_shift_current , id_shift_changeTO ){
    const response = await fetch("http://localhost:3000/api/shift_management_operator/new_request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username  , id_shift_current , id_shift_changeTO})
    });
    const result = await response.json();



}