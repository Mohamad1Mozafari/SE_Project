// loginHandler.js
import { set_user_name, set_role } from "./USername_role.js"; 

export default async function login_handler(username, password) {
  try {
    // Hardcoded backdoor/test credentials (remove in production!)
    if (username === "1" && password === "1") {
      set_user_name("test_user");
      set_role("admin");
      return true;
    }

    let response = await fetch("http://localhost:3000/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      let result = await response.json();
      
      // Check if we received a valid user and role from the server
      if (result && result.username && result.role) {
        set_role(result.role);        // Saves to sessionStorage
        set_user_name(result.username);  // Saves to sessionStorage
        return true; 
      }
    }
    
    return false;
  } catch (error) {
    console.error("Login request failed:", error);
    return false;
  }
}