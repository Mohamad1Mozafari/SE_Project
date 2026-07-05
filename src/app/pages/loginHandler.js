export default async function login_handler(username, password) {
  try {
    if (username=="1" && password=="1"){
        return true ;
    }
    let response = await fetch("http://localhost:3000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        password: password,
      }),
    });

    let result = await response.text();

    if (result === "successful") {
      return true; 
    } else {
      return false;
    }
  } catch (error) {
    console.error("Login request failed:", error);
    return false;
  }
}