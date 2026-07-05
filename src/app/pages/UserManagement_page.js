// UserManagement_page.js

// UserManagement_page.js

// UserManagement_page.js

// UserManagement_page.js
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


// ... rest of your deleteUser, editUser, addUser functions stay exactly the same
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
    oldUser.status === newUser.status && 
    oldUser.password === newUser.password
  ) {
    return { success: false, message: "nothing changed" };
  }

  try {
    const response = await fetch("http://localhost:3000/api/user_management/edit_user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        new_username: newUser.username, // Include username identifier context for updates
        old_username: oldUser.username,
        name: newUser.name,
        role: newUser.role,
        email: newUser.email,
        password : newUser.password
      })
    });
    const check = await response.json();
    if (check === "success") {
      return { success: true };
    } else {
      return { success: false, message: "error can not edit user" };
    }
  } catch (error) {
    return { success: false, message: "Network error" };
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
        new_role: newUser.role,
        email: newUser.email,
        password : newUser.password
      })
    });
    const check = await response.json();
    if (check === "success") {
      return { success: true };
    } else {
      return { success: false, message: "error can not add user" };
    }
  } catch (error) {
    return { success: false, message: "Network error" };
  }
}

