// UserManagement_page.js

export async function getUsers() {
  const response = await fetch("http://localhost:3000/api/user_management/get_all_userInfo", { 
    method: "GET" 
  });
  
  if (!response.ok) {
    throw new Error(`Server responded with status: ${response.status}`);
  }

  const usersData = await response.json();
  return usersData; 
}

export async function deleteUser(username) {
  try {
    const response = await fetch("http://localhost:3000/api/user_management/delete_user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username })
    });
    const result = await response.json();
    return result === "success";
  } catch (error) {
    console.error("Delete user error:", error);
    return false;
  }
}

export async function editUser(oldUser, newUser) {
  if (
    oldUser.username === newUser.username &&
    oldUser.name === newUser.name &&
    oldUser.role === newUser.role &&
    oldUser.email === newUser.email &&
    (!newUser.password || newUser.password === "")
  ) {
    return { success: false, message: "No data modifications detected." };
  }

  try {
    const response = await fetch("http://localhost:3000/api/user_management/edit_user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        old_username: oldUser.username,
        new_username: newUser.username, 
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        password: newUser.password || "" 
      })
    });
    const check = await response.json();
    if (check === "success") {
      return { success: true };
    } else {
      return { success: false, message: "Database rejected profile parameter updates." };
    }
  } catch (error) {
    return { success: false, message: "Network connection failure." };
  }
}

export async function addUser(newUser) {
  try {
    const response = await fetch("http://localhost:3000/api/user_management/add_user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: newUser.username, 
        new_name: newUser.name,
        email: newUser.email,
        new_role: newUser.role,
        password: newUser.password
      })
    });
    const check = await response.json();
    if (check === "success") {
      return { success: true };
    } else {
      return { success: false, message: "Server error: Check if username already exists." };
    }
  } catch (error) {
    return { success: false, message: "Network connection failure." };
  }
}