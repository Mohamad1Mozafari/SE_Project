// UserManagement_page.js

export async function getUsers() {
  const response = await fetch("http://localhost:3000/api/user_management/get_all_userInfo", { 
    method: "GET" 
  });
  
  if (!response.ok) {
    throw new Error(`Server responded with status: ${response.status}`);
  }

  return await response.json(); 
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
  const passwordChanged = newUser.password?.trim();
  console.log ("$$$$$$$$$$$$$this is massage to see ")
  // 1. Simplified and safe modification checker
  if (
    oldUser.name === newUser.name &&
    oldUser.role === newUser.role &&
    oldUser.email === newUser.email &&
    !passwordChanged
  ) {
    return { success: false, message: "No data modifications detected." };
  }

  try {
    const response = await fetch("http://localhost:3000/api/user_management/edit_user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: oldUser.username,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        password: passwordChanged || ""
      })
    });

    const check = await response.json();

    // 2. Align parsing with the actual JSON structure returned by server
    if (response.ok && check.success) {
      return { success: true };
    } else {
      return { 
        success: false, 
        message: check.message || "Database rejected profile parameter updates." 
      };
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
    } else if (check === "failed username is used") {
      return { success: false, message: "Username is already taken. Choose another one." };
    } else {
      return { success: false, message: "Server error occurred while adding user." };
    }
  } catch (error) {
    return { success: false, message: "Network connection failure." };
  }
}