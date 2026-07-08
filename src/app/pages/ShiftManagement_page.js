export async function new_request (username , id_shift_current , id_shift_changeTO ){
    const response = await fetch("http://localhost:3000/api/shift_management/new_request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username  , id_shift_current , id_shift_changeTO})
    });
    const result = await response.json();



}
export async function current_shift_load (username){
  const response = await fetch("http://localhost:3000/api/shift_management/current_sift", { 
    method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username })
  });
const result = await response.json();
return result;
}


export async function requested_shift_load (username){
  const response = await fetch("http://localhost:3000/api/shift_management/requested_shift", { 
    method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username })
  });
const result = await response.json();
return result;
}


export async function pending_request (username){
  const response = await fetch("http://localhost:3000/api/shift_management/pending_request", { 
    method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username })
  });
const result = await response.json();
return result;
}
export async function aproved_request (){

}
export async function rejected_request (){

}

