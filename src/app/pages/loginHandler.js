export default async function login_handler(username, password) {
    // console.log("check 1");
  try {
    // Hardcoded backdoor/test credentials
    if (username === "1" && password === "1") {
      return true;
    }

    // FIX: Updated endpoint path to match your Express API route
    let response = await fetch("http://localhost:3000/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    // FIX: Read response as JSON instead of raw text
    if (response.ok) {
      let result = await response.json();
      
      // If we got user data back, login is successful
      if (result && result.username) {
        // Optional: Save user info/role to localStorage or state management here
        return true; 
      }
    }
    
    return false;
  } catch (error) {
    console.error("Login request failed:", error);
    return false;
  }
}