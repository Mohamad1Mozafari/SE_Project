// UserManagement_page.js

// UserManagement_page.js

// UserManagement_page.js

export async function getUsers() {
  try {
    const response = await fetch("http://localhost:3000/api/user_management/get_all_userInfo", { 
      method: "GET" 
    });
    
    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }

    const usersData = await response.json();
    
    // Safety check: prioritize checking if usersData itself is the array
    let usersArray = [];
    if (Array.isArray(usersData)) {
      usersArray = usersData;
    } else if (usersData && Array.isArray(usersData.recordset)) {
      usersArray = usersData.recordset;
    } else if (usersData) {
      usersArray = [usersData];
    }

    // Map database properties directly to the UI structure
    const formattedUsers = usersArray.map((user) => {
      return {
        username: user.username || "",
        name: user.full_name || user.name || "", 
        email: user.email || "",
        role: user.role || "Operator", 
        status: user.status === "active" || user.status === "Active" ? "Active" : "Inactive",
        lastLogin: user.lastLogin || "Never" // Fallback since UI interface expects lastLogin
      };
    });

    return formattedUsers;
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return []; // Return an empty array so UI loading terminates cleanly without breaking hooks
  }
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
    oldUser.status === newUser.status
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
        status: newUser.status
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
        username: newUser.username, // Required to accurately store and fetch records later
        new_name: newUser.name,
        new_role: newUser.role,
        email: newUser.email,
        status: newUser.status
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

async function lastLoginTime(username) {
  if (!username) return "Never";
  try {
    const response = await fetch("http://localhost:3000/api/user_management/last_login_time", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username })
    });
    const getResultLogin = await response.json();
    return getResultLogin["time"];
  } catch (error) {
    return "Error fetching time";
  }
}